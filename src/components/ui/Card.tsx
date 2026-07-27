import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  clickable?: boolean;
  noPadding?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  clickable = false,
  noPadding = false,
  className = "",
  children,
  ...motionProps
}) => {
  const hasBgClass = className.includes("bg-");

  return (
    <motion.div
      className={`
        border-3 border-neutral rounded-neu shadow-neu
        ${hasBgClass ? "" : "bg-white dark:bg-card-dark"}
        ${noPadding ? "" : "p-6"}
        ${clickable ? "cursor-pointer" : ""}
        ${className}
      `}
      whileHover={
        clickable
          ? {
              x: -2,
              y: -2,
              transition: { duration: 0.15, ease: "easeOut" },
            }
          : {}
      }
      whileTap={
        clickable
          ? {
              x: 0,
              y: 0,
              transition: { duration: 0.08 },
            }
          : {}
      }
      // Shadow is handled via CSS class transition alongside the transform
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
