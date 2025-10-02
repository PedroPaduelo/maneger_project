'use client';

import { useCallback, useRef, useState } from 'react';

export type SoundType = 'success' | 'error' | 'warning' | 'info';

interface UseNotificationSoundOptions {
  enabled?: boolean;
  volume?: number;
}

export function useNotificationSound({
  enabled = true,
  volume = 0.5,
}: UseNotificationSoundOptions = {}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(
    (frequency: number, duration: number) => {
      if (!isEnabled) return;

      try {
        const audioContext = initAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(currentVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.error('Failed to play sound:', error);
      }
    },
    [isEnabled, currentVolume, initAudioContext]
  );

  const playSound = useCallback(
    (type: SoundType) => {
      switch (type) {
        case 'success':
          // Toque de sucesso: C -> E -> G
          playBeep(523.25, 0.1); // C5
          setTimeout(() => playBeep(659.25, 0.1), 100); // E5
          setTimeout(() => playBeep(783.99, 0.2), 200); // G5
          break;

        case 'error':
          // Toque de erro: G -> C (descendente)
          playBeep(783.99, 0.15); // G5
          setTimeout(() => playBeep(523.25, 0.3), 150); // C5
          break;

        case 'warning':
          // Toque de aviso: D -> D
          playBeep(587.33, 0.15); // D5
          setTimeout(() => playBeep(587.33, 0.15), 200); // D5
          break;

        case 'info':
          // Toque de info: A
          playBeep(880.0, 0.2); // A5
          break;

        default:
          break;
      }
    },
    [playBeep]
  );

  const playCompletionSound = useCallback(() => {
    playSound('success');
  }, [playSound]);

  const playErrorSound = useCallback(() => {
    playSound('error');
  }, [playSound]);

  const playWarningSound = useCallback(() => {
    playSound('warning');
  }, [playSound]);

  const playInfoSound = useCallback(() => {
    playSound('info');
  }, [playSound]);

  const setVolume = useCallback((newVolume: number) => {
    setCurrentVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  return {
    isEnabled,
    volume: currentVolume,
    playSound,
    playCompletionSound,
    playErrorSound,
    playWarningSound,
    playInfoSound,
    setVolume,
    setEnabled: setIsEnabled,
    toggleEnabled,
  };
}
