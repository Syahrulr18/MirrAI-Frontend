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
    targetDurationMinutes,
    elapsedSeconds,
    eyeContactGoodSec,
    eyeContactBadSec,
    postureFlags,
    fillerWordCount,
    fillerWordTimestamps,
    avgWpm,
    wpmSamples,
    recordedBlobUrl,
    resetSession,
  } = useSessionStore();

  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  // Calculate live scores for current completed session
  const calculated = calculateScorecard({
    durationActualSeconds: elapsedSeconds,
    eyeContactGoodSec,
    eyeContactBadSec,
    fillerWordCount,
    avgWpm,
    postureFlagsCount: postureFlags.length,
  });

  // Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mode,
        durationTarget: targetDurationMinutes * 60,
        durationActual: Math.max(elapsedSeconds, 1),
        eyeContactGoodSec,
        eyeContactBadSec,
        fillerWordCount,
        fillerWordTimestamps,
        avgWpm,
        wpmSamples,
        postureFlags,
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

  // Save to backend once when navigating from a new session
  useEffect(() => {
    // If the user ended early, elapsedSeconds might be 0, but we still want to save it as 1 to record the session.
    const isReadyToSave = isNewSession && !savedSessionId && !saveSessionMutation.isPending;
    if (isReadyToSave) {
      saveSessionMutation.mutate(undefined, {
        onError: (err) => {
          console.error("[Scorecard] Failed to save session, user can still review offline.", err);
        }
      });
    }
  }, [isNewSession, savedSessionId, saveSessionMutation]);

  // Fetch historical session if viewing by ID
  const { data: dbSession } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      if (isNewSession) return null;
      const res = await api.get(`/api/sessions/${id}`);
      return res.data.data;
    },
    enabled: !isNewSession && !!id,
  });

  // Displayed scores (from DB if historical, or calculated if new)
  const totalScore = dbSession?.scorecard?.totalScore ?? calculated.totalScore;
  const bodyLanguageScore = dbSession?.scorecard?.bodyLanguageScore ?? calculated.bodyLanguageScore;
  const voiceFluencyScore = dbSession?.scorecard?.voiceFluencyScore ?? calculated.voiceFluencyScore;

  const handlePracticeAgain = () => {
    resetSession();
    navigate("/practice/setup");
  };

  return (
    <motion.div {...pageTransition} className="min-h-[100dvh] bg-surface dark:bg-surface-dark pb-16">
      <header className="border-b-3 border-neutral bg-white dark:bg-surface-dark">
        <div className="max-w-content mx-auto px-app-gap flex items-center justify-between h-16">
          <h1 className="text-lg font-bold text-neutral dark:text-white">
            {t("title", "Session Scorecard")}
          </h1>
          <Button variant="primary" size="sm" onClick={handlePracticeAgain} leftIcon={<RotateCcw size={16} />}>
            {t("practiceAgain", "Practice Again")}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-app-gap py-8 space-y-8">
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
              {(fillerWordTimestamps.length > 0 || postureFlags.length > 0) && (
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
