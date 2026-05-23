import { create } from 'zustand';
import { Song } from '../types/tab';

interface TabState {
  song: Song;
  updateTitle: (title: string) => void;
  addMeasure: () => void;
}

const initialSong: Song = {
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
  updateTitle: (title) => set((state) => ({ song: { ...state.song, title } })),
  addMeasure: () => set((state) => ({
    song: {
      ...state.song,
      measures: [
        ...state.song.measures,
        { id: Math.random().toString(36).substring(2, 9), beats: [] }
      ]
    }
  })),
}));
