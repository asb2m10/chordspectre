import { useState, useMemo } from 'react';
import type { ChordType, Degree, Mode } from '../utils/chords';
import { getChordInfo } from '../utils/chords';
import { playChord } from '../utils/audio';
import './ChordBox.css';

interface ChordBoxProps {
  degree: Degree;
  chordType: ChordType;
  rootKey: number;
  mode: Mode;
  playingNotes: Set<number>;
  onChordPlay: (midiNotes: number[]) => void;
}

export function ChordBox({
  degree,
  chordType,
  rootKey,
  mode,
  playingNotes,
  onChordPlay,
}: ChordBoxProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const chordInfo = useMemo(
    () => getChordInfo(degree, chordType, rootKey, mode),
    [degree, chordType, rootKey, mode]
  );

  // Count how many notes this chord shares with the currently playing chord
  const sharedNotesCount = useMemo(() => {
    if (playingNotes.size === 0) return 0;
    // Compare by pitch class (note % 12) to match notes across octaves
    const playingPitchClasses = new Set([...playingNotes].map(n => n % 12));
    return chordInfo.midiNotes.filter(n => playingPitchClasses.has(n % 12)).length;
  }, [playingNotes, chordInfo.midiNotes]);

  const handleClick = () => {
    playChord(chordInfo.notes);
    onChordPlay(chordInfo.midiNotes);

    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 300);
  };

  const displayName = chordType.symbol == "" ? chordInfo.rootNote : `${chordInfo.rootNote}-${chordType.symbol}`;

  // Determine highlight class based on shared notes
  let highlightClass = '';
  if (!isPlaying && sharedNotesCount > 0) {
    if (sharedNotesCount >= 3) {
      highlightClass = 'highlight-high';
    } else if (sharedNotesCount === 2) {
      highlightClass = 'highlight-medium';
    } else {
      highlightClass = 'highlight-low';
    }
  }

  return (
    <button
      className={`chord-box ${isPlaying ? 'playing' : ''} ${highlightClass}`}
      onClick={handleClick}
      title={`${chordInfo.rootNote} ${chordType.name} (${chordInfo.notes.join(', ')})`}
    >
      <span className="chord-name">{displayName}</span>
    </button>
  );
}
