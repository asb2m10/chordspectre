import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let isInitialized = false;

// Initialize audio context (must be called from user interaction)
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await Tone.start();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 1,
    },
  }).toDestination();

  synth.volume.value = -6;
  isInitialized = true;
}

// Play a chord given an array of note names (e.g., ['C4', 'E4', 'G4'])
export function playChord(notes: string[], duration: string = '2n'): void {
  if (!synth || !isInitialized) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  synth.triggerAttackRelease(notes, duration);
}

// Check if audio is initialized
export function isAudioReady(): boolean {
  return isInitialized;
}
