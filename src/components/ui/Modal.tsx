import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-neutral/50 z-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="fixed inset-0 z-modal flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              className={`
                relative w-full ${sizeStyles[size]}
                bg-white dark:bg-card-dark
                border-3 border-neutral rounded-neu shadow-neu-lg
                p-6
                ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral dark:text-white">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-neu border-2 border-neutral/30 hover:border-neutral
                      hover:bg-neutral/5 transition-all duration-150 focus-neu
                      dark:border-white/30 dark:hover:border-white dark:hover:bg-white/5"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Content */}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
