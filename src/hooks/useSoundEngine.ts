import { useRef, useCallback } from 'react';

function playDrop(ctx: AudioContext, progress: number) {
  const t = ctx.currentTime;
  const pitch = 0.7 + (progress / 100) * 0.6;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(680 * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(120 * pitch, t + 0.25);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(400, t + 0.3);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.35, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

  osc.start(t);
  osc.stop(t + 0.35);
}

function playBubble(ctx: AudioContext, progress: number) {
  const t = ctx.currentTime;
  const pitch = 1 + (progress / 100) * 0.5;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(350 * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(700 * pitch, t + 0.04);
  osc.frequency.exponentialRampToValueAtTime(250 * pitch, t + 0.12);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  osc.start(t);
  osc.stop(t + 0.15);
}

function playSwirl(ctx: AudioContext, progress: number) {
  const t = ctx.currentTime;
  const duration = 0.4 + (progress / 100) * 0.2;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600 + progress * 8, t);
  filter.Q.setValueAtTime(5, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(t);
  source.stop(t + duration);
}

function playCompletionChime(ctx: AudioContext) {
  const t = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5];

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t + i * 0.08);

    gain.gain.setValueAtTime(0, t + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.2, t + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.6);

    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.6);
  });
}

export function useSoundEngine(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, [enabled]);

  const playMixClick = useCallback((progress: number) => {
    const ctx = getCtx();
    if (!ctx) return;

    playDrop(ctx, progress);
    if (Math.random() > 0.4) {
      setTimeout(() => playBubble(ctx, progress), 80 + Math.random() * 60);
    }
    if (Math.random() > 0.6) {
      setTimeout(() => playSwirl(ctx, progress), 30);
    }
  }, [getCtx]);

  const playComplete = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playCompletionChime(ctx);
  }, [getCtx]);

  const playReset = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  }, [getCtx]);

  return { playMixClick, playComplete, playReset };
}
