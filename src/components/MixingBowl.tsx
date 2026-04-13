import { useRef, useEffect, useCallback, useState } from 'react';
import { Color, Blob, Ripple } from '../types';
import { rgbToString } from '../utils/colorUtils';

interface Props {
  colors: Color[];
  progress: number;
  mixedHex: string;
  onMixClick: (x: number, y: number) => void;
  canMix: boolean;
}

function initBlobs(colors: Color[], size: number): Blob[] {
  const blobs: Blob[] = [];
  const center = size / 2;
  const baseOrbit = center * 0.52;

  colors.forEach((_, colorIndex) => {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angleOffset = (colorIndex / colors.length) * Math.PI * 2 + (i / count) * Math.PI * 2;
      blobs.push({
        angle: angleOffset,
        orbitSpeed: (0.008 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
        maxOrbit: baseOrbit * (0.7 + Math.random() * 0.35),
        radius: size * (0.1 + Math.random() * 0.06),
        colorIndex,
        wobbleAngle: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.03,
        wobbleAmp: 0.08 + Math.random() * 0.06,
      });
    }
  });
  return blobs;
}

export default function MixingBowl({ colors, progress, mixedHex, onMixClick, canMix }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLCanvasElement>(null);
  const rippleRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef(480);
  const [size, setSize] = useState(480);
  const isCompletedRef = useRef(false);
  const completedFlashRef = useRef(0);
  const progressRef = useRef(progress);
  const colorsRef = useRef(colors);

  progressRef.current = progress;
  colorsRef.current = colors;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const s = Math.round(Math.min(w, 520));
      setSize(s);
      sizeRef.current = s;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    blobsRef.current = initBlobs(colors, sizeRef.current);
  }, [colors]);

  useEffect(() => {
    if (progress === 100 && !isCompletedRef.current) {
      isCompletedRef.current = true;
      completedFlashRef.current = Date.now();
    }
    if (progress === 0) {
      isCompletedRef.current = false;
    }
  }, [progress]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canMix) return;
    const rect = rippleRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = colors[Math.floor(Math.random() * colors.length)];
    ripplesRef.current.push({
      id: crypto.randomUUID(),
      x,
      y,
      startTime: Date.now(),
      color: color.hex,
      maxRadius: 60 + Math.random() * 40,
    });
    onMixClick(x, y);
  }, [canMix, colors, onMixClick]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canMix) return;
    const rect = rippleRef.current!.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const color = colors[Math.floor(Math.random() * colors.length)];
    ripplesRef.current.push({
      id: crypto.randomUUID(),
      x,
      y,
      startTime: Date.now(),
      color: color.hex,
      maxRadius: 60 + Math.random() * 40,
    });
    onMixClick(x, y);
  }, [canMix, colors, onMixClick]);

  useEffect(() => {
    const liquidCanvas = liquidRef.current;
    const rippleCanvas = rippleRef.current;
    if (!liquidCanvas || !rippleCanvas) return;

    const lCtx = liquidCanvas.getContext('2d')!;
    const rCtx = rippleCanvas.getContext('2d')!;

    function hexToRgba(hex: string, alpha: number) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function drawFrame() {
      const s = sizeRef.current;
      const cx = s / 2;
      const cy = s / 2;
      const prog = progressRef.current;
      const cols = colorsRef.current;
      const blobs = blobsRef.current;
      const now = Date.now();

      lCtx.clearRect(0, 0, s, s);

      blobs.forEach(blob => {
        blob.angle += blob.orbitSpeed;
        blob.wobbleAngle += blob.wobbleSpeed;

        const convergeFactor = 1 - (prog / 100) * 0.82;
        const orbit = blob.maxOrbit * convergeFactor;
        const wobbleX = Math.sin(blob.wobbleAngle) * orbit * blob.wobbleAmp;
        const wobbleY = Math.cos(blob.wobbleAngle * 1.3) * orbit * blob.wobbleAmp;

        const bx = cx + Math.cos(blob.angle) * orbit + wobbleX;
        const by = cy + Math.sin(blob.angle) * orbit + wobbleY;

        const blobRadius = blob.radius * (1 + (prog / 100) * 0.4);
        const colorIndex = blob.colorIndex % cols.length;
        const rgb = cols[colorIndex].rgb;

        const grad = lCtx.createRadialGradient(bx, by, 0, bx, by, blobRadius);
        grad.addColorStop(0, rgbToString(rgb, 1));
        grad.addColorStop(0.55, rgbToString(rgb, 0.9));
        grad.addColorStop(1, rgbToString(rgb, 0));

        lCtx.beginPath();
        lCtx.arc(bx, by, blobRadius, 0, Math.PI * 2);
        lCtx.fillStyle = grad;
        lCtx.fill();
      });

      if (prog === 100) {
        const elapsed = now - completedFlashRef.current;
        const pulse = Math.max(0, 1 - elapsed / 2000);
        if (pulse > 0) {
          const flashGrad = lCtx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.8);
          flashGrad.addColorStop(0, hexToRgba(colorsRef.current[0]?.hex || '#fff', 0.15 * pulse));
          flashGrad.addColorStop(1, hexToRgba(colorsRef.current[0]?.hex || '#fff', 0));
          lCtx.beginPath();
          lCtx.arc(cx, cy, cx * 0.8, 0, Math.PI * 2);
          lCtx.fillStyle = flashGrad;
          lCtx.fill();
        }
      }

      rCtx.clearRect(0, 0, s, s);

      ripplesRef.current = ripplesRef.current.filter(ripple => {
        const elapsed = (now - ripple.startTime) / 1000;
        const dur = 0.75;
        if (elapsed > dur) return false;

        const t = elapsed / dur;
        const radius = ripple.maxRadius * Math.pow(t, 0.6);
        const alpha = (1 - t) * 0.8;

        rCtx.beginPath();
        rCtx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        rCtx.strokeStyle = hexToRgba(ripple.color, alpha);
        rCtx.lineWidth = 2.5 * (1 - t * 0.7);
        rCtx.stroke();

        if (t < 0.3) {
          rCtx.beginPath();
          rCtx.arc(ripple.x, ripple.y, radius * 0.4, 0, Math.PI * 2);
          rCtx.strokeStyle = hexToRgba(ripple.color, alpha * 0.5);
          rCtx.lineWidth = 1.5;
          rCtx.stroke();
        }

        return true;
      });

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const progressDeg = (progress / 100) * 360;
  const r = size / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (progress / 100) * circumference;

  const getGlowColor = () => {
    if (progress === 100) return mixedHex;
    if (colors.length > 0) return colors[0].hex;
    return '#4ecdc4';
  };

  const glowIntensity = progress / 100;
  const glowColor = getGlowColor();

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="mixora-goo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={progress > 0 ? glowColor : 'transparent'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.3s ease, stroke 0.5s ease',
              filter: progress > 0 ? `drop-shadow(0 0 ${4 + glowIntensity * 8}px ${glowColor})` : 'none',
            }}
          />
        </svg>

        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            inset: 6,
            background: 'radial-gradient(circle at 40% 35%, #1a1a2e, #0d0d1a)',
            boxShadow: `
              inset 0 0 40px rgba(0,0,0,0.8),
              inset 0 0 80px rgba(0,0,0,0.4),
              0 0 ${20 + glowIntensity * 60}px ${glowColor}${Math.floor(glowIntensity * 60 + 20).toString(16).padStart(2, '0')},
              0 0 ${40 + glowIntensity * 100}px ${glowColor}${Math.floor(glowIntensity * 25 + 10).toString(16).padStart(2, '0')}
            `,
            transition: 'box-shadow 0.4s ease',
          }}
        />

        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            inset: 6,
            filter: 'url(#mixora-goo)',
            zIndex: 2,
          }}
        >
          <canvas
            ref={liquidRef}
            width={size - 12}
            height={size - 12}
            style={{ display: 'block' }}
          />
        </div>

        <canvas
          ref={rippleRef}
          width={size - 12}
          height={size - 12}
          onClick={handleClick}
          onTouchStart={handleTouch}
          className="absolute rounded-full overflow-hidden"
          style={{
            inset: 6,
            zIndex: 3,
            cursor: canMix ? 'crosshair' : 'default',
          }}
        />

        {progress > 0 && (
          <div
            className="absolute pointer-events-none flex flex-col items-center"
            style={{
              bottom: size * 0.12,
              left: 0,
              right: 0,
              zIndex: 4,
            }}
          >
            <span
              className="font-mono text-xs tracking-widest"
              style={{
                color: `rgba(255,255,255,${0.3 + glowIntensity * 0.5})`,
                textShadow: progress === 100 ? `0 0 12px ${glowColor}` : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {progress === 100 ? 'COMPLETE' : `${progress}%`}
            </span>
            {progress === 100 && (
              <span
                className="font-mono text-xs mt-1 tracking-wider"
                style={{ color: mixedHex, textShadow: `0 0 8px ${mixedHex}` }}
              >
                {mixedHex.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {!canMix && colors.length < 2 && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <p className="text-white/30 text-sm text-center px-8">
              Select at least<br />2 colors
            </p>
          </div>
        )}

        {canMix && progress < 100 && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
            style={{ zIndex: 4, opacity: progress > 5 ? 0 : 0.5 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center animate-bounce"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
              <span className="text-white/30 text-xs tracking-widest">TAP TO MIX</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes progressRef {
          from { stroke-dashoffset: ${circumference}; }
          to { stroke-dashoffset: ${dashOffset}; }
        }
      `}</style>
    </div>
  );
}
