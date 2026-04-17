import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';

interface TTSProps {
  text: string;
  lang: 'zh' | 'en';
}

export const TTS: React.FC<TTSProps> = ({ text, lang }) => {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported) {
      console.warn("TTS not supported in this browser");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'zh' ? 'zh-TW' : 'en-US';
      u.rate = 1.0;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utterRef.current = u;
      window.speechSynthesis.speak(u);
      setSpeaking(true);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggle}
      title="Listen to text"
      className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
        speaking ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-300' : 'text-teal-600 hover:bg-teal-50'
      }`}
    >
      {speaking ? (
        <Square className="w-5 h-5 fill-current" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
};
