import React from "react";
import { motion } from "framer-motion";

interface EyeContactRingProps {
  isGood: boolean;
}

export const EyeContactRing: React.FC<EyeContactRingProps> = ({ isGood }) => {
  return (
    <motion.div
      className={`
        absolute inset-0 rounded-neu-lg border-4 pointer-events-none transition-colors duration-300
        ${isGood ? "border-success/60 shadow-[inset_0_0_20px_rgba(0,230,118,0.2)]" : "border-secondary shadow-[inset_0_0_30px_rgba(255,82,82,0.4)]"}
      `}
      animate={isGood ? {} : { opacity: [0.6, 1, 0.6] }}
      transition={isGood ? {} : { duration: 1, repeat: Infinity }}
    />
  );
};
