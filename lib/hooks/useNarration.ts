import { useState, useEffect, useCallback } from 'react';
import narrator from '@/lib/narrator';

export function useNarration() {
  const [state, setState] = useState({
    isMuted: narrator.getMuted(),
    isSupported: narrator.getSupported(),
    isSpeaking: narrator.getSpeaking(),
    isPaused: narrator.getPaused(),
    currentText: narrator.getCurrentText(),
  });

  useEffect(() => {
    const updateState = () => {
      setState({
        isMuted: narrator.getMuted(),
        isSupported: narrator.getSupported(),
        isSpeaking: narrator.getSpeaking(),
        isPaused: narrator.getPaused(),
        currentText: narrator.getCurrentText(),
      });
    };

    updateState();
    return narrator.subscribe(updateState);
  }, []);

  const mute = useCallback(() => {
    narrator.mute();
  }, []);

  const unmute = useCallback(() => {
    narrator.unmute();
  }, []);

  const speak = useCallback((text: string) => {
    narrator.speak(text);
  }, []);

  const speakPriority = useCallback((text: string) => {
    narrator.speakPriority(text);
  }, []);

  const speakOnce = useCallback((eventId: string, text: string, priority: boolean = false) => {
    narrator.speakOnce(eventId, text, priority);
  }, []);

  const pause = useCallback((ms: number) => {
    narrator.pause(ms);
  }, []);

  const pauseSpeech = useCallback(() => {
    narrator.pauseSpeech();
  }, []);

  const resumeSpeech = useCallback(() => {
    narrator.resumeSpeech();
  }, []);

  const stop = useCallback(() => {
    narrator.stop();
  }, []);

  const replay = useCallback((pageId: string) => {
    narrator.replay(pageId);
  }, []);

  const announcePage = useCallback((pageId: string) => {
    narrator.announcePage(pageId);
  }, []);

  const announceEvent = useCallback((event: string, priority: boolean = false) => {
    narrator.announceEvent(event, priority);
  }, []);

  // Stop narration when tab hidden (optional)
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
    isMuted: state.isMuted,
    isSupported: state.isSupported,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    currentText: state.currentText,
    mute,
    unmute,
    speak,
    speakPriority,
    speakOnce,
    pause,
    pauseSpeech,
    resumeSpeech,
    stop,
    replay,
    announcePage,
    announceEvent,
  } as const;
}
