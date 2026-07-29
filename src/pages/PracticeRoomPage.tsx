import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Square, Eye, Gauge, MessageCircleWarning } from "lucide-react";
import { Button, Modal } from "../components/ui";
import { useSessionStore } from "../store/sessionStore";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { usePoseLandmarker } from "../hooks/usePoseLandmarker";
import { useHandLandmarker, HAND_CONNECTIONS } from "../hooks/useHandLandmarker";
import { useSpeechAnalyzer } from "../hooks/useSpeechAnalyzer";
import { EyeContactRing } from "../components/practice/EyeContactRing";
import { PostureAlertToast } from "../components/practice/PostureAlertToast";
import { TeleprompterPanel } from "../components/practice/TeleprompterPanel";
import { calculateScriptAccuracy } from "../lib/scriptAccuracy";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

export default function PracticeRoomPage() {
  const { t } = useTranslation("practice");
  const navigate = useNavigate();

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const hasStartedRef = useRef(false);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentPostureFlag, setCurrentPostureFlag] = useState<
    "slouch" | "fidget" | "passive_hands" | null
  >(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const {
    targetDurationSeconds,
    scriptTitle,
    scriptContent,
    isRecording,
    elapsedSeconds,
    isEyeContactGood,
    currentWpm,
    fillerWordCount,
    setRecording,
    setElapsedSeconds,
    updateEyeContact,
    updatePosture,
    setRecordedBlobUrl,
  } = useSessionStore();

  // AI hooks — Face, Pose, and 5-Finger Hand Landmarker
  const { isLoaded: isFaceReady, detectFrame: detectFace } = useFaceLandmarker();
  const {
    isLoaded: isPoseReady,
    detectFrame: detectPose,
    resetCalibration,
  } = usePoseLandmarker();
  const { isLoaded: isHandReady, detectFrame: detectHand } = useHandLandmarker();
  const { transcript } = useSpeechAnalyzer(); // starts/stops listening based on isRecording in store

  const remainingSeconds = Math.max(0, targetDurationSeconds - elapsedSeconds);
  const isOneMinuteWarning = remainingSeconds <= 60 && remainingSeconds > 0;

  // ── 1. Camera Ready ─────────────────────────────────────────
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.warn("[Webcam] Permission denied or device unavailable:", err);
    setIsCameraReady(true);
  }, []);

  // ── 2. Start Recording (once camera is ready) ───────────────
  useEffect(() => {
    if (!isCameraReady || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startTimer = setTimeout(() => {
      resetCalibration();

      const stream = webcamRef.current?.stream;
      if (stream) {
        try {
          recordedChunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            setRecordedBlobUrl(URL.createObjectURL(blob));
          };
          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn("[MediaRecorder] Could not start recording:", recErr);
        }
      }

      setRecording(true);
    }, 500);

    return () => clearTimeout(startTimer);
  }, [isCameraReady, resetCalibration, setRecording, setRecordedBlobUrl]);

  // ── 3. Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      const next = useSessionStore.getState().elapsedSeconds + 1;
      setElapsedSeconds(next);
      if (next >= targetDurationSeconds) setShowFinishModal(true);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, targetDurationSeconds, setElapsedSeconds]);

  // ── 4. AI Detection Loop (5-Finger Hand + Shoulder & Pose + Face) ──────
  useEffect(() => {
    if (!isRecording) return;

    let animId: number;
    let lastTime = 0;
    let cachedHands: any[] = [];
    let cachedPose: any[] = [];

    const loop = (now: number) => {
      if (now - lastTime >= 80) { // ~12 fps
        lastTime = now;
        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;

        if (video && video.readyState >= 2) {
          if (canvas) {
            const vw = video.videoWidth || 640;
            const vh = video.videoHeight || 480;
            if (canvas.width !== vw || canvas.height !== vh) {
              canvas.width = vw;
              canvas.height = vh;
            }
          }

          // Face (eye contact)
          if (isFaceReady) {
            const r = detectFace(video, now);
            if (r) updateEyeContact(r.isEyeContactGood);
          }

          // Pose (posture & shoulders)
          if (isPoseReady) {
            const r = detectPose(video, now);
            if (r) {
              updatePosture(r.isPostureGood, r.flag);
              if (!r.isPostureGood && r.flag) setCurrentPostureFlag(r.flag);
              if (r.landmarks) cachedPose = r.landmarks;
            }
          }

          // 5-Finger Hand Landmark Detection
          if (isHandReady) {
            const hr = detectHand(video, now);
            if (hr && hr.landmarks) {
              cachedHands = hr.landmarks;
            }
          }

          // Render Skeleton Canvas (Shoulders + 5-Finger Hands)
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              if (showSkeleton) {
                // A. Render Shoulder & Arm Posture Skeleton
                if (cachedPose.length > 0) {
                  ctx.strokeStyle = "#00E676"; // Neon success green
                  ctx.lineWidth = 4;
                  ctx.lineCap = "round";

                  // Shoulder line & arm lines: [11-12], [11-13], [13-15], [12-14], [14-16]
                  const armLines = [
                    [11, 12],
                    [11, 13],
                    [13, 15],
                    [12, 14],
                    [14, 16],
                  ];
                  ctx.beginPath();
                  for (const [sIdx, eIdx] of armLines) {
                    const a = cachedPose[sIdx];
                    const b = cachedPose[eIdx];
                    if (a && b && (a.visibility === undefined || a.visibility > 0.3)) {
                      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                    }
                  }
                  ctx.stroke();

                  // Draw Shoulder & Elbow Joint Nodes
                  const shoulderNodes = [11, 12, 13, 14];
                  for (const idx of shoulderNodes) {
                    const pt = cachedPose[idx];
                    if (pt && (pt.visibility === undefined || pt.visibility > 0.3)) {
                      ctx.beginPath();
                      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 7, 0, Math.PI * 2);
                      ctx.fillStyle = "#FFEB3B"; // Glowing yellow node
                      ctx.fill();
                      ctx.strokeStyle = "#1A1A1A";
                      ctx.lineWidth = 2;
                      ctx.stroke();
                    }
                  }
                }

                // B. Render 5-Finger Hand Skeletons
                if (cachedHands.length > 0) {
                  for (const hand of cachedHands) {
                    // Draw 21-landmark 5-finger bone connections
                    ctx.strokeStyle = "#FFEB3B"; // Neubrutalist yellow
                    ctx.lineWidth = 3;
                    ctx.lineCap = "round";
                    ctx.beginPath();

                    for (const [si, ei] of HAND_CONNECTIONS) {
                      const a = hand[si];
                      const b = hand[ei];
                      if (a && b) {
                        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                      }
                    }
                    ctx.stroke();

                    // Draw 21 finger joint nodes
                    for (let i = 0; i < hand.length; i++) {
                      const pt = hand[i];
                      const cx = pt.x * canvas.width;
                      const cy = pt.y * canvas.height;
                      const isFingertip = [4, 8, 12, 16, 20].includes(i);

                      ctx.beginPath();
                      ctx.arc(cx, cy, isFingertip ? 6 : 4, 0, Math.PI * 2);
                      ctx.fillStyle = isFingertip ? "#FFEB3B" : "#00E676";
                      ctx.fill();
                      ctx.strokeStyle = "#1A1A1A";
                      ctx.lineWidth = 1.5;
                      ctx.stroke();
                    }
                  }
                }
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    isRecording,
    isFaceReady,
    isPoseReady,
    isHandReady,
    showSkeleton,
    detectFace,
    detectPose,
    detectHand,
    updateEyeContact,
    updatePosture,
  ]);

  // ── 5. Stop Session ─────────────────────────────────────────

  const handleStopSession = useCallback(() => {
    if (!isRecording) return;
    hasStartedRef.current = false;
    setRecording(false);
    
    // Compute Script Accuracy if there's a script
    if (scriptContent) {
      const accuracyResult = calculateScriptAccuracy(scriptContent, transcript);
      useSessionStore.getState().setScriptAccuracy(accuracyResult.accuracyPercentage);
    } else {
      useSessionStore.getState().setScriptAccuracy(null);
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      setShowFinishModal(true);
    }
    webcamRef.current?.stream
      ?.getTracks()
      .forEach((track) => track.stop());
    navigate("/scorecard/new");
  }, [setRecording, navigate, scriptContent, transcript]);

  // ── Helpers ─────────────────────────────────────────────────
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getWpmColor = (wpm: number) => {
    if (wpm === 0) return "bg-white text-neutral";
    if (wpm >= 100 && wpm <= 160) return "bg-success text-neutral";
    if (wpm > 160) return "bg-warning text-neutral";
    return "bg-tertiary text-white";
  };

  // ── Loading overlay (shown until camera connects) ──────────
  const showLoading = !isCameraReady;

  return (
    <motion.div
      {...pageTransition}
      className={`min-h-[100dvh] transition-colors duration-1000 ${
        isOneMinuteWarning ? "bg-black" : "bg-neutral"
      }`}
    >
      {/* Loading overlay */}
      {showLoading && (
        <div className="fixed inset-0 z-modal bg-neutral/90 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-primary animate-blink-block-1" />
            <div className="w-3 h-3 bg-primary animate-blink-block-2" />
            <div className="w-3 h-3 bg-primary animate-blink-block-3" />
          </div>
          <p className="text-white/60 text-sm font-bold">
            {t("room.loading", "Preparing AI Coach...")}
          </p>
        </div>
      )}

      <main className="max-w-content mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100dvh-2rem)]">
          {/* Camera Stage (65%) */}
          <div className="lg:col-span-8 relative flex flex-col justify-center">
            <div
              className="w-full h-full rounded-neu-lg border-4 border-white/20 bg-neutral/90 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.5)" }}
            >
              <Webcam
                ref={webcamRef}
                audio={true}
                muted={true}
                mirrored={true}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "user" }}
              />

              {/* Hand skeleton overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[5]"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Eye Contact Ring */}
              <EyeContactRing isGood={isEyeContactGood} />

              {/* Posture Alert */}
              <PostureAlertToast flag={currentPostureFlag} />

              {/* Live Metric Chips — Top Left */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <div
                  className={`px-3 py-1.5 rounded-neu border-3 border-neutral shadow-neu-sm flex items-center gap-2 ${getWpmColor(
                    currentWpm
                  )}`}
                >
                  <Gauge size={16} />
                  <span className="label-caps">
                    {t("room.wpm", "WPM")}
                  </span>
                  <span className="mono-display text-base ml-1">
                    {currentWpm > 0 ? currentWpm : "--"}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-neu border-3 border-neutral bg-white text-neutral shadow-neu-sm flex items-center gap-2">
                  <MessageCircleWarning
                    size={16}
                    className="text-secondary"
                  />
                  <span className="label-caps text-secondary">
                    {t("room.fillers", "FILLERS")}
                  </span>
                  <span className="mono-display text-base text-neutral ml-1">
                    {fillerWordCount}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-neu border-3 border-neutral shadow-neu-sm flex items-center gap-2 ${
                    isEyeContactGood
                      ? "bg-success text-neutral"
                      : "bg-secondary text-white"
                  }`}
                >
                  <Eye size={16} />
                  <span className="label-caps">
                    {isEyeContactGood ? "Eye OK" : "Look Up"}
                  </span>
                </div>
              </div>

                {/* Countdown Timer & Skeleton Toggle — Top Right */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-3 py-1.5 rounded-neu border-3 border-neutral shadow-neu-sm text-xs font-bold transition-all ${
                    showSkeleton
                      ? "bg-primary text-neutral"
                      : "bg-white/80 dark:bg-card-dark text-neutral/70 dark:text-white/70"
                  }`}
                  title="Toggle Arm/Hand Skeleton Overlay"
                >
                  {showSkeleton ? "Skeleton ON" : "Skeleton OFF"}
                </button>

                <div
                  className={`px-3 py-1.5 rounded-neu border-3 border-neutral shadow-neu-sm font-bold flex items-center gap-2 ${
                    isOneMinuteWarning
                      ? "bg-warning text-neutral animate-pulse"
                      : "bg-white text-neutral"
                  }`}
                >
                  <span className="label-caps">
                    {t("room.timer", "TIME")}
                  </span>
                  <span className="mono-display text-lg">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
              </div>

              {/* Live Transcript (Subtitles) - Bottom */}
              {isRecording && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 max-w-lg z-10 pointer-events-none">
                  <div className="bg-neutral/80 backdrop-blur-md rounded-neu-lg border-2 border-white/20 p-3 shadow-neu text-center">
                    <p className="text-white font-medium text-sm md:text-base leading-relaxed h-12 overflow-hidden flex items-end justify-center">
                      {transcript.trim().length > 0 ? (
                         <span className="animate-fade-in">
                           {/* Get last 15 words of transcript to show as subtitles */}
                           {(() => {
                              const words = transcript.trim().split(/\s+/);
                              return words.slice(-15).join(" ");
                           })()}
                         </span>
                      ) : (
                        <span className="text-white/50 italic animate-pulse">
                          {t("room.listening", "Listening for speech...")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel (35%) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <TeleprompterPanel
              scriptTitle={scriptTitle}
              scriptContent={scriptContent}
              isRecording={isRecording}
            />

            <Button
              variant="danger"
              size="lg"
              fullWidth
              leftIcon={<Square size={18} />}
              onClick={handleStopSession}
            >
              {t("room.stopSession", "End Session")}
            </Button>
          </div>
        </div>
      </main>

      {/* Time's Up Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Time's Up!"
      >
        <div className="space-y-4 text-center">
          <p className="text-neutral/70 dark:text-white/70">
            You've reached your target duration! Ready to see your scorecard?
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStopSession}
          >
            See Scorecard
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
