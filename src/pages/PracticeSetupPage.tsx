import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Briefcase, Mic, FileText, CheckCircle2 } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useSessionStore } from "../store/sessionStore";
import api from "../lib/api";

import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { TimerPicker } from "../components/ui";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// pageTransition...
const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

const modes = [
  { key: "THESIS_DEFENSE", icon: GraduationCap, i18nKey: "thesisDefense", color: "bg-tertiary" },
  { key: "JOB_INTERVIEW_PITCH", icon: Briefcase, i18nKey: "jobInterview", color: "bg-secondary" },
  { key: "PUBLIC_SPEECH", icon: Mic, i18nKey: "publicSpeech", color: "bg-primary" },
] as const;

export default function PracticeSetupPage() {
  const { t, i18n } = useTranslation("practice");
  const navigate = useNavigate();
  const location = useLocation();
  const lang = i18n.language;

  const [isUploading, setIsUploading] = useState(false);

  const {
    mode,
    targetDurationSeconds,
    scriptTitle,
    scriptContent,
    setMode,
    setTargetDurationSeconds,
    setScript,
    resetSession,
    prepareForNewSession,
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
    prepareForNewSession();
    navigate("/practice/room");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let extractedText = "";

      if (file.name.endsWith(".txt")) {
        extractedText = await file.text();
      } else if (file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        extractedText = fullText;
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        alert("Unsupported file format. Please upload .txt, .pdf, or .docx");
        setIsUploading(false);
        return;
      }

      if (extractedText.trim()) {
        setScript(file.name, extractedText);
      } else {
        alert("Failed to extract text from file or file is empty.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-3xl mx-auto px-app-gap pt-8 pb-20 md:pb-8 space-y-8">
        <header className="relative">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute -left-12 md:-left-16 top-1 p-2 rounded-full hover:bg-neutral/10 dark:hover:bg-white/10 transition-colors text-neutral dark:text-white"
            title={t("common:back", "Back to Dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
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
                      ? `border-neutral ${m.color} text-neutral shadow-neu translate-x-[-2px] translate-y-[-2px]`
                      : "border-neutral/30 hover:border-neutral bg-white dark:bg-surface-dark"
                  }`}
                  onClick={() => setMode(m.key as any)}
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-neu border-3 border-neutral flex items-center justify-center ${
                      isSelected ? "bg-white" : "bg-neutral/5 dark:bg-white/5"
                    }`}
                  >
                    <Icon size={26} className="text-neutral" />
                  </div>
                  <p className={`font-bold text-sm ${isSelected ? "text-neutral" : "text-neutral dark:text-white"}`}>
                    {t(`modes.${m.i18nKey}`)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 2. Target Duration Selection */}
        <section className="flex flex-col items-center mt-10">
          <h2 className="text-lg font-bold text-neutral dark:text-white mb-6">
            {t("setup.setDuration", "Target Duration")}
          </h2>
          <TimerPicker
            initialSeconds={targetDurationSeconds || 300}
            onChange={(totalSeconds) => setTargetDurationSeconds(totalSeconds)}
          />
        </section>
        
        {/* 2.5 Teleprompter Speed */}
        <section className="bg-primary/20 dark:bg-primary/10 border-4 border-neutral p-6 rounded-neu-lg shadow-neu mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-neutral dark:text-white">
              {t("setup.speed", "Teleprompter Speed (WPM)")}
            </h2>
            <span className="font-black text-neutral bg-primary px-4 py-1.5 rounded-neu border-3 border-neutral shadow-neu-sm text-sm">
              {useSessionStore.getState().teleprompterSpeed} WPM
            </span>
          </div>
          
          <div className="relative pt-2 pb-2">
            <input 
              type="range" 
              min="60" 
              max="200" 
              step="10"
              value={useSessionStore.getState().teleprompterSpeed}
              onChange={(e) => useSessionStore.getState().setTeleprompterSpeed(Number(e.target.value))}
              className="w-full h-4 bg-white dark:bg-surface-dark border-3 border-neutral rounded-full appearance-none cursor-pointer accent-neutral"
              style={{
                // Quick hack for custom slider thumb in generic CSS, though standard accent-color does an okay job
                accentColor: 'currentColor'
              }}
            />
            <div className="flex justify-between text-xs text-neutral/70 dark:text-white/60 mt-4 font-black uppercase tracking-widest">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
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
            <Card className="flex flex-col md:flex-row items-center justify-between border-2 border-dashed border-neutral/40 p-4 gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <FileText size={24} className="text-neutral/40 dark:text-white/30" />
                <div>
                  <h4 className="font-bold text-neutral dark:text-white text-sm">
                    {t("setup.freestyle", "Freestyle Mode (No Script)")}
                  </h4>
                  <p className="text-xs text-neutral/50 dark:text-white/40">
                    Speak freely, browse templates, or upload your own text (.txt, .pdf, .docx)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/templates")}
                >
                  Browse Templates
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button variant="secondary" size="sm" disabled={isUploading}>
                    {isUploading ? "Extracting..." : "Upload File"}
                  </Button>
                </div>
              </div>
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
