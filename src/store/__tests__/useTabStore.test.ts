import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore } from '../useTabStore';

describe('useTabStore', () => {
  beforeEach(() => {
    // Reset store state before each test if needed
    // Zustand doesn't have a built-in reset, so we might need to handle it manually
    // or just rely on the initial state for the first test and then see.
  });

  it('should have an initial state', () => {
    const state = useTabStore.getState();
    expect(state.song.title).toBe('New Bass Line');
    expect(state.song.artist).toBe('Unknown Artist');
    expect(state.song.measures).toHaveLength(1);
    expect(state.song.measures[0].id).toBe('initial-measure');
  });

  it('should update the song title', () => {
    const { updateTitle } = useTabStore.getState();
    updateTitle('My New Song');
    expect(useTabStore.getState().song.title).toBe('My New Song');
  });

  it('should add a new measure', () => {
    const { addMeasure } = useTabStore.getState();
    addMeasure();
    const measures = useTabStore.getState().song.measures;
    expect(measures).toHaveLength(2);
    expect(measures[1].id).toBeDefined();
    expect(measures[1].beats).toEqual([]);
  });
});
