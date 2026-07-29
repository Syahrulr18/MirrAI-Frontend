import { create } from "zustand";

export interface FillerTimestamp {
  word: string;
  atSecond: number;
}

export interface EyeContactFlag {
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
  targetDurationSeconds: number;
  teleprompterSpeed: number;
  scriptContent: string;
  scriptTitle: string;
  scriptAccuracy: number | null;

  // Live Status
  isRecording: boolean;
  elapsedSeconds: number;

  // Eye Contact
  isEyeContactGood: boolean;
  eyeContactGoodSec: number;
  eyeContactBadSec: number;
  eyeContactFlags: EyeContactFlag[];

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
  setTargetDurationSeconds: (seconds: number) => void;
  setTeleprompterSpeed: (speed: number) => void;
  setScript: (title: string, content: string) => void;
  setScriptAccuracy: (accuracy: number) => void;
  setRecording: (isRecording: boolean) => void;
  setElapsedSeconds: (seconds: number) => void;
  updateEyeContact: (isGood: boolean) => void;
  updatePosture: (isGood: boolean, flag?: "slouch" | "fidget" | "passive_hands") => void;
  addFillerWord: (word: string) => void;
  updateWpm: (wpm: number) => void;
  setRecordedBlobUrl: (url: string | null) => void;
  prepareForNewSession: () => void;
  resetSession: () => void;
}

const initialState = {
  mode: "PUBLIC_SPEECH" as const,
  targetDurationSeconds: 300, // 5 minutes default
  teleprompterSpeed: 120, // Default WPM for teleprompter
  scriptContent: "",
  scriptTitle: "",
  scriptAccuracy: null,

  isRecording: false,
  elapsedSeconds: 0,

  isEyeContactGood: true,
  eyeContactGoodSec: 0,
  eyeContactBadSec: 0,
  eyeContactFlags: [],

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
  setTargetDurationSeconds: (targetDurationSeconds) => set({ targetDurationSeconds }),
  setTeleprompterSpeed: (teleprompterSpeed) => set({ teleprompterSpeed }),
  setScript: (scriptTitle, scriptContent) => set({ scriptTitle, scriptContent }),
  setScriptAccuracy: (accuracy) => set({ scriptAccuracy: accuracy }),
  setRecording: (isRecording) => set({ isRecording }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),

  updateEyeContact: (isGood) => {
    const state = get();
    if (!state.isRecording) return;
    
    // Only record a flag once when it transitions from good to bad
    const newFlags = [...state.eyeContactFlags];
    if (!isGood && state.isEyeContactGood) {
      newFlags.push({ atSecond: state.elapsedSeconds });
    }

    set({
      isEyeContactGood: isGood,
      eyeContactGoodSec: isGood ? state.eyeContactGoodSec + 1 : state.eyeContactGoodSec,
      eyeContactBadSec: !isGood ? state.eyeContactBadSec + 1 : state.eyeContactBadSec,
      eyeContactFlags: newFlags,
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
  prepareForNewSession: () => set((state) => ({
    ...state,
    isRecording: false,
    elapsedSeconds: 0,
    isEyeContactGood: true,
    eyeContactGoodSec: 0,
    eyeContactBadSec: 0,
    eyeContactFlags: [],
    isPostureGood: true,
    postureFlags: [],
    currentWpm: 0,
    avgWpm: 0,
    wpmSamples: [],
    fillerWordCount: 0,
    fillerWordTimestamps: [],
    recordedBlobUrl: null,
  })),
  resetSession: () => set(initialState),
}));
