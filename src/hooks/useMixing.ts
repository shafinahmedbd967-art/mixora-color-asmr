import { useState, useCallback, useRef } from 'react';
import { Color, MixRecord } from '../types';
import { blendColors, rgbToHex, makeColor, randomColor } from '../utils/colorUtils';

const STEP_SIZE = 4;
const MAX_HISTORY = 6;

const DEFAULT_COLORS: Color[] = [
  makeColor('#e63946'),
  makeColor('#2a9d8f'),
];

export function useMixing() {
  const [selectedColors, setSelectedColors] = useState<Color[]>(DEFAULT_COLORS);
  const [mixProgress, setMixProgress] = useState(0);
  const [history, setHistory] = useState<MixRecord[]>([]);
  const [favorites, setFavorites] = useState<MixRecord[]>([]);
  const [autoMix, setAutoMix] = useState(false);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMixedRgb = blendColors(selectedColors, mixProgress);
  const currentMixedHex = rgbToHex(currentMixedRgb);

  const step = useCallback((): boolean => {
    if (selectedColors.length < 2) return false;
    let completed = false;
    setMixProgress(prev => {
      const next = Math.min(100, prev + STEP_SIZE);
      if (next === 100) completed = true;
      return next;
    });
    return completed;
  }, [selectedColors.length]);

  const saveToHistory = useCallback(() => {
    if (selectedColors.length < 2 || mixProgress < 10) return;
    const record: MixRecord = {
      id: crypto.randomUUID(),
      colors: [...selectedColors],
      resultHex: currentMixedHex,
      resultRgb: currentMixedRgb,
      timestamp: Date.now(),
    };
    setHistory(prev => [record, ...prev].slice(0, MAX_HISTORY));
  }, [selectedColors, mixProgress, currentMixedHex, currentMixedRgb]);

  const reset = useCallback(() => {
    if (mixProgress > 10) saveToHistory();
    setMixProgress(0);
    stopAutoMix();
  }, [mixProgress, saveToHistory]);

  const addColor = useCallback((color: Color) => {
    setSelectedColors(prev => {
      if (prev.length >= 3) return [...prev.slice(0, 2), color];
      return [...prev, color];
    });
    setMixProgress(0);
  }, []);

  const updateColor = useCallback((index: number, color: Color) => {
    setSelectedColors(prev => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
    setMixProgress(0);
  }, []);

  const removeColor = useCallback((index: number) => {
    setSelectedColors(prev => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setMixProgress(0);
  }, []);

  const randomizeColors = useCallback(() => {
    const count = 2 + Math.floor(Math.random() * 2);
    const colors: Color[] = Array.from({ length: count }, () => randomColor());
    setSelectedColors(colors);
    setMixProgress(0);
  }, []);

  const toggleFavorite = useCallback((record: MixRecord) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === record.id);
      if (exists) return prev.filter(f => f.id !== record.id);
      return [record, ...prev].slice(0, 10);
    });
  }, []);

  const startAutoMix = useCallback((onStep: () => void, onComplete: () => void) => {
    setAutoMix(true);
    autoIntervalRef.current = setInterval(() => {
      setMixProgress(prev => {
        const next = Math.min(100, prev + 1);
        onStep();
        if (next === 100) {
          stopAutoMix();
          onComplete();
        }
        return next;
      });
    }, 60);
  }, []);

  const stopAutoMix = useCallback(() => {
    setAutoMix(false);
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const loadFromHistory = useCallback((record: MixRecord) => {
    setSelectedColors(record.colors);
    setMixProgress(0);
  }, []);

  return {
    selectedColors,
    mixProgress,
    history,
    favorites,
    autoMix,
    currentMixedRgb,
    currentMixedHex,
    step,
    reset,
    addColor,
    updateColor,
    removeColor,
    randomizeColors,
    toggleFavorite,
    saveToHistory,
    loadFromHistory,
    startAutoMix,
    stopAutoMix,
  };
}
