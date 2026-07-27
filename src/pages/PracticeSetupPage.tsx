import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Briefcase, Mic, FileText, CheckCircle2 } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useSessionStore } from "../store/sessionStore";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

const modes = [
  { key: "THESIS_DEFENSE", icon: GraduationCap, i18nKey: "thesisDefense" },
  { key: "JOB_INTERVIEW_PITCH", icon: Briefcase, i18nKey: "jobInterview" },
  { key: "PUBLIC_SPEECH", icon: Mic, i18nKey: "publicSpeech" },
] as const;

export default function PracticeSetupPage() {
  const { t, i18n } = useTranslation("practice");
  const navigate = useNavigate();
  const location = useLocation();
  const lang = i18n.language;

  const {
    mode,
    targetDurationMinutes,
    scriptTitle,
    scriptContent,
    setMode,
    setTargetDurationMinutes,
    setScript,
    resetSession,
  } = useSessionStore();

  const scriptIdFromState = location.state?.scriptId;

  // Fetch pre-selected script if provided
  const { data: prefilledScript } = useQuery({
    queryKey: ["script", scriptIdFromState],
    queryFn: async () => {
      if (!scriptIdFromState) return null;
      const res = await api.get(`/api/scripts/${scriptIdFromState}`);
      return res.data.data;
    },
    enabled: !!scriptIdFromState,
  });

  useEffect(() => {
    if (prefilledScript) {
      setScript(prefilledScript.title, prefilledScript.content);
    }
  }, [prefilledScript, setScript]);

  const handleStartSession = () => {
    navigate("/practice/room");
  };

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-3xl mx-auto px-app-gap pt-8 pb-20 md:pb-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-neutral dark:text-white mb-2">
            {t("setup.title", "Practice Setup")}
          </h1>
          <p className="text-neutral/60 dark:text-white/50">
            Configure your AI mirror session before stepping on stage
          </p>
        </header>

        {/* 1. Mode Selection */}
        <section>
          <h2 className="text-lg font-bold text-neutral dark:text-white mb-4">
            {t("setup.selectMode", "Select Practice Mode")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.key;
              return (
                <Card
                  key={m.key}
                  clickable
                  className={`text-center py-6 border-3 transition-all ${
                    isSelected
                      ? "border-neutral bg-primary/20 dark:bg-primary/10 shadow-neu"
                      : "border-neutral/30 hover:border-neutral"
                  }`}
                  onClick={() => setMode(m.key as any)}
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-neu border-2 border-neutral flex items-center justify-center ${
                      isSelected ? "bg-primary text-neutral" : "bg-neutral/5 dark:bg-white/5"
                    }`}
                  >
                    <Icon size={26} className={isSelected ? "text-neutral" : "text-neutral dark:text-white"} />
                  </div>
                  <p className="font-bold text-neutral dark:text-white text-sm">
                    {t(`modes.${m.i18nKey}`)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 2. Target Duration Selection */}
        <section>
          <h2 className="text-lg font-bold text-neutral dark:text-white mb-4">
            {t("setup.setDuration", "Target Duration (minutes)")}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[3, 5, 10, 15].map((min) => {
              const isSelected = targetDurationMinutes === min;
              return (
                <Card
                  key={min}
                  clickable
                  className={`text-center py-4 border-3 transition-all ${
                    isSelected
                      ? "border-neutral bg-primary shadow-neu scale-[1.02]"
                      : "border-neutral/30 hover:border-neutral opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setTargetDurationMinutes(min)}
                >
                  <span className="mono-display text-2xl text-neutral block font-extrabold">
                    {min}
                  </span>
                  <span className={`block text-xs font-extrabold mt-1 uppercase ${
                    isSelected ? "text-neutral/80" : "text-neutral/50 dark:text-white/40"
                  }`}>
                    min
                  </span>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 3. Script Selection Status */}
        <section>
          <h2 className="text-lg font-bold text-neutral dark:text-white mb-4">
            {t("setup.selectScript", "Selected Script")}
          </h2>
          {scriptTitle ? (
            <Card className="flex items-center justify-between border-3 border-neutral bg-success/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-neu border-2 border-neutral bg-success flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-neutral" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral dark:text-white">{scriptTitle}</h4>
                  <p className="text-xs text-neutral/60 dark:text-white/50">
                    Script loaded into Teleprompter
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScript("", "")}
              >
                Clear
              </Button>
            </Card>
          ) : (
            <Card className="flex items-center justify-between border-2 border-dashed border-neutral/40">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-neutral/40 dark:text-white/30" />
                <div>
                  <h4 className="font-bold text-neutral dark:text-white text-sm">
                    {t("setup.freestyle", "Freestyle Mode (No Script)")}
                  </h4>
                  <p className="text-xs text-neutral/50 dark:text-white/40">
                    You can speak freely or browse templates to load a script
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/templates")}
              >
                Browse Templates
              </Button>
            </Card>
          )}
        </section>

        {/* Action button */}
        <div className="pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartSession}
          >
            {t("setup.startSession", "Start Session →")}
          </Button>
        </div>
      </main>
    </motion.div>
  );
}
