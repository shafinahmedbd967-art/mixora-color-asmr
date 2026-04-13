export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Color {
  id: string;
  hex: string;
  rgb: RGB;
}

export interface Ripple {
  id: string;
  x: number;
  y: number;
  startTime: number;
  color: string;
  maxRadius: number;
}

export interface MixRecord {
  id: string;
  colors: Color[];
  resultHex: string;
  resultRgb: RGB;
  timestamp: number;
}

export interface Blob {
  angle: number;
  orbitSpeed: number;
  maxOrbit: number;
  radius: number;
  colorIndex: number;
  wobbleAngle: number;
  wobbleSpeed: number;
  wobbleAmp: number;
}
