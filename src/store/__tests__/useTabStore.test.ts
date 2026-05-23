import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore, initialSong } from '../useTabStore';

describe('useTabStore', () => {
  beforeEach(() => {
    useTabStore.setState({
      song: initialSong,
      cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 }
    });
  });

  it('should have an initial state', () => {
    const state = useTabStore.getState();
    expect(state.song.title).toBe('New Bass Line');
    expect(state.song.artist).toBe('Unknown Artist');
    expect(state.song.measures).toHaveLength(1);
    expect(state.song.measures[0].id).toBe('initial-measure');
    expect(state.cursor).toEqual({ measureIndex: 0, beatIndex: 0, stringIndex: 0 });
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

  it('should move cursor right', () => {
    const { moveCursor } = useTabStore.getState();
    moveCursor('right');
    expect(useTabStore.getState().cursor.beatIndex).toBe(1);
  });

  it('should move cursor down', () => {
    const { moveCursor } = useTabStore.getState();
    moveCursor('down');
    expect(useTabStore.getState().cursor.stringIndex).toBe(1);
  });

  it('should move cursor up and stay at boundary', () => {
    const { moveCursor } = useTabStore.getState();
    moveCursor('up');
    expect(useTabStore.getState().cursor.stringIndex).toBe(0);
  });

  it('should move cursor left and stay at boundary', () => {
    const { moveCursor } = useTabStore.getState();
    moveCursor('left');
    expect(useTabStore.getState().cursor.measureIndex).toBe(0);
    expect(useTabStore.getState().cursor.beatIndex).toBe(0);
  });

  it('should move cursor across measures', () => {
    const { setCursor, moveCursor, addMeasure } = useTabStore.getState();
    
    // Add another measure with beats
    useTabStore.setState((state) => ({
      song: {
        ...state.song,
        measures: [
          ...state.song.measures,
          {
            id: 'measure-2',
            beats: [
              { duration: 1, isRest: true, notes: [] }
            ]
          }
        ]
      }
    }));

    // Set cursor to last beat of first measure
    setCursor({ measureIndex: 0, beatIndex: 3 });
    
    // Move right
    moveCursor('right');
    
    const state = useTabStore.getState();
    expect(state.cursor.measureIndex).toBe(1);
    expect(state.cursor.beatIndex).toBe(0);

    // Move left back to first measure
    moveCursor('left');
    expect(useTabStore.getState().cursor.measureIndex).toBe(0);
    expect(useTabStore.getState().cursor.beatIndex).toBe(3);
  });
});
