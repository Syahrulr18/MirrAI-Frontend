import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const currentType = isPasswordType && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-neutral dark:text-white"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            className={`
              w-full px-4 py-3 rounded-neu
              border-2 border-neutral bg-white
              text-neutral placeholder:text-neutral/40
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              dark:bg-card-dark dark:text-white dark:border-white/30
              dark:placeholder:text-white/30 dark:focus:ring-primary
              ${isPasswordType ? "pr-12" : ""}
              ${error ? "border-secondary ring-2 ring-secondary/30" : ""}
              ${className}
            `}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              className="absolute right-3 p-1 text-neutral/50 hover:text-neutral dark:text-white/40 dark:hover:text-white focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-secondary font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral/60 dark:text-white/50">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
