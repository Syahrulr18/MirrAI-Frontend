import { useRef, useState, useEffect, useCallback } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

export interface FaceDetectionResult {
  isEyeContactGood: boolean;
  pitch: number; // Head inclination angle
  yaw: number;   // Head turn angle
}

export function useFaceLandmarker() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const downPitchStartRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initFaceLandmarker() {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );

        if (!isMounted) return;

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn("[MediaPipe FaceLandmarker] GPU delegate fallback to CPU:", err);
        try {
          // Fallback to CPU if GPU delegate fails
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
          );
          const landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
          });
          if (isMounted) {
            faceLandmarkerRef.current = landmarker;
            setIsLoaded(true);
            setIsLoading(false);
          }
        } catch (cpuErr: any) {
          if (isMounted) {
            console.error("[MediaPipe FaceLandmarker Error]", cpuErr);
            setError("Failed to load FaceLandmarker model");
            setIsLoading(false);
          }
        }
      }
    }

    initFaceLandmarker();

    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const detectFrame = useCallback(
    (video: HTMLVideoElement, timestampMs: number): FaceDetectionResult | null => {
      if (!faceLandmarkerRef.current || !video || video.readyState < 2) {
        return null;
      }

      try {
        const results = faceLandmarkerRef.current.detectForVideo(video, timestampMs);

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          return { isEyeContactGood: false, pitch: 0, yaw: 0 };
        }

        const landmarks = results.faceLandmarks[0];

        // Key landmarks:
        // 1: Nose tip, 33: Left eye outer, 263: Right eye outer
        // 10: Top forehead, 152: Chin bottom
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        if (!nose || !leftEye || !rightEye || !forehead || !chin) {
          return { isEyeContactGood: true, pitch: 0, yaw: 0 };
        }

        // Estimate Pitch (vertical tilt: looking down)
        // Midpoint of eyes vs nose tip vertical distance
        const eyeMidY = (leftEye.y + rightEye.y) / 2;
        const faceHeight = Math.abs(chin.y - forehead.y);
        const pitchRatio = (nose.y - eyeMidY) / (faceHeight || 1);

        // Pitch > 0.45 usually means head is tilted downwards (looking down)
        const isLookingDown = pitchRatio > 0.45 || nose.y > chin.y - 0.1;

        const now = performance.now();
        if (isLookingDown) {
          if (downPitchStartRef.current === null) {
            downPitchStartRef.current = now;
          }
        } else {
          downPitchStartRef.current = null;
        }

        // Trigger bad eye contact if looking down continuously for > 2.5 seconds
        const downDuration = downPitchStartRef.current
          ? (now - downPitchStartRef.current) / 1000
          : 0;

        const isEyeContactGood = downDuration < 2.5;

        return {
          isEyeContactGood,
          pitch: Math.round(pitchRatio * 100),
          yaw: Math.round((nose.x - (leftEye.x + rightEye.x) / 2) * 100),
        };
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
  };
}
