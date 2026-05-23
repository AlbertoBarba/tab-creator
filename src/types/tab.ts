export interface Note {
  string: number;
  fret: number;
  technique?: 'slide' | 'hammer' | 'pull' | 'mute' | 'vibrato';
}

export interface Beat {
  duration: number; // 1 = quarter, 0.5 = eighth, etc.
  isRest: boolean;
  notes: Note[];
}

export interface Measure {
  id: string;
  label?: string;
  beats: Beat[];
}

export interface Song {
  title: string;
  artist: string;
  tempo: number;
  timeSignature: [number, number];
  tuning: string[];
  measures: Measure[];
}
