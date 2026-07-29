import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  minimumDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minimumDuration = 1800,
}) => {
  const [phase, setPhase] = useState<"drop" | "slogan" | "exit">("drop");

  useEffect(() => {
    // Phase 1: Wordmark hard-drop (900ms)
    const sloganTimer = setTimeout(() => setPhase("slogan"), 1000);
    // Phase 2: Slogan fade-in (200ms) + hold
    const exitTimer = setTimeout(() => setPhase("exit"), minimumDuration);
    // Phase 3: Fade out + callback
    const completeTimer = setTimeout(() => onComplete(), minimumDuration + 400);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, minimumDuration]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo with hard-drop animation */}
          <motion.img
            src="/logo_MirrAI.svg"
            alt="MirrAI Logo"
            className="h-14 sm:h-20 invert select-none"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.9,
              ease: [0.34, 1.56, 0.64, 1], // bounce ease
            }}
          />

          {/* Shadow pop after wordmark lands */}
          <motion.div
            className="h-1 w-24 bg-primary rounded-full mt-2"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.2 }}
          />

          {/* Slogan — appears after wordmark settles */}
          <AnimatePresence>
            {(phase === "slogan") && (
              <motion.p
                className="text-white/80 text-lg mt-4 font-medium select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                The Smart Mirror for Public Speaking.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Blocky progress bar */}
          <div className="mt-8 w-48 h-2 border-2 border-white/30 rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: minimumDuration / 1000,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
