import { useRef, useState, useEffect, useCallback } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export interface PoseDetectionResult {
  isPostureGood: boolean;
  flag?: "slouch" | "fidget" | "passive_hands";
  landmarks?: { x: number; y: number; z: number }[];
}

export function usePoseLandmarker() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // Baseline calibration (recorded during first 3s)
  const baselineShoulderYRef = useRef<number | null>(null);
  const calibrationSamplesRef = useRef<number[]>([]);

  // Fidgeting detection window
  const centroidHistoryRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function initPoseLandmarker() {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );

        if (!isMounted) return;

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (isMounted) {
          poseLandmarkerRef.current = landmarker;
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn("[MediaPipe PoseLandmarker] GPU delegate fallback to CPU:", err);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
          );
          const landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });
          if (isMounted) {
            poseLandmarkerRef.current = landmarker;
            setIsLoaded(true);
            setIsLoading(false);
          }
        } catch (cpuErr: any) {
          if (isMounted) {
            console.error("[MediaPipe PoseLandmarker Error]", cpuErr);
            setError("Failed to load PoseLandmarker model");
            setIsLoading(false);
          }
        }
      }
    }

    initPoseLandmarker();

    return () => {
      isMounted = false;
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  const resetCalibration = useCallback(() => {
    baselineShoulderYRef.current = null;
    calibrationSamplesRef.current = [];
    centroidHistoryRef.current = [];
  }, []);

  const detectFrame = useCallback(
    (video: HTMLVideoElement, timestampMs: number): PoseDetectionResult | null => {
      if (!poseLandmarkerRef.current || !video || video.readyState < 2) {
        return null;
      }

      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, timestampMs);

        if (!results.landmarks || results.landmarks.length === 0) {
          return { isPostureGood: true };
        }

        const landmarks = results.landmarks[0];

        // Landmark indices:
        // 11: Left Shoulder, 12: Right Shoulder
        // 13: Left Elbow, 14: Right Elbow
        // 15: Left Wrist, 16: Right Wrist
        // 17: Left Pinky, 18: Right Pinky
        // 19: Left Index, 20: Right Index
        // 21: Left Thumb, 22: Right Thumb
        // 23: Left Hip, 24: Right Hip
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        if (!leftShoulder || !rightShoulder) {
          return { isPostureGood: true, landmarks };
        }

        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;

        // Auto-calibrate baseline (first 15 frames ~ 2s)
        if (calibrationSamplesRef.current.length < 15) {
          calibrationSamplesRef.current.push(avgShoulderY);
          const sum = calibrationSamplesRef.current.reduce((a, b) => a + b, 0);
          baselineShoulderYRef.current = sum / calibrationSamplesRef.current.length;
          return { isPostureGood: true, landmarks };
        }

        const baselineY = baselineShoulderYRef.current || avgShoulderY;

        // 1. Slouch Detection: Shoulders lower than baseline by > 0.08 normalized units
        if (avgShoulderY - baselineY > 0.08) {
          return { isPostureGood: false, flag: "slouch", landmarks };
        }

        // 2. Fidgeting Detection: Rapid centroid movement in rolling 20 frames
        const history = centroidHistoryRef.current;
        history.push({ x: avgShoulderX, y: avgShoulderY });
        if (history.length > 20) history.shift();

        if (history.length >= 10) {
          const varX =
            history.reduce((sum, p) => sum + Math.pow(p.x - avgShoulderX, 2), 0) /
            history.length;
          if (varX > 0.008) {
            return { isPostureGood: false, flag: "fidget", landmarks };
          }
        }

        // 3. Passive Hands: Wrists too close to hips or below hip line for long time
        if (leftHip && rightHip && leftWrist && rightWrist) {
          const avgHipY = (leftHip.y + rightHip.y) / 2;
          if (leftWrist.y > avgHipY && rightWrist.y > avgHipY) {
            // Wrists in pocket / passive
            return { isPostureGood: false, flag: "passive_hands", landmarks };
          }
        }

        return { isPostureGood: true, landmarks };
      } catch (err) {
        return null;
      }
    },
    []
  );

  return {
    isLoaded,
    isLoading,
    error,
    detectFrame,
    resetCalibration,
  };
}
