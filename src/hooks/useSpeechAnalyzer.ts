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

  const { isRecording, addFillerWord, updateWpm } = useSessionStore();

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
    recognition.lang = lang === "id" ? "id-ID" : "en-US";

    recognition.onresult = (event: any) => {
      let currentFullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentFullTranscript += event.results[i][0].transcript + " ";
      }

      setTranscript(currentFullTranscript);

      // Process new words for filler words
      const newText = currentFullTranscript.substring(lastProcessedIndexRef.current);

      if (newText.trim().length > 0) {
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
      if (err.error !== "no-speech") {
        console.warn("[SpeechRecognition Error]", err.error);
        if (err.error === "not-allowed") {
          setIsSupported(false); // Stop trying if user denied mic
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if session is still recording and it is supported (not denied)
      if (useSessionStore.getState().isRecording && recognitionRef.current && isSupported) {
        setTimeout(() => {
          try {
            if (useSessionStore.getState().isRecording) {
              recognitionRef.current.start();
            }
          } catch (e) {
            // Ignore restart error if already started
          }
        }, 300); // slight delay to prevent rapid crash looping
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

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
