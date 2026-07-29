import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { detectFillerWords } from "../lib/fillerWordDictionary";
import { useSessionStore } from "../store/sessionStore";

export function useSpeechAnalyzer() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const lastProcessedIndexRef = useRef<number>(0);
  const spokenWordsTimeRef = useRef<{ timestamp: number; wordCount: number }[]>([]);

  // Accumulated final transcript (only confirmed results, not interim)
  const finalTranscriptRef = useRef<string>("");

  const { isRecording, addFillerWord, updateWpm } = useSessionStore();

  // Pause Detection refs
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const pauseReportedRef = useRef<boolean>(false);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang === "id" ? "id-ID" : "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let sessionFinalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          sessionFinalTranscript += text + " ";
        } else {
          interimTranscript += text + " ";
        }
      }

      // Build current full transcript: accumulated finals + current session finals + interim
      const currentFullTranscript = finalTranscriptRef.current + sessionFinalTranscript + interimTranscript;
      setTranscript(currentFullTranscript);

      // Process new words for filler words (only process new content)
      const newText = currentFullTranscript.substring(lastProcessedIndexRef.current);

      if (newText.trim().length > 0) {
        lastSpeechTimeRef.current = Date.now();
        pauseReportedRef.current = false;

        const foundFillers = detectFillerWords(newText, lang);
        if (foundFillers.length > 0) {
          foundFillers.forEach((filler) => {
            addFillerWord(filler);
          });
        }
        lastProcessedIndexRef.current = currentFullTranscript.length;
      }

      // Calculate rolling window WPM (words spoken in last 20 seconds)
      const now = Date.now();
      const wordCount = currentFullTranscript.trim().split(/\s+/).filter(Boolean).length;
      spokenWordsTimeRef.current.push({ timestamp: now, wordCount });

      // Keep only last 20 seconds of samples
      spokenWordsTimeRef.current = spokenWordsTimeRef.current.filter(
        (s) => now - s.timestamp <= 20000
      );

      if (spokenWordsTimeRef.current.length >= 2) {
        const oldest = spokenWordsTimeRef.current[0];
        const newest = spokenWordsTimeRef.current[spokenWordsTimeRef.current.length - 1];
        const wordsDelta = newest.wordCount - oldest.wordCount;
        const timeDeltaSec = (newest.timestamp - oldest.timestamp) / 1000;

        if (timeDeltaSec > 3 && wordsDelta >= 0) {
          const calculatedWpm = Math.round((wordsDelta / timeDeltaSec) * 60);
          updateWpm(calculatedWpm);
        }
      }
    };

    recognition.onerror = (err: any) => {
      if (err.error !== "no-speech" && err.error !== "aborted") {
        console.warn("[SpeechRecognition Error]", err.error);
        if (err.error === "not-allowed") {
          setIsSupported(false);
        }
      }
    };

    recognition.onend = () => {
      // When recognition ends and restarts, accumulate the finals from the previous session
      // This is important because SpeechRecognition resets event.results on restart
      const currentTranscriptValue = finalTranscriptRef.current;

      // Auto-restart if session is still recording
      if (useSessionStore.getState().isRecording && recognitionRef.current && isSupported) {
        // Save the current full transcript before restart
        // On restart, event.results resets, so we need to preserve what was finalized
        const SpeechRecognitionLocal =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionLocal) {
          setTimeout(() => {
            try {
              if (useSessionStore.getState().isRecording) {
                // Accumulate what we had into finalTranscriptRef
                // The transcript state already has the full text
                finalTranscriptRef.current = currentTranscriptValue;
                recognitionRef.current.start();
              }
            } catch (e) {
              // Ignore restart error if already started
            }
          }, 200);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, [lang, addFillerWord, updateWpm]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        lastProcessedIndexRef.current = 0;
        spokenWordsTimeRef.current = [];
        lastSpeechTimeRef.current = Date.now();
        pauseReportedRef.current = false;
        finalTranscriptRef.current = "";
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("[SpeechRecognition Start Error]", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.warn("[SpeechRecognition Stop Error]", err);
      }
    }
  }, [isListening]);

  // Sync listening state with session store recording state
  useEffect(() => {
    if (isRecording) {
      startListening();
    } else {
      stopListening();
    }
  }, [isRecording, startListening, stopListening]);

  // Pause Detection
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSpeech = now - lastSpeechTimeRef.current;

      // If no speech for 7 seconds, count as a "Long Pause" filler
      if (timeSinceLastSpeech >= 7000 && !pauseReportedRef.current) {
        useSessionStore.getState().addFillerWord("[Long Pause]");
        pauseReportedRef.current = true;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
