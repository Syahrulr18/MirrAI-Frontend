import { create } from "zustand";

export interface FillerTimestamp {
  word: string;
  atSecond: number;
}

export interface PostureFlag {
  type: "slouch" | "fidget" | "passive_hands";
  atSecond: number;
}

export interface WpmSample {
  atSecond: number;
  wpm: number;
}

interface SessionState {
  // Config
  mode: "THESIS_DEFENSE" | "JOB_INTERVIEW_PITCH" | "PUBLIC_SPEECH";
  targetDurationMinutes: number;
  scriptContent: string;
  scriptTitle: string;

  // Live Status
  isRecording: boolean;
  elapsedSeconds: number;

  // Eye Contact
  isEyeContactGood: boolean;
  eyeContactGoodSec: number;
  eyeContactBadSec: number;

  // Posture
  isPostureGood: boolean;
  postureFlags: PostureFlag[];

  // Speech & Fluency
  currentWpm: number;
  avgWpm: number;
  wpmSamples: WpmSample[];
  fillerWordCount: number;
  fillerWordTimestamps: FillerTimestamp[];

  // Recording Media Blob
  recordedBlobUrl: string | null;

  // Actions
  setMode: (mode: "THESIS_DEFENSE" | "JOB_INTERVIEW_PITCH" | "PUBLIC_SPEECH") => void;
  setTargetDurationMinutes: (minutes: number) => void;
  setScript: (title: string, content: string) => void;
  setRecording: (isRecording: boolean) => void;
  setElapsedSeconds: (seconds: number) => void;
  updateEyeContact: (isGood: boolean) => void;
  updatePosture: (isGood: boolean, flag?: "slouch" | "fidget" | "passive_hands") => void;
  addFillerWord: (word: string) => void;
  updateWpm: (wpm: number) => void;
  setRecordedBlobUrl: (url: string | null) => void;
  resetSession: () => void;
}

const initialState = {
  mode: "PUBLIC_SPEECH" as const,
  targetDurationMinutes: 5,
  scriptContent: "",
  scriptTitle: "",

  isRecording: false,
  elapsedSeconds: 0,

  isEyeContactGood: true,
  eyeContactGoodSec: 0,
  eyeContactBadSec: 0,

  isPostureGood: true,
  postureFlags: [],

  currentWpm: 0,
  avgWpm: 0,
  wpmSamples: [],
  fillerWordCount: 0,
  fillerWordTimestamps: [],

  recordedBlobUrl: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setTargetDurationMinutes: (targetDurationMinutes) => set({ targetDurationMinutes }),
  setScript: (scriptTitle, scriptContent) => set({ scriptTitle, scriptContent }),
  setRecording: (isRecording) => set({ isRecording }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),

  updateEyeContact: (isGood) => {
    const state = get();
    if (!state.isRecording) return;
    set({
      isEyeContactGood: isGood,
      eyeContactGoodSec: isGood ? state.eyeContactGoodSec + 1 : state.eyeContactGoodSec,
      eyeContactBadSec: !isGood ? state.eyeContactBadSec + 1 : state.eyeContactBadSec,
    });
  },

  updatePosture: (isGood, flag) => {
    const state = get();
    if (!state.isRecording) return;
    const newFlags = [...state.postureFlags];
    if (!isGood && flag) {
      newFlags.push({ type: flag, atSecond: state.elapsedSeconds });
    }
    set({
      isPostureGood: isGood,
      postureFlags: newFlags,
    });
  },

  addFillerWord: (word) => {
    const state = get();
    if (!state.isRecording) return;
    set({
      fillerWordCount: state.fillerWordCount + 1,
      fillerWordTimestamps: [
        ...state.fillerWordTimestamps,
        { word, atSecond: state.elapsedSeconds },
      ],
    });
  },

  updateWpm: (wpm) => {
    const state = get();
    if (!state.isRecording) return;
    
    const safeWpm = isNaN(wpm) ? 0 : wpm;
    const newSamples = [...state.wpmSamples, { atSecond: state.elapsedSeconds, wpm: safeWpm }];
    const totalWpm = newSamples.reduce((acc, curr) => acc + curr.wpm, 0);
    const avgWpm = Math.round(totalWpm / newSamples.length) || 0;

    set({
      currentWpm: safeWpm,
      avgWpm,
      wpmSamples: newSamples,
    });
  },

  setRecordedBlobUrl: (recordedBlobUrl) => set({ recordedBlobUrl }),
  resetSession: () => set(initialState),
}));
