interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function Header({ soundEnabled, onToggleSound }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9">
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #e63946, #2a9d8f, #e9c46a)',
              filter: 'blur(4px)',
              opacity: 0.7,
            }}
          />
          <div
            className="relative w-full h-full rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #e63946, #2a9d8f)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="8" r="5" fill="rgba(255,255,255,0.9)" />
              <circle cx="16" cy="8" r="5" fill="rgba(255,255,255,0.6)" />
              <circle cx="12" cy="15" r="5" fill="rgba(255,255,255,0.75)" />
            </svg>
          </div>
        </div>
        <div>
          <h1
            className="text-lg font-bold tracking-tight leading-none"
            style={{
              background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Mixora
          </h1>
          <p className="text-xs text-white/30 tracking-widest leading-none mt-0.5">COLOR ASMR LAB</p>
        </div>
      </div>

      <button
        onClick={onToggleSound}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: soundEnabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.05)',
          border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: soundEnabled ? 'rgb(16, 185, 129)' : 'rgba(255,255,255,0.4)',
        }}
      >
        {soundEnabled ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
        {soundEnabled ? 'ASMR ON' : 'ASMR OFF'}
      </button>
    </header>
  );
}
