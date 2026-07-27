import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-neutral border-3 border-neutral shadow-neu hover:shadow-neu-hover active:shadow-neu-active font-bold",
  secondary:
    "bg-transparent text-neutral border-2 border-neutral hover:bg-tertiary/10 font-semibold dark:text-white dark:border-white",
  danger:
    "bg-secondary text-white border-3 border-neutral shadow-neu hover:shadow-neu-hover active:shadow-neu-active font-bold",
  ghost:
    "bg-transparent text-neutral border-2 border-neutral/50 hover:bg-primary/10 font-semibold dark:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...motionProps
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center gap-2 rounded-neu
        transition-colors duration-150 cursor-pointer select-none
        disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-neu-active
        focus-neu
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      whileHover={
        isDisabled
          ? {}
          : {
              x: -2,
              y: -2,
              transition: { duration: 0.15, ease: "easeOut" },
            }
      }
      whileTap={
        isDisabled
          ? {}
          : {
              x: 0,
              y: 0,
              transition: { duration: 0.08 },
            }
      }
      disabled={isDisabled}
      {...motionProps}
    >
      {isLoading ? (
        <>
          {loadingText && <span>{loadingText}</span>}
          <span className="inline-flex gap-1 items-center">
            <span className="w-2 h-2 bg-current animate-blink-block-1" />
            <span className="w-2 h-2 bg-current animate-blink-block-2" />
            <span className="w-2 h-2 bg-current animate-blink-block-3" />
          </span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
