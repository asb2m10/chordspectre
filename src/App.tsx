import { useState, useEffect, useCallback } from 'react';
import { ChordGrid } from './components/ChordGrid';
import { CircleOfFifths, type Mode } from './components/CircleOfFifths';
import { initAudio, isAudioReady } from './utils/audio';
import './App.css';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function App() {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [rootKey, setRootKey] = useState(48); // C3
  const [octave, setOctave] = useState(3);
  const [mode, setMode] = useState<Mode>('major');
  const [playingNotes, setPlayingNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    setAudioInitialized(isAudioReady());
  }, []);

  const handleInitAudio = async () => {
    await initAudio();
    setAudioInitialized(true);
  };

  const handleRootKeyChange = (newRootKey: number) => {
    setRootKey(newRootKey);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handleOctaveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOctave = Number(e.target.value);
    setOctave(newOctave);
    // Update root key to same note in new octave
    const currentSemitone = rootKey % 12;
    setRootKey((newOctave + 1) * 12 + currentSemitone);
  };

  const handleChordPlay = useCallback((midiNotes: number[]) => {
    setPlayingNotes(new Set(midiNotes));
  }, []);

  const currentNote = NOTE_NAMES[rootKey % 12];
  const currentOctave = Math.floor(rootKey / 12) - 1;
  const modeLabel = mode === 'major' ? '' : 'm';

  return (
    <div className="app">
      <header className="app-header">
        <h1>ChordSpectre</h1>
        <p className="subtitle">Click a box to play a chord</p>
      </header>

      {!audioInitialized ? (
        <div className="init-prompt">
          <button className="init-button" onClick={handleInitAudio}>
            Click to Enable Audio
          </button>
          <p className="init-note">Browser requires user interaction to enable audio</p>
        </div>
      ) : (
        <>
          <div className="controls">
            <span className="current-key">{currentNote}{modeLabel}{currentOctave}</span>
            <label className="octave-selector">
              <span>Octave:</span>
              <select value={octave} onChange={handleOctaveChange}>
                {[2, 3, 4, 5].map((oct) => (
                  <option key={oct} value={oct}>
                    {oct}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <main className="main-content">
            <ChordGrid
              rootKey={rootKey}
              mode={mode}
              playingNotes={playingNotes}
              onChordPlay={handleChordPlay}
            />
          </main>

          <footer className="circle-section">
            <CircleOfFifths
              rootKey={rootKey}
              mode={mode}
              onRootKeyChange={handleRootKeyChange}
              onModeChange={handleModeChange}
              octave={octave}
              playingNotes={playingNotes}
            />
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
