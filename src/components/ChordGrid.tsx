import type { Mode } from '../utils/chords';
import { DEGREES, getDiatonicChordsForDegree } from '../utils/chords';
import { ChordBox } from './ChordBox';
import './ChordGrid.css';

interface ChordGridProps {
  rootKey: number;
  mode: Mode;
  playingNotes: Set<number>;
  onChordPlay: (midiNotes: number[]) => void;
}

export function ChordGrid({ rootKey, mode, playingNotes, onChordPlay }: ChordGridProps) {
  return (
    <div className="chord-grid">
      {DEGREES.map((degree) => {
        const chordTypes = getDiatonicChordsForDegree(degree, mode);
        return (
          <div key={degree} className="degree-column">
            <div className="degree-header">{degree}</div>
            <div className="chord-stack">
              {chordTypes.map((chordType) => (
                <ChordBox
                  key={`${degree}-${chordType.id}`}
                  degree={degree}
                  chordType={chordType}
                  rootKey={rootKey}
                  mode={mode}
                  playingNotes={playingNotes}
                  onChordPlay={onChordPlay}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
