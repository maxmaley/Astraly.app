"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

const LOCALE_TO_LANG: Record<string, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

interface VoiceInputButtonProps {
  locale: string;
  disabled?: boolean;
  onTranscript: (text: string) => void;
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function VoiceInputButton({ locale, disabled, onTranscript }: VoiceInputButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = LOCALE_TO_LANG[locale] ?? "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = "";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }
      onTranscript(finalTranscript + interim);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    trackEvent("voice_input_used", {});
  }, [listening, locale, onTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
        listening
          ? "bg-rose-500/20 text-rose-400 animate-pulse ring-2 ring-rose-400/30"
          : "text-[var(--muted-foreground)] hover:text-cosmic-400 hover:bg-cosmic-400/10"
      }`}
    >
      {listening ? (
        /* Stop icon (square) */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        /* Microphone icon */
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="22" />
        </svg>
      )}
    </button>
  );
}
