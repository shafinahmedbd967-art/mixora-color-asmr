import { useState, useCallback } from 'react';
import Header from './components/Header';
import MixingBowl from './components/MixingBowl';
import ColorSelector from './components/ColorSelector';
import Controls from './components/Controls';
import HistoryPanel from './components/HistoryPanel';
import { useMixing } from './hooks/useMixing';
import { useSoundEngine } from './hooks/useSoundEngine';
import { randomColor } from './utils/colorUtils';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playMixClick, playComplete, playReset } = useSoundEngine(soundEnabled);

  const {
    selectedColors,
    mixProgress,
    history,
    favorites,
    autoMix,
    currentMixedHex,
    step,
    reset,
    addColor,
    updateColor,
    removeColor,
    randomizeColors,
    toggleFavorite,
    loadFromHistory,
    startAutoMix,
    stopAutoMix,
  } = useMixing();

  const canMix = selectedColors.length >= 2 && mixProgress < 100;

  const handleMixClick = useCallback((_x: number, _y: number) => {
    if (!canMix) return;
    const completed = step();
    playMixClick(mixProgress);
    if (completed) {
      playComplete();
    }
  }, [canMix, step, playMixClick, mixProgress, playComplete]);

  const handleReset = useCallback(() => {
    reset();
    playReset();
  }, [reset, playReset]);

  const handleAutoMix = useCallback(() => {
    if (autoMix) {
      stopAutoMix();
    } else {
      startAutoMix(
        () => playMixClick(mixProgress),
        () => playComplete(),
      );
    }
  }, [autoMix, stopAutoMix, startAutoMix, playMixClick, mixProgress, playComplete]);

  const handleAddColor = useCallback(() => {
    addColor(randomColor());
  }, [addColor]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0f0f1e 0%, #080810 60%, #050508 100%)',
        color: '#fff',
      }}
    >
      <Header soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(s => !s)} />

      <main className="flex-1 flex flex-col items-center gap-6 px-4 pb-10 pt-2">
        <ColorSelector
          colors={selectedColors}
          onUpdate={updateColor}
          onRemove={removeColor}
          onAdd={handleAddColor}
          canAdd={selectedColors.length < 3}
        />

        <MixingBowl
          colors={selectedColors}
          progress={mixProgress}
          mixedHex={currentMixedHex}
          onMixClick={handleMixClick}
          canMix={canMix}
        />

        <Controls
          onReset={handleReset}
          onRandom={randomizeColors}
          onAutoMix={handleAutoMix}
          autoMix={autoMix}
          canMix={canMix}
          progress={mixProgress}
        />

        <HistoryPanel
          history={history}
          favorites={favorites}
          onLoad={loadFromHistory}
          onFavorite={toggleFavorite}
          currentHex={currentMixedHex}
          progress={mixProgress}
        />
      </main>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${currentMixedHex}08 0%, transparent 60%)`,
          transition: 'background 1s ease',
        }}
      />
    </div>
  );
}
