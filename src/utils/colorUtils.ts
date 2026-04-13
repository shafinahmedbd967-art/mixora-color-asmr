import { RGB, Color } from '../types';

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function blendColors(colors: Color[], progress: number): RGB {
  if (colors.length === 0) return { r: 128, g: 128, b: 128 };
  if (colors.length === 1) return colors[0].rgb;

  const t = progress / 100;
  const target: RGB = {
    r: colors.reduce((s, c) => s + c.rgb.r, 0) / colors.length,
    g: colors.reduce((s, c) => s + c.rgb.g, 0) / colors.length,
    b: colors.reduce((s, c) => s + c.rgb.b, 0) / colors.length,
  };

  return lerpRgb(colors[0].rgb, target, t);
}

export function rgbToString(rgb: RGB, alpha = 1): string {
  const r = Math.round(rgb.r);
  const g = Math.round(rgb.g);
  const b = Math.round(rgb.b);
  return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}

export function getLuminance(rgb: RGB): number {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastColor(rgb: RGB): string {
  return getLuminance(rgb) > 0.5 ? '#1a1a2e' : '#ffffff';
}

export function randomColor(): Color {
  const palettes: string[] = [
    '#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#e9c46a',
    '#e76f51', '#06d6a0', '#118ab2', '#ef476f', '#ffd166',
    '#06a77d', '#d62839', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
    '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#f39c12',
  ];
  const hex = palettes[Math.floor(Math.random() * palettes.length)];
  return { id: crypto.randomUUID(), hex, rgb: hexToRgb(hex) };
}

export function makeColor(hex: string): Color {
  return { id: crypto.randomUUID(), hex, rgb: hexToRgb(hex) };
}
