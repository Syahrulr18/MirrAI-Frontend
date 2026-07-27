import { useRef, useState, useEffect, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export interface HandLandmarkPoint {
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
  z: number;
}

export interface HandDetectionResult {
  landmarks: HandLandmarkPoint[][];
}

// 21-landmark 5-finger connections
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17],
];

export function useHandLandmarker() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initHandLandmarker() {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );

        if (!isMounted) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        if (isMounted) {
          handLandmarkerRef.current = landmarker;
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn("[MediaPipe HandLandmarker] Load warning:", err);
        if (isMounted) {
          setError("Failed to load HandLandmarker");
          setIsLoading(false);
        }
      }
    }

    initHandLandmarker();

    return () => {
      isMounted = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  const detectFrame = useCallback(
    (video: HTMLVideoElement, timestampMs: number): HandDetectionResult | null => {
      if (!handLandmarkerRef.current || !video || video.readyState < 2) {
        return null;
      }

      try {
        const results = handLandmarkerRef.current.detectForVideo(video, timestampMs);

        if (!results.landmarks || results.landmarks.length === 0) {
          return { landmarks: [] };
        }

        return {
          landmarks: results.landmarks as HandLandmarkPoint[][],
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
