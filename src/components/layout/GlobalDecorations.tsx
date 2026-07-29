import { motion } from "framer-motion";

export const GlobalDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[0]">
      {/* 1. Top Left - Solid Offset Box */}
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -left-8 w-24 h-24 bg-success/10 border-4 border-success/20 rounded-neu shadow-[4px_4px_0_rgba(0,230,118,0.1)]"
      />

      {/* 2. Top Right - Smaller Dashed Circle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-16 -right-10 w-64 h-64 border-[8px] border-primary/10 rounded-full border-dashed"
      />

      {/* 3. Middle Right - Plus Sign */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-12 w-12 h-12 flex items-center justify-center text-secondary/20"
      >
        <div className="absolute w-full h-2 bg-secondary/20 rounded-full"></div>
        <div className="absolute h-full w-2 bg-secondary/20 rounded-full"></div>
      </motion.div>

      {/* 4. Bottom Left - Floating Square (Red/Error) */}
      <motion.div
        animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-12 left-20 w-32 h-32 bg-error/10 border-8 border-error/20 rounded-[2rem]"
      />

      {/* 5. Bottom Right - Huge Dashed Circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-48 -right-32 w-[30rem] h-[30rem] border-[16px] border-primary/5 rounded-full border-dashed"
      />

      {/* 6. Middle Left - Small Dot Grid */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 left-16 w-16 h-16 opacity-20"
        style={{
          backgroundImage: "radial-gradient(currentColor 3px, transparent 3px)",
          backgroundSize: "12px 12px",
          color: "var(--color-neutral, #1A1A1A)" // Adjusts for dark mode implicitly via classes
        }}
      />
      
      {/* Subtle Global Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(#1A1A1A 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      />
    </div>
  );
};
