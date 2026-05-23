import { create } from 'zustand';
import { Song, Beat } from '../types/tab';

export interface Cursor {
  measureIndex: number;
  beatIndex: number;
  stringIndex: number;
}

interface TabState {
  song: Song;
  cursor: Cursor;
  updateTitle: (title: string) => void;
  updateArtist: (artist: string) => void;
  setTempo: (tempo: number) => void;
  addMeasure: () => void;
  deleteMeasure: (index: number) => void;
  setCursor: (cursor: Partial<Cursor>, shiftKey?: boolean) => void;
  moveCursor: (direction: 'up' | 'down' | 'left' | 'right', shiftKey?: boolean) => void;
  setNote: (measureIndex: number, beatIndex: number, stringIndex: number, fret: number) => void;
  deleteNote: (measureIndex: number, beatIndex: number, stringIndex: number) => void;
  setDuration: (measureIndex: number, beatIndex: number, duration: number) => void;
  toggleDot: (measureIndex: number, beatIndex: number) => void;
  toggleTriplet: (measureIndex: number, beatIndex: number) => void;
  updateTimeSignature: (num: number, den: number) => void;
  toggleRest: (mIdx: number, bIdx: number) => void;
  addBeat: (mIdx: number, bIdx: number) => void;
  deleteBeat: (mIdx: number, bIdx: number) => void;
  fillMeasureWithRests: (mIdx: number) => void;
  setTechnique: (mIdx: number, bIdx: number, sIdx: number, technique: string | undefined) => void;
  setMeasureLabel: (mIdx: number, label: string | undefined) => void;
  updateTuning: (tuning: string[]) => void;
  loadSong: (song: Song) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selection: { start: Cursor; end: Cursor } | null;
  setSelection: (range: { start: Cursor; end: Cursor } | null) => void;
  clipboard: Beat[] | null;
  copy: () => void;
  paste: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playhead: { measureIndex: number, beatIndex: number } | null;
  setPlayhead: (playhead: { measureIndex: number, beatIndex: number } | null) => void;
}

export const initialSong: Song = {
  title: 'New Bass Line',
  artist: '',
  tempo: 120,
  timeSignature: [4, 4],
  tuning: ['E1', 'A1', 'D2', 'G2'],
  measures: [
    {
      id: 'initial-measure',
      beats: [],
    },
  ],
};

export const useTabStore = create<TabState>((set) => ({
  song: initialSong,
  cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 },
  theme: 'dark',
  selection: null,
  clipboard: null,
  isPlaying: false,
  playhead: null,
  updateTitle: (title) => set((state) => ({ song: { ...state.song, title } })),
  updateArtist: (artist) => set((state) => ({ song: { ...state.song, artist } })),
  setTempo: (tempo) => set((state) => ({ song: { ...state.song, tempo } })),
  setIsPlaying: (isPlaying) => set((state) => ({ isPlaying, playhead: isPlaying ? state.playhead : null })),
  setPlayhead: (playhead) => set({ playhead }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSelection: (selection) => set({ selection }),
  copy: () => set((state) => {
    const { selection, cursor, song } = state;
    const copiedBeats: Beat[] = [];

    if (selection) {
      const { start, end } = selection;
      const mMin = Math.min(start.measureIndex, end.measureIndex);
      const mMax = Math.max(start.measureIndex, end.measureIndex);

      for (let m = mMin; m <= mMax; m++) {
        const measure = song.measures[m];
        let bStart = 0;
        let bEnd = measure.beats.length - 1;

        if (m === start.measureIndex && m === end.measureIndex) {
          bStart = Math.min(start.beatIndex, end.beatIndex);
          bEnd = Math.max(start.beatIndex, end.beatIndex);
        } else if (m === mMin) {
          bStart = start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex;
        } else if (m === mMax) {
          bEnd = start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex;
        }

        for (let b = bStart; b <= bEnd; b++) {
          copiedBeats.push(JSON.parse(JSON.stringify(measure.beats[b])));
        }
      }
    } else {
      const currentBeat = song.measures[cursor.measureIndex].beats[cursor.beatIndex];
      if (currentBeat) {
        copiedBeats.push(JSON.parse(JSON.stringify(currentBeat)));
      }
    }

    return { clipboard: copiedBeats };
  }),
  paste: () => set((state) => {
    if (!state.clipboard) return state;

    const { cursor, song, clipboard } = state;
    const newMeasures = [...song.measures];
    let currentM = cursor.measureIndex;
    let currentB = cursor.beatIndex;

    clipboard.forEach((beat) => {
      if (currentM >= newMeasures.length) return;
      
      const measure = { ...newMeasures[currentM] };
      const beats = [...measure.beats];
      
      if (currentB < beats.length) {
        beats[currentB] = JSON.parse(JSON.stringify(beat));
      } else {
        beats.push(JSON.parse(JSON.stringify(beat)));
      }
      
      measure.beats = beats;
      newMeasures[currentM] = measure;
      currentB++;
    });

    return { song: { ...song, measures: newMeasures } };
  }),
  addMeasure: () => set((state) => {
    const newMeasure = {
      id: Math.random().toString(36).substring(2, 9),
      beats: []
    };
    const newMeasures = [...state.song.measures, newMeasure];
    return {
      song: {
        ...state.song,
        measures: newMeasures
      },
      cursor: {
        ...state.cursor,
        measureIndex: newMeasures.length - 1,
        beatIndex: 0
      },
      selection: null
    };
  }),
  deleteMeasure: (index: number) => set((state) => {
    if (state.song.measures.length <= 1) return state;
    const newMeasures = state.song.measures.filter((_, i) => i !== index);
    let { measureIndex, beatIndex } = state.cursor;
    if (measureIndex >= index) {
      measureIndex = Math.max(0, measureIndex - 1);
      beatIndex = 0;
    }
    return {
      song: { ...state.song, measures: newMeasures },
      cursor: { ...state.cursor, measureIndex, beatIndex }
    };
  }),
  setCursor: (newCursor, shiftKey = false) => set((state) => {
    const nextCursor = { ...state.cursor, ...newCursor };
    return {
      cursor: nextCursor,
      selection: shiftKey ? { start: state.selection?.start || state.cursor, end: nextCursor } : null
    };
  }),
  moveCursor: (direction, shiftKey = false) => set((state) => {
    const { cursor, song, selection } = state;
    let { measureIndex, beatIndex, stringIndex } = cursor;

    if (direction === 'up') stringIndex = Math.max(0, stringIndex - 1);
    if (direction === 'down') stringIndex = Math.min(song.tuning.length - 1, stringIndex + 1);
    
    if (direction === 'left') {
      if (beatIndex > 0) {
        beatIndex--;
      } else if (measureIndex > 0) {
        measureIndex--;
        beatIndex = Math.max(0, song.measures[measureIndex].beats.length - 1);
      }
    }
    
    if (direction === 'right') {
      const measure = song.measures[measureIndex];
      const expectedDuration = song.timeSignature[0] * (4 / song.timeSignature[1]);
      const currentDuration = measure.beats.reduce((sum, b) => sum + b.duration, 0);

      if (beatIndex < measure.beats.length - 1) {
        beatIndex++;
      } else if (currentDuration < expectedDuration - 0.001) {
        const newMeasures = [...song.measures];
        const newMeasure = { 
          ...measure, 
          beats: [...measure.beats, { duration: 1, isRest: true, notes: [] }] 
        };
        newMeasures[measureIndex] = newMeasure;
        const newCursor = { ...cursor, beatIndex: beatIndex + 1 };
        return {
          song: { ...song, measures: newMeasures },
          cursor: newCursor,
          selection: shiftKey ? { start: selection?.start || cursor, end: newCursor } : null
        };
      } else if (measureIndex < song.measures.length - 1) {
        measureIndex++;
        beatIndex = 0;
      } else {
        const newMeasure = {
          id: Math.random().toString(36).substring(2, 9),
          beats: []
        };
        const newMeasures = [...song.measures, newMeasure];
        const newCursor = { ...cursor, measureIndex: measureIndex + 1, beatIndex: 0 };
        return {
          song: { ...song, measures: newMeasures },
          cursor: newCursor,
          selection: shiftKey ? { start: selection?.start || cursor, end: newCursor } : null
        };
      }
    }

    const newCursor = { measureIndex, beatIndex, stringIndex };
    return { 
      cursor: newCursor,
      selection: shiftKey ? { start: selection?.start || cursor, end: newCursor } : null
    };
  }),
  setNote: (mIdx, bIdx, sIdx, fret) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
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
    // Reset modifiers when explicitly setting duration
    beats[bIdx] = { ...beats[bIdx], duration, isDotted: false, isTriplet: false };
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    return { song: { ...state.song, measures: newMeasures } };
  }),
  toggleDot: (mIdx, bIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
    
    if (beat.isTriplet) return state; // Can't dot a triplet for now
    
    const wasDotted = !!beat.isDotted;
    beat.isDotted = !wasDotted;
    beat.duration = wasDotted ? (beat.duration / 1.5) : (beat.duration * 1.5);
    
    beats[bIdx] = beat;
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    return { song: { ...state.song, measures: newMeasures } };
  }),
  toggleTriplet: (mIdx, bIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
    
    if (beat.isDotted) return state; // Can't triplet a dotted note
    
    const wasTriplet = !!beat.isTriplet;
    beat.isTriplet = !wasTriplet;
    beat.duration = wasTriplet ? (beat.duration / (2/3)) : (beat.duration * (2/3));
    
    beats[bIdx] = beat;
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    return { song: { ...state.song, measures: newMeasures } };
  }),
  updateTimeSignature: (num, den) => set((state) => ({
    song: { ...state.song, timeSignature: [num, den] }
  })),
  toggleRest: (mIdx, bIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    beats[bIdx] = { ...beats[bIdx], isRest: true, notes: [] };
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    return { song: { ...state.song, measures: newMeasures } };
  }),
  addBeat: (mIdx, bIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const newBeat = { duration: 1, isRest: true, notes: [] };
    beats.splice(bIdx + 1, 0, newBeat);
    measure.beats = beats;
    newMeasures[mIdx] = measure;
    return { song: { ...state.song, measures: newMeasures } };
  }),
  deleteBeat: (mIdx, bIdx) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    if (beats.length === 0) return state;

    const beatToDelete = beats[bIdx];
    if (!beatToDelete.isRest) {
      // If it's a note, turn it into a rest of the same duration
      beats[bIdx] = { ...beatToDelete, isRest: true, notes: [] };
    } else {
      // If it's already a rest, remove it entirely
      beats.splice(bIdx, 1);
    }

    measure.beats = beats;
    newMeasures[mIdx] = measure;
    let { beatIndex } = state.cursor;
    if (beatIndex >= beats.length) beatIndex = Math.max(0, beats.length - 1);
    return { 
      song: { ...state.song, measures: newMeasures },
      cursor: { ...state.cursor, beatIndex }
    };
  }),
  fillMeasureWithRests: (mIdx) => set((state) => {
    const song = state.song;
    const measure = { ...song.measures[mIdx] };
    const expected = song.timeSignature[0] * (4 / song.timeSignature[1]);
    let current = measure.beats.reduce((sum, b) => sum + b.duration, 0);
    if (current >= expected - 0.001) return state;
    const newBeats = [...measure.beats];
    while (current < expected - 0.001) {
      const remaining = expected - current;
      let duration = 1;
      if (remaining < 1) duration = remaining;
      newBeats.push({ duration, isRest: true, notes: [] });
      current += duration;
    }
    measure.beats = newBeats;
    const newMeasures = [...song.measures];
    newMeasures[mIdx] = measure;
    return { song: { ...song, measures: newMeasures } };
  }),
  setTechnique: (mIdx, bIdx, sIdx, technique) => set((state) => {
    const newMeasures = [...state.song.measures];
    const measure = { ...newMeasures[mIdx] };
    const beats = [...measure.beats];
    const beat = { ...beats[bIdx] };
    const newNotes = [...beat.notes];
    const noteIndex = newNotes.findIndex(n => n.string === sIdx);
    if (noteIndex >= 0) {
      newNotes[noteIndex] = { ...newNotes[noteIndex], technique: technique as any };
      beat.notes = newNotes;
      beats[bIdx] = beat;
      measure.beats = beats;
      newMeasures[mIdx] = measure;
      return { song: { ...state.song, measures: newMeasures } };
    }
    return state;
  }),
  setMeasureLabel: (mIdx, label) => set((state) => {
    const newMeasures = [...state.song.measures];
    newMeasures[mIdx] = { ...newMeasures[mIdx], label };
    return { song: { ...state.song, measures: newMeasures } };
  }),
  updateTuning: (tuning) => set((state) => {
    const newMeasures = state.song.measures.map(measure => ({
      ...measure,
      beats: measure.beats.map(beat => ({
        ...beat,
        notes: beat.notes.filter(note => note.string < tuning.length)
      }))
    }));
    return { 
      song: { ...state.song, tuning, measures: newMeasures },
      cursor: { ...state.cursor, stringIndex: Math.min(state.cursor.stringIndex, tuning.length - 1) }
    };
  }),
  loadSong: (song) => set({ 
    song, 
    cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 }, 
    selection: null 
  }),
}));
