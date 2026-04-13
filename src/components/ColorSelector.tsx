import { useRef } from 'react';
import { Color } from '../types';
import { makeColor } from '../utils/colorUtils';

interface Props {
  colors: Color[];
  onUpdate: (index: number, color: Color) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  canAdd: boolean;
}

function ColorSlot({ color, index, onUpdate, onRemove, showRemove }: {
  color: Color;
  index: number;
  onUpdate: (index: number, color: Color) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative">
        <button
          onClick={() => inputRef.current?.click()}
          className="relative w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: color.hex,
            boxShadow: `0 0 20px ${color.hex}60, 0 4px 15px rgba(0,0,0,0.4)`,
          }}
          title="Click to change color"
        >
          <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
        {showRemove && (
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900 hover:border-red-600"
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
        )}
        <input
          ref={inputRef}
          type="color"
          value={color.hex}
          onChange={e => onUpdate(index, makeColor(e.target.value))}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
      <span
        className="font-mono text-xs tracking-wider transition-all duration-300"
        style={{ color: color.hex, textShadow: `0 0 8px ${color.hex}80` }}
      >
        {color.hex.toUpperCase()}
      </span>
    </div>
  );
}

export default function ColorSelector({ colors, onUpdate, onRemove, onAdd, canAdd }: Props) {
  return (
    <div className="flex items-end justify-center gap-4 flex-wrap">
      {colors.map((color, i) => (
        <ColorSlot
          key={color.id}
          color={color}
          index={i}
          onUpdate={onUpdate}
          onRemove={onRemove}
          showRemove={colors.length > 2}
        />
      ))}
      {canAdd && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAdd}
            className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center transition-all duration-300 hover:border-white/40 hover:scale-105 active:scale-95 hover:bg-white/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <span className="font-mono text-xs text-white/20 tracking-wider">ADD</span>
        </div>
      )}
    </div>
  );
}
