import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimerPickerProps {
  initialSeconds: number;
  onChange: (totalSeconds: number) => void;
}

export const TimerPicker: React.FC<TimerPickerProps> = ({ initialSeconds, onChange }) => {
  const [minutes, setMinutes] = useState(Math.floor(initialSeconds / 60));
  const [seconds, setSeconds] = useState(initialSeconds % 60);

  const handleMinChange = (delta: number) => {
    let next = minutes + delta;
    if (next > 60) next = 60;
    if (next < 1 && seconds === 0) next = 1;
    if (next < 0) next = 0;
    
    setMinutes(next);
    onChange(next * 60 + seconds);
  };

  const handleSecChange = (delta: number) => {
    let next = seconds + delta;
    let nextMin = minutes;
    
    if (next >= 60) next = 0;
    if (next < 0) next = 45;
    
    if (nextMin === 0 && next === 0) {
      nextMin = 1;
      setMinutes(nextMin);
    }
    
    setSeconds(next);
    onChange(nextMin * 60 + next);
  };

  return (
    <div className="flex items-center justify-center gap-4 text-neutral font-mono bg-warning/20 border-4 border-neutral rounded-neu-lg p-6 shadow-[4px_4px_0_rgba(26,26,26,1)] inline-flex">
      {/* Minutes Column */}
      <div className="flex flex-col items-center gap-2 w-20">
        <button
          onClick={() => handleMinChange(1)}
          className="p-2 w-full flex justify-center rounded-neu border-2 border-neutral bg-white hover:bg-neutral/10 hover:-translate-y-0.5 active:translate-y-0 shadow-neu-sm transition-all"
        >
          <ChevronUp size={24} className="text-neutral" />
        </button>
        <span className="text-5xl font-black tabular-nums select-none my-2 text-neutral">
          {minutes.toString().padStart(2, "0")}
        </span>
        <button
          onClick={() => handleMinChange(-1)}
          className="p-2 w-full flex justify-center rounded-neu border-2 border-neutral bg-white hover:bg-neutral/10 hover:-translate-y-0.5 active:translate-y-0 shadow-neu-sm transition-all"
        >
          <ChevronDown size={24} className="text-neutral" />
        </button>
        <span className="text-xs uppercase font-black text-neutral/70 mt-2 font-sans tracking-wider">
          Minutes
        </span>
      </div>

      {/* Separator */}
      <div className="text-4xl font-black pb-8 opacity-40 text-neutral mx-2">:</div>

      {/* Seconds Column */}
      <div className="flex flex-col items-center gap-2 w-20">
        <button
          onClick={() => handleSecChange(15)}
          className="p-2 w-full flex justify-center rounded-neu border-2 border-neutral bg-white hover:bg-neutral/10 hover:-translate-y-0.5 active:translate-y-0 shadow-neu-sm transition-all"
        >
          <ChevronUp size={24} className="text-neutral" />
        </button>
        <span className="text-5xl font-black tabular-nums select-none my-2 text-neutral">
          {seconds.toString().padStart(2, "0")}
        </span>
        <button
          onClick={() => handleSecChange(-15)}
          className="p-2 w-full flex justify-center rounded-neu border-2 border-neutral bg-white hover:bg-neutral/10 hover:-translate-y-0.5 active:translate-y-0 shadow-neu-sm transition-all"
        >
          <ChevronDown size={24} className="text-neutral" />
        </button>
        <span className="text-xs uppercase font-black text-neutral/70 mt-2 font-sans tracking-wider">
          Seconds
        </span>
      </div>
    </div>
  );
};
