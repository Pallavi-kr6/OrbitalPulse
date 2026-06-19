import { useState, useEffect, useCallback } from 'react';
import narrator from '@/lib/narrator';

export function useNarration() {
  const [isMuted, setIsMuted] = useState(() => narrator.getMuted());
  const [isSupported, setIsSupported] = useState(() => narrator.getSupported());

  const mute = useCallback(() => {
    narrator.mute();
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    narrator.unmute();
    setIsMuted(false);
  }, []);

  const speak = useCallback((text: string) => {
    narrator.speak(text);
  }, []);

  const speakPriority = useCallback((text: string) => {
    narrator.speakPriority(text);
  }, []);

  const announcePage = useCallback((pageId: string) => {
    narrator.announcePage(pageId);
  }, []);

  const announceEvent = useCallback((event: string, priority: boolean = false) => {
    narrator.announceEvent(event, priority);
  }, []);

  // Pause narration when tab hidden (optional)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        narrator.stop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return {
    isMuted,
    isSupported,
    mute,
    unmute,
    speak,
    speakPriority,
    announcePage,
    announceEvent,
  } as const;
}
