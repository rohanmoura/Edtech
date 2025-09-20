"use client";
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";

export type SpeakItem = { id: string; text: string };
export type TTSHandle = {
  speakQueue: (items: SpeakItem[]) => void;
  enqueue: (items: SpeakItem[]) => void;
  stop: () => void;
  isSpeaking: () => boolean;
  showHelpInput: () => void; // New method to expose help input visibility
};

interface TTSControlsProps {
  className?: string;
  onSpeakingChange?: (speaking: boolean) => void;
  onWordChange?: (word: string) => void;
  onHelpInputVisibilityChange?: (visible: boolean) => void; // New prop
}

// Define the structure for gender-based voices
interface GenderVoices {
  girl: SpeechSynthesisVoice[];
  boy: SpeechSynthesisVoice[];
}

const TTSControls = forwardRef<TTSHandle, TTSControlsProps>(function TTSControls(
  { className, onSpeakingChange, onWordChange, onHelpInputVisibilityChange }: TTSControlsProps,
  ref
) {
  const [rate, setRate] = useState<number>(1);
  const [voiceType, setVoiceType] = useState<"girl" | "boy">("girl"); // default girl
  const [voices, setVoices] = useState<GenderVoices>({ girl: [], boy: [] });
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [helpButtonVisible, setHelpButtonVisible] = useState(true); // New state

  const queueRef = useRef<SpeakItem[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentItemRef = useRef<SpeakItem | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordsRef = useRef<string[]>([]);
  const wordIndexRef = useRef<number>(0);

  // Expose methods to parent component
  const speakQueueRef = useRef<(items: SpeakItem[]) => void>();
  const enqueueRef = useRef<(items: SpeakItem[]) => void>();

  useEffect(() => {
    onSpeakingChange?.(speaking && !paused);
  }, [speaking, paused, onSpeakingChange]);

  // Load voices and filter by gender (handle Windows/macOS/Google names)
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const femalePattern = /(female|woman|samantha|zira|aria|victoria|karen|tessa|susan|eva|microsoft aria|microsoft zira|narrator female)/i;
      const malePattern = /(male|man|david|mark|george|daniel|alex|fred|microsoft david|microsoft mark|narrator)/i;
      const girlVoices = allVoices.filter((v: SpeechSynthesisVoice) => femalePattern.test(v.name));
      const boyVoices = allVoices.filter((v: SpeechSynthesisVoice) => malePattern.test(v.name));
      setVoices({ girl: girlVoices, boy: boyVoices });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup on unmount: stop all speech and timers so it doesn't continue on other pages
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      queueRef.current = [];
      setSpeaking(false);
      setPaused(false);
      onWordChange?.("");
    };
  }, [onWordChange]);

  const simulateWordHighlighting = (text: string, duration: number) => {
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);

    const words = text.split(/\s+/).filter((w) => w.length > 0);
    wordsRef.current = words;
    // Do not reset index here if resuming; caller decides. We reset when starting fresh.
    const wordDuration = duration / Math.max(words.length, 1);

    const highlightNextWord = () => {
      if (wordIndexRef.current < wordsRef.current.length) {
        onWordChange?.(wordsRef.current[wordIndexRef.current]);
        wordIndexRef.current++;
        wordTimerRef.current = setTimeout(highlightNextWord, wordDuration * 1000);
      } else {
        onWordChange?.("");
      }
    };

    highlightNextWord();
  };

  const getPreferredVoice = (type: "girl" | "boy"): SpeechSynthesisVoice | undefined => {
    const all = window.speechSynthesis.getVoices();
    const femalePattern = /(female|woman|samantha|zira|aria|victoria|karen|tessa|susan|eva|microsoft aria|microsoft zira|narrator female)/i;
    const malePattern = /(male|man|david|mark|george|daniel|alex|fred|microsoft david|microsoft mark|narrator)/i;

    const genderList = voices[type] || [];
    if (genderList.length > 0) {
      return genderList.find((v) => v.lang === "en-US") || genderList[0];
    }

    if (type === "girl") {
      const femaleAll = all.filter((v) => femalePattern.test(v.name));
      if (femaleAll.length > 0) return femaleAll.find((v) => v.lang === "en-US") || femaleAll[0];
    } else {
      const maleAll = all.filter((v) => malePattern.test(v.name));
      if (maleAll.length > 0) return maleAll.find((v) => v.lang === "en-US") || maleAll[0];
    }

    const enUs = all.filter((v) => v.lang === "en-US");
    return enUs[0] || all[0] || undefined;
  };

  const dequeueAndSpeak = () => {
    if (queueRef.current.length === 0) {
      setSpeaking(false);
      setPaused(false);
      onWordChange?.("");
      return;
    }

    const next = queueRef.current.shift()!;
    currentItemRef.current = next;

    const utter = new SpeechSynthesisUtterance(next.text);
    utter.lang = "en-US";
    utter.rate = rate;

    // Pick voice by gender when available; fallback safely (prefer female by default)
    const preferredVoice = getPreferredVoice(voiceType);
    if (preferredVoice) utter.voice = preferredVoice;

    currentUtteranceRef.current = utter;
    setSpeaking(true);
    setPaused(false);

    const estimatedDuration = next.text.length / (rate * 8);

    // Reset highlighting index for new item
    wordIndexRef.current = 0;

    utter.onstart = () => {
      simulateWordHighlighting(next.text, estimatedDuration);
    };

    utter.onend = () => {
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      onWordChange?.("");
      dequeueAndSpeak();
    };

    utter.onerror = () => {
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      onWordChange?.("");
      dequeueAndSpeak();
    };

    window.speechSynthesis.speak(utter);
  };

  // When user switches voice type while speaking, immediately restart current item with remaining text
  useEffect(() => {
    if (!speaking || paused) return;
    const currentUtter = currentUtteranceRef.current;
    const currentItem = currentItemRef.current;
    if (!currentUtter || !currentItem) return;

    try {
      // Cancel current utterance
      window.speechSynthesis.cancel();
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    } catch { }

    // Compute remaining text from current word index if available
    const remainingWords = wordsRef.current.slice(Math.max(wordIndexRef.current, 0));
    const remainingText = remainingWords.length > 0 ? remainingWords.join(" ") : currentItem.text;

    // Prepend remaining text and resume queue with new voice type
    queueRef.current = [{ id: currentItem.id, text: remainingText }, ...queueRef.current];
    currentUtteranceRef.current = null;
    currentItemRef.current = null;
    // Reset highlight index for restarted utterance
    wordIndexRef.current = 0;
    dequeueAndSpeak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceType]);

  // If voices load/update after speech started, restart with preferred voice
  useEffect(() => {
    if (!speaking || paused) return;
    const currentUtter = currentUtteranceRef.current;
    const currentItem = currentItemRef.current;
    if (!currentUtter || !currentItem) return;

    try {
      window.speechSynthesis.cancel();
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    } catch { }

    const remainingWords = wordsRef.current.slice(Math.max(wordIndexRef.current, 0));
    const remainingText = remainingWords.length > 0 ? remainingWords.join(" ") : currentItem.text;

    queueRef.current = [{ id: currentItem.id, text: remainingText }, ...queueRef.current];
    currentUtteranceRef.current = null;
    currentItemRef.current = null;
    wordIndexRef.current = 0;
    dequeueAndSpeak();
  }, [voices]);

  // Handle Need Help button click
  const handleNeedHelpClick = () => {
    setHelpButtonVisible(false);
    onHelpInputVisibilityChange?.(true);

    // Speak help prompt
    const helpPrompt: SpeakItem[] = [
      { id: "help-prompt", text: "Please ask your question about this module." }
    ];

    // Use the exposed methods
    if (speakQueueRef.current) {
      if (!speaking && !paused) {
        speakQueueRef.current(helpPrompt);
      } else if (enqueueRef.current) {
        enqueueRef.current(helpPrompt);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    speakQueue: (items: SpeakItem[]) => {
      try {
        window.speechSynthesis.cancel();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      queueRef.current = [...items];
      setPaused(false);
      dequeueAndSpeak();
    },
    enqueue: (items: SpeakItem[]) => {
      queueRef.current.push(...items);
      if (!speaking && !paused && !currentUtteranceRef.current) {
        dequeueAndSpeak();
      }
    },
    stop: () => {
      try {
        window.speechSynthesis.cancel();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      queueRef.current = [];
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      setSpeaking(false);
      setPaused(false);
      onWordChange?.("");
    },
    isSpeaking: () => speaking && !paused,
    showHelpInput: () => {
      setHelpButtonVisible(false);
      onHelpInputVisibilityChange?.(true);
    }
  }));

  // Store references to the methods
  useEffect(() => {
    speakQueueRef.current = (items: SpeakItem[]) => {
      try {
        window.speechSynthesis.cancel();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      currentUtteranceRef.current = null;
      currentItemRef.current = null;
      queueRef.current = [...items];
      setPaused(false);
      dequeueAndSpeak();
    };

    enqueueRef.current = (items: SpeakItem[]) => {
      queueRef.current.push(...items);
      if (!speaking && !paused && !currentUtteranceRef.current) {
        dequeueAndSpeak();
      }
    };
  }, [speaking, paused]);

  const handleTogglePause = () => {
    if (paused) {
      // Continue: restart remaining text using current voice selection
      try {
        window.speechSynthesis.cancel();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      const currentItem = currentItemRef.current;
      const remainingWords = wordsRef.current.slice(Math.max(wordIndexRef.current, 0));
      const remainingText = remainingWords.length > 0 ? remainingWords.join(" ") : currentItem?.text || "";
      if (remainingText.trim().length > 0) {
        // put remaining first, keep rest of queue
        queueRef.current = [{ id: currentItem?.id || "resume", text: remainingText }, ...queueRef.current];
      }
      currentUtteranceRef.current = null;
      // reset highlight index for resumed utterance
      wordIndexRef.current = 0;
      setPaused(false);
      dequeueAndSpeak();
    } else {
      // Pause current utterance
      try {
        window.speechSynthesis.pause();
      } catch { }
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      setPaused(true);
    }
  };

  return (
    <div className={cn("rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-neutral-200 shadow-lg", className)}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-neutral-400">Speed</label>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="mt-1 w-full accent-blue-500"
          />
          <div className="text-[10px] text-neutral-500">{rate.toFixed(1)}x</div>
        </div>

        {/* Voice Type Selector */}
        <div>
          <label className="block text-xs text-neutral-400">Voice</label>
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value as "girl" | "boy")}
            className="mt-1 w-full rounded-md bg-neutral-800 text-neutral-200 px-2 py-1 text-sm border border-neutral-700"
          >
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
          </select>
        </div>

        <button
          onClick={handleTogglePause}
          className={cn(
            "w-full rounded-md py-2 text-sm transition-colors",
            paused ? "bg-white text-black hover:bg-neutral-200" : "bg-red-500/90 hover:bg-red-500 text-white"
          )}
        >
          {paused ? "Continue" : "Skip / Stop"}
        </button>

        {/* Need Help Button */}
        {helpButtonVisible && (
          <button
            onClick={handleNeedHelpClick}
            className="w-full rounded-md py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            Need Help
          </button>
        )}
      </div>
    </div>
  );
});

export default TTSControls;