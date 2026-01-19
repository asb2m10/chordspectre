import { useMemo } from 'react';
import './CircleOfFifths.css';

// Circle of fifths order (clockwise from top) - Major keys
const CIRCLE_MAJOR = [
  { name: 'C', semitone: 0 },
  { name: 'G', semitone: 7 },
  { name: 'D', semitone: 2 },
  { name: 'A', semitone: 9 },
  { name: 'E', semitone: 4 },
  { name: 'B', semitone: 11 },
  { name: 'F#', semitone: 6 },
  { name: 'Db', semitone: 1 },
  { name: 'Ab', semitone: 8 },
  { name: 'Eb', semitone: 3 },
  { name: 'Bb', semitone: 10 },
  { name: 'F', semitone: 5 },
];

// Relative minors (3 semitones below major)
const CIRCLE_MINOR = [
  { name: 'Am', semitone: 9 },
  { name: 'Em', semitone: 4 },
  { name: 'Bm', semitone: 11 },
  { name: 'F#m', semitone: 6 },
  { name: 'C#m', semitone: 1 },
  { name: 'G#m', semitone: 8 },
  { name: 'D#m', semitone: 3 },
  { name: 'Bbm', semitone: 10 },
  { name: 'Fm', semitone: 5 },
  { name: 'Cm', semitone: 0 },
  { name: 'Gm', semitone: 7 },
  { name: 'Dm', semitone: 2 },
];

export type Mode = 'major' | 'minor';

interface CircleOfFifthsProps {
  rootKey: number;
  mode: Mode;
  onRootKeyChange: (rootKey: number) => void;
  onModeChange: (mode: Mode) => void;
  octave: number;
  playingNotes: Set<number>;
}

export function CircleOfFifths({
  rootKey,
  mode,
  onRootKeyChange,
  onModeChange,
  octave,
  playingNotes
}: CircleOfFifthsProps) {
  const currentSemitone = rootKey % 12;

  // Get pitch classes of playing notes
  const playingPitchClasses = useMemo(() => {
    return new Set([...playingNotes].map(n => n % 12));
  }, [playingNotes]);

  const handleNoteClick = (semitone: number, noteMode: Mode) => {
    const newRootKey = (octave + 1) * 12 + semitone;
    onRootKeyChange(newRootKey);
    onModeChange(noteMode);
  };

  const getHighlightClass = (semitone: number, isActive: boolean) => {
    if (isActive) return '';
    if (playingPitchClasses.has(semitone)) return 'highlight';
    return '';
  };

  return (
    <div className="circle-of-fifths">
      <div className="circle-container">
        {/* Outer circle - Major keys */}
        {CIRCLE_MAJOR.map((note, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = note.semitone === currentSemitone && mode === 'major';
          const highlightClass = getHighlightClass(note.semitone, isActive);

          return (
            <button
              key={note.name}
              className={`circle-note major ${isActive ? 'active' : ''} ${highlightClass}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onClick={() => handleNoteClick(note.semitone, 'major')}
            >
              {note.name}
            </button>
          );
        })}

        {/* Inner circle - Minor keys */}
        {CIRCLE_MINOR.map((note, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = note.semitone === currentSemitone && mode === 'minor';
          const highlightClass = getHighlightClass(note.semitone, isActive);

          return (
            <button
              key={note.name}
              className={`circle-note minor ${isActive ? 'active' : ''} ${highlightClass}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onClick={() => handleNoteClick(note.semitone, 'minor')}
            >
              {note.name}
            </button>
          );
        })}

        <div className="circle-center">
          <span className="center-label">{mode === 'major' ? 'Maj' : 'Min'}</span>
        </div>
      </div>
    </div>
  );
}
