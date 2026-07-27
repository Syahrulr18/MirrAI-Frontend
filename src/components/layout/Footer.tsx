import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t-3 border-neutral dark:border-white bg-black dark:bg-white text-white/60 dark:text-neutral/70 mt-auto transition-colors duration-300">
      <div className="max-w-content mx-auto px-app-gap py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-lg font-bold text-white dark:text-neutral select-none">MirrAI</span>
        <p className="text-sm">The Smart Mirror for Public Speaking.</p>
      </div>
    </footer>
  );
};
