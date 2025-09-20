"use client";
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

export type SpeakItem = { id: string; text: string };
export type TTSHandle = {
  speakQueue: (items: SpeakItem[]) => void;
  stop: () => void;
  isSpeaking: () => boolean;
};

const DEFAULT_LANG = "en-US";

const TTSControls = forwardRef<TTSHandle, { className?: string }>(function TTSControls(_, ref) {
  const [rate, setRate] = useState<number>(1);
  const [lang, setLang] = useState<string>(DEFAULT_LANG);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const queueRef = useRef<SpeakItem[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      const filtered = synthVoices.filter((v) => v.lang.startsWith(lang.split("-")[0]));
      setVoices(filtered);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [lang]);

  const dequeueAndSpeak = () => {
    if (queueRef.current.length === 0) {
      setSpeaking(false);
      return;
    }
    const next = queueRef.current.shift()!;
    const utter = new SpeechSynthesisUtterance(next.text);
    utter.lang = lang;
    utter.rate = rate;
    // Prefer a female/en voice if available
    const preferred = voices.find((v) => /female|woman|Samantha|Google US English/i.test(v.name));
    if (preferred) utter.voice = preferred;

    currentUtteranceRef.current = utter;
    setSpeaking(true);

    utter.onend = () => {
      currentUtteranceRef.current = null;
      dequeueAndSpeak();
    };
    utter.onerror = () => {
      currentUtteranceRef.current = null;
      dequeueAndSpeak();
    };

    window.speechSynthesis.speak(utter);
  };

  // Expose imperative API
  useImperativeHandle(ref, () => ({
    speakQueue: (items: SpeakItem[]) => {
      // Stop any current speech and clear queue
      window.speechSynthesis.cancel();
      queueRef.current = [...items];
      dequeueAndSpeak();
    },
    stop: () => {
      queueRef.current = [];
      window.speechSynthesis.cancel();
      setSpeaking(false);
    },
    isSpeaking: () => speaking,
  }), [speaking, rate, lang, voices]);

  // Controls UI
  return (
    <div className="mt-4 w-full max-w-xs rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-300">Voice Controls</span>
        <span className={`text-xs ${speaking ? "text-green-400" : "text-neutral-500"}`}>{speaking ? "Speaking" : "Idle"}</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-neutral-400">Speed: {rate.toFixed(1)}x</label>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-400">Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mt-1 w-full rounded-md bg-neutral-800 text-neutral-200 px-2 py-1 text-sm border border-neutral-700"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-IN">English (IN)</option>
          </select>
        </div>

        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            queueRef.current = [];
            setSpeaking(false);
          }}
          className="w-full rounded-md bg-red-500/90 hover:bg-red-500 text-white py-2 text-sm"
        >
          Skip / Stop
        </button>
      </div>
    </div>
  );
});

export default TTSControls;
export { TTSControls };
