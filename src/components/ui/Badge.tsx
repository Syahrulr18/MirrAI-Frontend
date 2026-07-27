import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral text-white",
  success: "bg-success text-neutral",
  warning: "bg-warning text-neutral",
  danger: "bg-secondary text-white",
  info: "bg-tertiary text-white",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1
        rounded-full border-2 border-neutral
        text-xs font-semibold uppercase tracking-wider
        select-none
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Chip variant — interactive, for suggested prompts etc.
interface ChipProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  onClick,
  active = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-4 py-2
        rounded-full border-2 border-neutral
        text-sm font-medium cursor-pointer
        transition-all duration-150
        focus-neu select-none
        ${
          active
            ? "bg-primary text-neutral shadow-neu-sm"
            : "bg-white text-neutral hover:bg-primary/20 dark:bg-card-dark dark:text-white"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};
