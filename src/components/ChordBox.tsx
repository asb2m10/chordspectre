import { useState } from 'react';
import type { ChordType, Degree, Mode } from '../utils/chords';
import { getChordInfo } from '../utils/chords';
import { playChord } from '../utils/audio';
import './ChordBox.css';

interface ChordBoxProps {
  degree: Degree;
  chordType: ChordType;
  rootKey: number;
  mode: Mode;
}

export function ChordBox({ degree, chordType, rootKey, mode }: ChordBoxProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    const chordInfo = getChordInfo(degree, chordType, rootKey, mode);
    playChord(chordInfo.notes);

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 300);
  };

  const chordInfo = getChordInfo(degree, chordType, rootKey, mode);
  const displayName = chordType.symbol == "" ? chordInfo.rootNote : `${chordInfo.rootNote}-${chordType.symbol}`;

  return (
    <button
      className={`chord-box ${isPlaying ? 'playing' : ''}`}
      onClick={handleClick}
      title={`${chordInfo.rootNote} ${chordType.name} (${chordInfo.notes.join(', ')})`}
    >
      <span className="chord-name">{displayName}</span>
    </button>
  );
}
