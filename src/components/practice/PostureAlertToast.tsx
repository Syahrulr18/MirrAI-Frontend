import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PostureAlertToastProps {
  flag: "slouch" | "fidget" | "passive_hands" | null;
}

export const PostureAlertToast: React.FC<PostureAlertToastProps> = ({ flag }) => {
  const { t } = useTranslation("practice");
  const [visibleFlag, setVisibleFlag] = useState<typeof flag>(null);

  useEffect(() => {
    if (flag) {
      setVisibleFlag(flag);
      const timer = setTimeout(() => {
        setVisibleFlag(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [flag]);

  if (!visibleFlag) return null;

  const flagLabels: Record<string, string> = {
    slouch: t("room.straightenUp", "Try to straighten your shoulders"),
    fidget: t("room.stopFidgeting", "Try to stay still"),
    passive_hands: t("room.handsActive", "Try using hand gestures"),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-floating-alert"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-neu border-3 border-neutral bg-warning text-neutral shadow-neu text-sm font-bold">
          <AlertTriangle size={18} />
          <span>{flagLabels[visibleFlag] || "Adjust your posture"}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
