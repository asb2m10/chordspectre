// Scale degrees (Roman numerals)
export const DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

// Chord quality types
export const CHORD_TYPES = [
  { name: 'Major', symbol: '', intervals: [0, 4, 7], id: 'major' },
  { name: 'Minor', symbol: 'm', intervals: [0, 3, 7], id: 'minor' },
  { name: 'Diminished', symbol: 'dim', intervals: [0, 3, 6], id: 'dim' },
  { name: 'Augmented', symbol: 'aug', intervals: [0, 4, 8], id: 'aug' },
  { name: 'Sus2', symbol: 'sus2', intervals: [0, 2, 7], id: 'sus2' },
  { name: 'Sus4', symbol: 'sus4', intervals: [0, 5, 7], id: 'sus4' },
  { name: 'Major 7', symbol: 'maj7', intervals: [0, 4, 7, 11], id: 'maj7' },
  { name: 'Minor 7', symbol: 'm7', intervals: [0, 3, 7, 10], id: 'm7' },
  { name: 'Dominant 7', symbol: '7', intervals: [0, 4, 7, 10], id: 'dom7' },
  { name: 'Dim 7', symbol: 'dim7', intervals: [0, 3, 6, 9], id: 'dim7' },
] as const;

// Note names for display
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Semitones from root for each scale degree in major scale
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

// Semitones from root for each scale degree in natural minor scale
const MINOR_DEGREE_SEMITONES = [0, 2, 3, 5, 7, 8, 10];

export type ChordType = typeof CHORD_TYPES[number];
export type Degree = typeof DEGREES[number];
export type Mode = 'major' | 'minor';

// Diatonic chord qualities for major key (I, ii, iii, IV, V, vi, vii°)
const MAJOR_DIATONIC: Record<Degree, string[]> = {
  'I': ['major', 'maj7'],
  'II': ['minor', 'm7'],
  'III': ['minor', 'm7'],
  'IV': ['major', 'maj7'],
  'V': ['major', 'dom7'],
  'VI': ['minor', 'm7'],
  'VII': ['dim', 'dim7'],
};

// Diatonic chord qualities for natural minor key (i, ii°, III, iv, v, VI, VII)
const MINOR_DIATONIC: Record<Degree, string[]> = {
  'I': ['minor', 'm7'],
  'II': ['dim', 'dim7'],
  'III': ['major', 'maj7'],
  'IV': ['minor', 'm7'],
  'V': ['minor', 'm7', 'major', 'dom7'], // include V major for harmonic minor
  'VI': ['major', 'maj7'],
  'VII': ['major', 'dom7'],
};

export interface ChordInfo {
  degree: Degree;
  chordType: ChordType;
  rootNote: string;
  notes: string[];
  midiNotes: number[];
}

// Get the chord types that are diatonic for a given mode
export function getDiatonicChordTypes(mode: Mode): ChordType[] {
  const diatonic = mode === 'major' ? MAJOR_DIATONIC : MINOR_DIATONIC;
  const allDiatonicIds = new Set<string>();

  for (const degree of DEGREES) {
    for (const id of diatonic[degree]) {
      allDiatonicIds.add(id);
    }
  }

  return CHORD_TYPES.filter(ct => allDiatonicIds.has(ct.id));
}

// Check if a chord type is diatonic for a given degree and mode
export function isDiatonic(degree: Degree, chordType: ChordType, mode: Mode): boolean {
  const diatonic = mode === 'major' ? MAJOR_DIATONIC : MINOR_DIATONIC;
  return diatonic[degree].includes(chordType.id);
}

// Get diatonic chord types for a specific degree
export function getDiatonicChordsForDegree(degree: Degree, mode: Mode): ChordType[] {
  const diatonic = mode === 'major' ? MAJOR_DIATONIC : MINOR_DIATONIC;
  const chordIds = diatonic[degree];
  return CHORD_TYPES.filter(ct => chordIds.includes(ct.id));
}

// Convert MIDI note number to note name with octave
function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// Get chord info for a given degree and chord type
export function getChordInfo(
  degree: Degree,
  chordType: ChordType,
  rootKey: number = 60,
  mode: Mode = 'major',
): ChordInfo {
  const degreeIndex = DEGREES.indexOf(degree);
  const degreeSemitones = mode === 'major' ? MAJOR_DEGREE_SEMITONES : MINOR_DEGREE_SEMITONES;
  const rootMidi = rootKey + degreeSemitones[degreeIndex];

  const midiNotes = chordType.intervals.map(interval => rootMidi + interval);
  const notes = midiNotes.map(midiToNoteName);
  const rootNote = NOTE_NAMES[(rootMidi) % 12];

  return {
    degree,
    chordType,
    rootNote,
    notes,
    midiNotes,
  };
}

// Get display name for a chord
export function getChordDisplayName(degree: Degree, chordType: ChordType): string {
  return `${degree}${chordType.symbol}`;
}
