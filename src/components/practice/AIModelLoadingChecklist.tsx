import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import { Card } from "../ui";

interface AIModelLoadingChecklistProps {
  isCameraReady: boolean;
  isFaceModelReady: boolean;
  isPoseModelReady: boolean;
  isHandModelReady: boolean;
}

export const AIModelLoadingChecklist: React.FC<AIModelLoadingChecklistProps> = ({
  isCameraReady,
  isFaceModelReady,
  isPoseModelReady,
  isHandModelReady,
}) => {
  const { t } = useTranslation("practice");

  const steps = [
    { key: "camera", isDone: isCameraReady, label: t("room.loadingSteps.camera", "Camera connected") },
    { key: "faceModel", isDone: isFaceModelReady, label: t("room.loadingSteps.faceModel", "Face model loaded") },
    { key: "poseModel", isDone: isPoseModelReady, label: t("room.loadingSteps.poseModel", "Pose model loaded") },
    { key: "handModel", isDone: isHandModelReady, label: "Hand tracker loaded" },
  ];

  return (
    <div className="fixed inset-0 z-modal bg-neutral/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center py-8 px-6 shadow-neu-lg">
        <h3 className="text-xl font-bold text-neutral dark:text-white mb-2">
          {t("room.loading", "Preparing AI Coach...")}
        </h3>
        <p className="text-sm text-neutral/60 dark:text-white/50 mb-6">
          Initializing vision AI models for real-time analysis
        </p>

        <div className="space-y-4 text-left">
          {steps.map((step) => (
            <div
              key={step.key}
              className="flex items-center gap-3 p-3 rounded-neu border-2 border-neutral/20 bg-neutral/5 dark:bg-white/5"
            >
              {step.isDone ? (
                <div className="w-6 h-6 rounded-full bg-success border-2 border-neutral flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-neutral font-bold" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center flex-shrink-0">
                  <Loader2 size={14} className="text-warning animate-spin" />
                </div>
              )}
              <span className="text-sm font-semibold text-neutral dark:text-white">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
