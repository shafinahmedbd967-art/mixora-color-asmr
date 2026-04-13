import { useState } from 'react';
import { MixRecord } from '../types';

interface Props {
  history: MixRecord[];
  favorites: MixRecord[];
  onLoad: (record: MixRecord) => void;
  onFavorite: (record: MixRecord) => void;
  currentHex: string;
  progress: number;
}

function RecordCard({ record, onLoad, onFavorite, isFavorite }: {
  record: MixRecord;
  onLoad: (r: MixRecord) => void;
  onFavorite: (r: MixRecord) => void;
  isFavorite: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.resultHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group relative flex-shrink-0 cursor-pointer"
      onClick={() => onLoad(record)}
      title={`Load mix: ${record.resultHex}`}
    >
      <div
        className="w-12 h-12 rounded-xl transition-all duration-200 group-hover:scale-110 group-hover:rounded-2xl"
        style={{
          background: record.resultHex,
          boxShadow: `0 0 12px ${record.resultHex}50, 0 2px 8px rgba(0,0,0,0.4)`,
        }}
      />
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <span className="font-mono text-xs text-white/50 whitespace-nowrap">{record.resultHex.toUpperCase()}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(record); }}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        style={{
          background: isFavorite ? 'rgba(251, 191, 36, 0.9)' : 'rgba(50, 50, 70, 0.9)',
          border: isFavorite ? '1px solid rgba(251, 191, 36, 0.6)' : '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill={isFavorite ? 'white' : 'none'} stroke="white" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
      <button
        onClick={handleCopy}
        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        style={{
          background: copied ? 'rgba(16, 185, 129, 0.9)' : 'rgba(50, 50, 70, 0.9)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        title="Copy HEX"
      >
        {copied ? (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function HistoryPanel({ history, favorites, onLoad, onFavorite, currentHex, progress }: Props) {
  const [tab, setTab] = useState<'history' | 'favorites'>('history');

  const displayList = tab === 'history' ? history : favorites;

  if (history.length === 0 && favorites.length === 0) return null;

  return (
    <div
      className="w-full max-w-lg rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(['history', 'favorites'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-200"
              style={{
                background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === t ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                border: tab === t ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              }}
            >
              {t === 'history' ? `History (${history.length})` : `Favorites (${favorites.length})`}
            </button>
          ))}
        </div>
        {progress === 100 && (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex-shrink-0"
              style={{ background: currentHex, boxShadow: `0 0 8px ${currentHex}80` }}
            />
            <span className="font-mono text-xs" style={{ color: currentHex }}>
              {currentHex.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {displayList.length === 0 ? (
        <p className="text-center text-white/20 text-xs py-3">
          {tab === 'favorites' ? 'Star mixes to save them here' : 'Complete a mix to see it here'}
        </p>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-6 pt-1 scrollbar-thin">
          {displayList.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onLoad={onLoad}
              onFavorite={onFavorite}
              isFavorite={!!favorites.find(f => f.id === record.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
