import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw, Eye, Gauge, MessageCircleWarning, Shield, Play } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useSessionStore } from "../store/sessionStore";
import { calculateScorecard } from "../lib/scoring";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

export default function ScorecardPage() {
  const { t } = useTranslation("scorecard");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isNewSession = id === "new";

  const {
    mode,
    targetDurationSeconds,
    scriptTitle,
    scriptContent,
    scriptAccuracy,
    elapsedSeconds,
    eyeContactGoodSec,
    eyeContactBadSec,
    eyeContactFlags,
    postureFlags,
    fillerWordCount,
    fillerWordTimestamps,
    avgWpm,
    wpmSamples,
    recordedBlobUrl,
    resetSession,
  } = useSessionStore();

  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const isCompleted = elapsedSeconds >= targetDurationSeconds;

  // Calculate live scores for current completed session
  const calculated = calculateScorecard({
    durationActualSeconds: elapsedSeconds,
    eyeContactGoodSec,
    eyeContactBadSec,
    fillerWordCount,
    avgWpm,
    postureFlagsCount: postureFlags.length,
    scriptAccuracy: scriptAccuracy ?? undefined,
  });

  // Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mode,
        durationTarget: targetDurationSeconds,
        durationActual: Math.max(elapsedSeconds, 1),
        eyeContactGoodSec,
        eyeContactBadSec,
        fillerWordCount,
        fillerWordTimestamps,
        avgWpm,
        wpmSamples,
        postureFlags,
        scriptAccuracy: scriptAccuracy ?? undefined,
      };

      const res = await api.post("/api/sessions", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      setSavedSessionId(data.id);
    },
    onError: (err) => {
      console.warn("[Scorecard] Failed to save session to backend:", err);
    },
  });

  // Save to backend once when navigating from a new session, ONLY if completed
  useEffect(() => {
    const isReadyToSave = isNewSession && !savedSessionId && !saveSessionMutation.isPending && isCompleted;
    if (isReadyToSave) {
      saveSessionMutation.mutate(undefined, {
        onError: (err) => {
          console.error("[Scorecard] Failed to save session, user can still review offline.", err);
        }
      });
    }
  }, [isNewSession, savedSessionId, saveSessionMutation, isCompleted]);

  // Fetch historical session if viewing by ID
  const { data: dbSession } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const res = await api.get(`/api/sessions/${id}`);
      return res.data.data;
    },
    enabled: !isNewSession && !!id,
  });

  const handleReturnDashboard = () => {
    resetSession();
    navigate("/dashboard");
  };

  if (!isNewSession && !dbSession) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-1" />
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-2" />
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-3" />
        </div>
      </div>
    );
  }

  // Displayed scores (from DB if historical, or calculated if new)
  const totalScore = dbSession?.scorecard?.totalScore ?? calculated.totalScore;
  const bodyLanguageScore = dbSession?.scorecard?.bodyLanguageScore ?? calculated.bodyLanguageScore;
  const voiceFluencyScore = dbSession?.scorecard?.voiceFluencyScore ?? calculated.voiceFluencyScore;

  const handlePracticeAgain = () => {
    resetSession();
    navigate("/practice/setup");
  };

  return (
    <motion.div {...pageTransition}>
      {/* Navbar Minimal */}
      <header className="border-b-4 border-neutral bg-surface dark:bg-surface-dark px-app-gap py-4 sticky top-0 z-50 flex items-center">
        <button
          onClick={handleReturnDashboard}
          className="p-2 -ml-2 rounded-full hover:bg-neutral/10 dark:hover:bg-white/10 transition-colors text-neutral dark:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold ml-2">Practice Results</h1>
      </header>

      <main className="max-w-3xl mx-auto px-app-gap py-8 space-y-8">
        
        {/* Early End Warning Banner */}
        {isNewSession && !isCompleted && (
          <div className="bg-warning/20 border-2 border-warning text-neutral dark:text-white rounded-neu p-4 flex items-start gap-3 shadow-neu-sm">
            <MessageCircleWarning className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Session Ended Early</h3>
              <p className="text-xs opacity-80 mt-1">
                You didn't reach your target duration ({Math.floor(targetDurationSeconds / 60)} min). This session will not be saved to your progress and won't count towards your streak.
              </p>
            </div>
          </div>
        )}

        {/* Total Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
        >
          <Card className="text-center py-10 shadow-neu-lg border-3 border-neutral bg-primary/10">
            <p className="label-caps text-neutral/60 dark:text-white/50 mb-2">
              {t("totalScore", "Overall Score")}
            </p>
            <p className="mono-display text-display-score text-neutral dark:text-white">
              {totalScore}
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
          </Card>
        </motion.div>

        {/* Score Breakdown Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-3 border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-success" />
              <p className="label-caps text-neutral/70 dark:text-white/60">
                {t("bodyLanguage", "Body Language Score")}
              </p>
            </div>
            <p className="mono-display text-3xl text-neutral dark:text-white mb-3">
              {bodyLanguageScore}
            </p>
            <div className="w-full h-4 border-2 border-neutral rounded-sm overflow-hidden bg-neutral/10 dark:bg-white/10">
              <div
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${bodyLanguageScore}%` }}
              />
            </div>
          </Card>

          <Card className="border-3 border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={18} className="text-tertiary" />
              <p className="label-caps text-neutral/70 dark:text-white/60">
                {t("voiceFluency", "Voice & Fluency Score")}
              </p>
            </div>
            <p className="mono-display text-3xl text-neutral dark:text-white mb-3">
              {voiceFluencyScore}
            </p>
            <div className="w-full h-4 border-2 border-neutral rounded-sm overflow-hidden bg-neutral/10 dark:bg-white/10">
              <div
                className="h-full bg-tertiary transition-all duration-500"
                style={{ width: `${voiceFluencyScore}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <Eye size={20} className="mx-auto mb-1 text-tertiary" />
            <span className="label-caps text-neutral/50 dark:text-white/40 block text-[10px]">
              Eye Contact
            </span>
            <span className="mono-display text-xl text-neutral dark:text-white">
              {calculated.eyeContactPercentage}%
            </span>
          </Card>

          <Card className="text-center p-4">
            <Gauge size={20} className="mx-auto mb-1 text-success" />
            <span className="label-caps text-neutral/50 dark:text-white/40 block text-[10px]">
              Avg WPM
            </span>
            <span className="mono-display text-xl text-neutral dark:text-white">
              {dbSession?.avgWpm ?? avgWpm}
            </span>
          </Card>

          <Card className="text-center p-4">
            <MessageCircleWarning size={20} className="mx-auto mb-1 text-secondary" />
            <span className="label-caps text-neutral/50 dark:text-white/40 block text-[10px]">
              Fillers
            </span>
            <span className="mono-display text-xl text-neutral dark:text-white">
              {dbSession?.fillerWordCount ?? fillerWordCount}
            </span>
          </Card>

          <Card className="text-center p-4">
            <Shield size={20} className="mx-auto mb-1 text-warning" />
            <span className="label-caps text-neutral/50 dark:text-white/40 block text-[10px]">
              Posture Flags
            </span>
            <span className="mono-display text-xl text-neutral dark:text-white">
              {postureFlags.length}
            </span>
          </Card>
        </div>
        
        {scriptAccuracy !== null && (
          <Card className="border-3 border-neutral bg-tertiary/10 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral dark:text-white text-sm">Script Accuracy</h3>
              <p className="text-xs text-neutral/60 dark:text-white/50">Percentage of exact matched words from script</p>
            </div>
            <div className="mono-display text-2xl font-black text-tertiary">
              {scriptAccuracy}%
            </div>
          </Card>
        )}

        {/* Video Replay */}
        <Card className="border-3 border-neutral">
          <h3 className="font-bold text-neutral dark:text-white mb-4">
            {t("videoReplay", "Video Replay & Markers")}
          </h3>

          {recordedBlobUrl ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-neu overflow-hidden border-2 border-neutral">
                <video
                  src={recordedBlobUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Timestamp Markers */}
              {(fillerWordTimestamps.length > 0 || postureFlags.length > 0 || eyeContactFlags.length > 0) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral/60 dark:text-white/50 uppercase">
                    Detected Flag Markers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {postureFlags.map((flag, idx) => (
                      <div
                        key={`posture-${idx}`}
                        className="px-2.5 py-1 rounded-neu border-2 border-neutral bg-warning/20 text-xs font-bold text-neutral dark:text-white flex items-center gap-1"
                      >
                        <Shield size={12} className="text-warning" />
                        <span>
                          {flag.type} at {Math.floor(flag.atSecond / 60)}:
                          {(flag.atSecond % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                    {eyeContactFlags.map((flag, idx) => (
                      <div
                        key={`eye-${idx}`}
                        className="px-2.5 py-1 rounded-neu border-2 border-neutral bg-tertiary/20 text-xs font-bold text-tertiary flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>
                          Looked Away at {Math.floor(flag.atSecond / 60)}:
                          {(flag.atSecond % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                    {fillerWordTimestamps.map((filler, idx) => (
                      <div
                        key={`filler-${idx}`}
                        className="px-2.5 py-1 rounded-neu border-2 border-neutral bg-secondary/10 text-xs font-bold text-secondary flex items-center gap-1"
                      >
                        <MessageCircleWarning size={12} />
                        <span>
                          "{filler.word}" at {Math.floor(filler.atSecond / 60)}:
                          {(filler.atSecond % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-neutral/5 dark:bg-white/5 rounded-neu border-2 border-neutral/20 flex flex-col items-center justify-center p-6 text-center">
              <Play size={40} className="text-neutral/20 dark:text-white/20 mb-2" />
              <p className="text-neutral/40 dark:text-white/30 text-sm">
                No video recording saved for this session
              </p>
            </div>
          )}
        </Card>

        {/* Action button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<RotateCcw size={18} />}
          onClick={handlePracticeAgain}
        >
          {t("practiceAgain", "Start New Practice Session")}
        </Button>
      </main>
    </motion.div>
  );
}
