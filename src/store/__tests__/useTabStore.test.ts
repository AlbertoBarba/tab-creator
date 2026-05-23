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

  it('should add a new measure with default beats', () => {
    const { addMeasure } = useTabStore.getState();
    addMeasure();
    const measures = useTabStore.getState().song.measures;
    expect(measures).toHaveLength(2);
    expect(measures[1].id).toBeDefined();
    expect(measures[1].beats).toHaveLength(4); // Default 4/4
    expect(measures[1].beats[0].isRest).toBe(true);
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

  it('should set a note at specific coordinates', () => {
    const { setNote } = useTabStore.getState();
    setNote(0, 0, 0, 5);
    const note = useTabStore.getState().song.measures[0].beats[0].notes[0];
    expect(note.fret).toBe(5);
    expect(note.string).toBe(0);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(false);
  });

  it('should update an existing note', () => {
    const { setNote } = useTabStore.getState();
    setNote(0, 0, 0, 5);
    setNote(0, 0, 0, 7);
    const notes = useTabStore.getState().song.measures[0].beats[0].notes;
    expect(notes).toHaveLength(1);
    expect(notes[0].fret).toBe(7);
  });

  it('should delete a note', () => {
    const { setNote, deleteNote } = useTabStore.getState();
    setNote(0, 0, 0, 5);
    deleteNote(0, 0, 0);
    expect(useTabStore.getState().song.measures[0].beats[0].notes).toHaveLength(0);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(true);
  });

  it('should update the duration of a beat', () => {
    const { setDuration } = useTabStore.getState();
    setDuration(0, 0, 0.5); // Set to eighth note
    expect(useTabStore.getState().song.measures[0].beats[0].duration).toBe(0.5);
  });

  it('should update the time signature', () => {
    const { updateTimeSignature } = useTabStore.getState();
    updateTimeSignature(3, 4);
    expect(useTabStore.getState().song.timeSignature).toEqual([3, 4]);
  });

  it('should toggle a beat to rest', () => {
    const { setNote, toggleRest } = useTabStore.getState();
    setNote(0, 0, 0, 5);
    toggleRest(0, 0);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(true);
    expect(useTabStore.getState().song.measures[0].beats[0].notes).toHaveLength(0);
  });

  it('should add a beat at specific position', () => {
    const { addBeat } = useTabStore.getState();
    addBeat(0, 0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(5);
    // Should insert AFTER the current beat
    expect(useTabStore.getState().song.measures[0].beats[1].isRest).toBe(true);
  });

  it('should delete a beat', () => {
    const { deleteBeat } = useTabStore.getState();
    deleteBeat(0, 0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(3);
  });

  it('should not delete the last beat of a measure', () => {
    const { deleteBeat } = useTabStore.getState();
    // initial measure has 4 beats
    deleteBeat(0, 0);
    deleteBeat(0, 0);
    deleteBeat(0, 0);
    deleteBeat(0, 0); // 4th attempt to delete
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(1);
  });

  it('should adjust cursor if it was on the deleted beat', () => {
    const { deleteBeat, setCursor } = useTabStore.getState();
    setCursor({ measureIndex: 0, beatIndex: 3 });
    deleteBeat(0, 3);
    expect(useTabStore.getState().cursor.beatIndex).toBe(2);
  });

  it('should fill a measure with rests to match time signature', () => {
    const { fillMeasureWithRests, deleteBeat } = useTabStore.getState();
    
    // Initial measure in 4/4 has 4 beats of duration 1 (total = 4)
    // Delete two beats, so total duration = 2
    deleteBeat(0, 0);
    deleteBeat(0, 0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(2);
    
    fillMeasureWithRests(0);
    
    const beats = useTabStore.getState().song.measures[0].beats;
    expect(beats).toHaveLength(4);
    const totalDuration = beats.reduce((sum, b) => sum + b.duration, 0);
    expect(totalDuration).toBe(4);
  });

  it('should handle fractional durations when filling with rests', () => {
    const { fillMeasureWithRests, setDuration, deleteBeat } = useTabStore.getState();
    
    // Total duration should be 4 for 4/4
    // Set first beat to 0.5 (eighth) and delete others
    setDuration(0, 0, 0.5);
    deleteBeat(0, 1);
    deleteBeat(0, 1);
    deleteBeat(0, 1);
    
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(1);
    expect(useTabStore.getState().song.measures[0].beats[0].duration).toBe(0.5);
    
    fillMeasureWithRests(0);
    
    const beats = useTabStore.getState().song.measures[0].beats;
    const totalDuration = beats.reduce((sum, b) => sum + b.duration, 0);
    expect(totalDuration).toBeCloseTo(4);
  });
});
