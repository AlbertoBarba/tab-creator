import { create } from 'zustand';
import { Song } from '../types/tab';

export interface Cursor {
  measureIndex: number;
  beatIndex: number;
  stringIndex: number;
}

interface TabState {
  song: Song;
  cursor: Cursor;
  updateTitle: (title: string) => void;
  addMeasure: () => void;
  deleteMeasure: (index: number) => void;
  setCursor: (cursor: Partial<Cursor>) => void;
  moveCursor: (direction: 'up' | 'down' | 'left' | 'right') => void;
  setNote: (measureIndex: number, beatIndex: number, stringIndex: number, fret: number) => void;
  deleteNote: (measureIndex: number, beatIndex: number, stringIndex: number) => void;
  setDuration: (measureIndex: number, beatIndex: number, duration: number) => void;
}

export const initialSong: Song = {
  title: 'New Bass Line',
  artist: 'Unknown Artist',
  tempo: 120,
  timeSignature: [4, 4],
  tuning: ['E1', 'A1', 'D2', 'G2'],
  measures: [
    {
      id: 'initial-measure',
      beats: [
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
      ],
    },
  ],
};

export const useTabStore = create<TabState>((set) => ({
  song: initialSong,
  cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 },
  updateTitle: (title) => set((state) => ({ song: { ...state.song, title } })),
  addMeasure: () => set((state) => {
    const beatsPerMeasure = state.song.timeSignature[0];
    const newMeasure = {
      id: Math.random().toString(36).substring(2, 9),
      beats: Array.from({ length: beatsPerMeasure }).map(() => ({
        duration: 1,
        isRest: true,
        notes: []
      }))
    };
    return {
      song: {
        ...state.song,
        measures: [...state.song.measures, newMeasure]
      }
    };
  }),
  deleteMeasure: (index: number) => set((state) => {
    if (state.song.measures.length <= 1) return state; // Don't delete the last measure

    const newMeasures = state.song.measures.filter((_, i) => i !== index);
    let { measureIndex, beatIndex } = state.cursor;

    // Adjust cursor if it was in the deleted measure or beyond
    if (measureIndex >= index) {
      measureIndex = Math.max(0, measureIndex - 1);
      beatIndex = 0;
    }

    return {
      song: { ...state.song, measures: newMeasures },
      cursor: { ...state.cursor, measureIndex, beatIndex }
    };
  }),
  setCursor: (newCursor) => set((state) => ({
    cursor: { ...state.cursor, ...newCursor }
  })),
  moveCursor: (direction) => set((state) => {
    const { cursor, song } = state;
    let { measureIndex, beatIndex, stringIndex } = cursor;

    if (direction === 'up') stringIndex = Math.max(0, stringIndex - 1);
    if (direction === 'down') stringIndex = Math.min(song.tuning.length - 1, stringIndex + 1);
    
    if (direction === 'left') {
      if (beatIndex > 0) {
        beatIndex--;
      } else if (measureIndex > 0) {
        measureIndex--;
        beatIndex = song.measures[measureIndex].beats.length - 1;
      }
    }
    
    if (direction === 'right') {
      if (beatIndex < song.measures[measureIndex].beats.length - 1) {
        beatIndex++;
      } else if (measureIndex < song.measures.length - 1) {
        measureIndex++;
        beatIndex = 0;
      } else {
        // Auto-add new measure when moving right at the very end
        const beatsPerMeasure = song.timeSignature[0];
        const newMeasure = {
          id: Math.random().toString(36).substring(2, 9),
          beats: Array.from({ length: beatsPerMeasure }).map(() => ({
            duration: 1,
            isRest: true,
            notes: []
          }))
        };
        const newMeasures = [...song.measures, newMeasure];
        return {
          song: { ...song, measures: newMeasures },
          cursor: { ...cursor, measureIndex: measureIndex + 1, beatIndex: 0 }
        };
      }
    }

    return { cursor: { measureIndex, beatIndex, stringIndex } };
  }),
  setNote: (mIdx, bIdx, sIdx, fret) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
    
    // Find if note on this string already exists, otherwise add it
    const noteIndex = beat.notes.findIndex(n => n.string === sIdx);
    const newNotes = [...beat.notes];
    
    if (noteIndex >= 0) {
      newNotes[noteIndex] = { ...newNotes[noteIndex], fret };
    } else {
      newNotes.push({ string: sIdx, fret });
    }
    
    beat.notes = newNotes;
    beat.isRest = false;
    beats[bIdx] = beat;
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    
    return { song: { ...state.song, measures: newMeasures } };
  }),
  deleteNote: (mIdx, bIdx, sIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
    
    beat.notes = beat.notes.filter(n => n.string !== sIdx);
    if (beat.notes.length === 0) beat.isRest = true;
    
    beats[bIdx] = beat;
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    
    return { song: { ...state.song, measures: newMeasures } };
  }),
  setDuration: (mIdx, bIdx, duration) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    beats[bIdx] = { ...beats[bIdx], duration };
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    
    return { song: { ...state.song, measures: newMeasures } };
  }),
}));
