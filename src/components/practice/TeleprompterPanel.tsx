import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card, Button } from "../ui";
import { useSessionStore } from "../../store/sessionStore";

interface TeleprompterPanelProps {
  scriptTitle?: string;
  scriptContent: string;
  isRecording: boolean;
}

export const TeleprompterPanel: React.FC<TeleprompterPanelProps> = ({
  scriptTitle,
  scriptContent,
  isRecording,
}) => {
  const { t } = useTranslation("practice");
  
  // Convert WPM from setup page to approx pixels per second (much slower now: WPM / 8)
  const initialSpeed = Math.round(useSessionStore.getState().teleprompterSpeed / 8) || 15;
  
  const [scrollSpeed, setScrollSpeed] = useState<number>(initialSpeed); // px per second
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      setCountdown(null);
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    if (!isAutoScrolling) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    // Start 5-second countdown before scrolling
    let countdownValue = 5;
    setCountdown(countdownValue);
    
    const countdownInterval = setInterval(() => {
      countdownValue -= 1;
      if (countdownValue > 0) {
        setCountdown(countdownValue);
      } else {
        setCountdown(null);
        clearInterval(countdownInterval);
        startScrolling();
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isRecording, isAutoScrolling, scrollSpeed]);

  const startScrolling = () => {
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed * dt;
      }

      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);
  };

  const handleResetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-neutral/95 dark:bg-card-dark border-white/20 p-4">
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white">
            {scriptTitle || t("room.teleprompter", "Teleprompter")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="p-1.5 rounded-neu border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            title={isAutoScrolling ? "Pause scroll" : "Start scroll"}
          >
            {isAutoScrolling ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={handleResetScroll}
            className="p-1.5 rounded-neu border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            title="Reset scroll"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Script text area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin pr-2 space-y-4 relative"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-neu">
            <span className="text-6xl font-black text-primary animate-pulse">{countdown}</span>
          </div>
        )}
        {scriptContent ? (
          <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">
            {scriptContent}
          </p>
        ) : (
          <div className="py-12 text-center text-white/40 text-sm">
            <p>No script selected. Freestyle mode active.</p>
            <p className="mt-2 text-xs text-white/30">
              Select a script template before starting if you'd like to use the teleprompter.
            </p>
          </div>
        )}
      </div>

      {/* Speed Controls */}
      <div className="pt-3 mt-3 border-t-2 border-white/10 flex items-center justify-between text-xs text-white/70">
        <span>{t("room.scrollSpeed", "Scroll Speed")}</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="5"
            max="40"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
            className="w-24 accent-primary cursor-pointer"
          />
          <span className="mono-display text-white w-8 text-right">{scrollSpeed}px/s</span>
        </div>
      </div>
    </Card>
  );
};
