import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore, initialSong } from '../useTabStore';

describe('useTabStore', () => {
  beforeEach(() => {
    useTabStore.setState({
      song: {
        ...initialSong,
        measures: [
          {
            id: 'initial-measure',
            beats: []
          }
        ]
      },
      cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 }
    });
  });

  it('should have an initial state', () => {
    const state = useTabStore.getState();
    expect(state.song.title).toBe('New Bass Line');
    expect(state.song.artist).toBe('');
    expect(state.song.measures).toHaveLength(1);
    expect(state.song.measures[0].id).toBe('initial-measure');
    expect(state.song.measures[0].beats).toHaveLength(0);
    expect(state.cursor).toEqual({ measureIndex: 0, beatIndex: 0, stringIndex: 0 });
  });

  it('should update the song title', () => {
    const { updateTitle } = useTabStore.getState();
    updateTitle('My New Song');
    expect(useTabStore.getState().song.title).toBe('My New Song');
  });

  it('should add a new measure with zero beats', () => {
    const { addMeasure } = useTabStore.getState();
    addMeasure();
    const measures = useTabStore.getState().song.measures;
    expect(measures).toHaveLength(2);
    expect(measures[1].id).toBeDefined();
    expect(measures[1].beats).toHaveLength(0);
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

  it('should set a note at specific coordinates', () => {
    const { setNote, addBeat } = useTabStore.getState();
    addBeat(0, -1); // Add first beat
    setNote(0, 0, 0, 5);
    const note = useTabStore.getState().song.measures[0].beats[0].notes[0];
    expect(note.fret).toBe(5);
    expect(note.string).toBe(0);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(false);
  });

  it('should update an existing note', () => {
    const { setNote, addBeat } = useTabStore.getState();
    addBeat(0, -1);
    setNote(0, 0, 0, 5);
    setNote(0, 0, 0, 7);
    const notes = useTabStore.getState().song.measures[0].beats[0].notes;
    expect(notes).toHaveLength(1);
    expect(notes[0].fret).toBe(7);
  });

  it('should set a technique on a note', () => {
    const { setNote, setTechnique, addBeat } = useTabStore.getState();
    addBeat(0, -1);
    setNote(0, 0, 0, 5);
    setTechnique(0, 0, 0, 'slide');
    const note = useTabStore.getState().song.measures[0].beats[0].notes[0];
    expect(note.technique).toBe('slide');
  });

  it('should clear a technique', () => {
    const { setNote, setTechnique, addBeat } = useTabStore.getState();
    addBeat(0, -1);
    setNote(0, 0, 0, 5);
    setTechnique(0, 0, 0, 'hammer');
    setTechnique(0, 0, 0, undefined);
    const note = useTabStore.getState().song.measures[0].beats[0].notes[0];
    expect(note.technique).toBeUndefined();
  });

  it('should update the duration of a beat', () => {
    const { setDuration, addBeat } = useTabStore.getState();
    addBeat(0, -1);
    setDuration(0, 0, 0.5); // Set to eighth note
    expect(useTabStore.getState().song.measures[0].beats[0].duration).toBe(0.5);
  });

  it('should update the time signature', () => {
    const { updateTimeSignature } = useTabStore.getState();
    updateTimeSignature(3, 4);
    expect(useTabStore.getState().song.timeSignature).toEqual([3, 4]);
  });

  it('should toggle a beat to rest', () => {
    const { setNote, toggleRest, addBeat } = useTabStore.getState();
    addBeat(0, -1);
    setNote(0, 0, 0, 5);
    toggleRest(0, 0);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(true);
    expect(useTabStore.getState().song.measures[0].beats[0].notes).toHaveLength(0);
  });

  it('should add a beat at specific position', () => {
    const { addBeat } = useTabStore.getState();
    addBeat(0, -1); // 1st
    addBeat(0, 0);  // 2nd
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(2);
    // Should insert AFTER the current beat
    expect(useTabStore.getState().song.measures[0].beats[1].isRest).toBe(true);
  });

  it('should turn a note beat into a rest when deleted', () => {
    const { addBeat, setNote, deleteBeat } = useTabStore.getState();
    addBeat(0, -1);
    setNote(0, 0, 0, 5);
    expect(useTabStore.getState().song.measures[0].beats[0].isRest).toBe(false);
    
    deleteBeat(0, 0);
    const beat = useTabStore.getState().song.measures[0].beats[0];
    expect(beat.isRest).toBe(true);
    expect(beat.notes).toHaveLength(0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(1);
  });

  it('should remove a rest beat entirely when deleted', () => {
    const { addBeat, deleteBeat } = useTabStore.getState();
    addBeat(0, -1);
    addBeat(0, 0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(2);
    
    // Both are rests by default. Delete the first one.
    deleteBeat(0, 0);
    expect(useTabStore.getState().song.measures[0].beats).toHaveLength(1);
  });

  it('should fill a measure with rests to match time signature', () => {
    const { fillMeasureWithRests, addBeat } = useTabStore.getState();
    
    // Empty measure in 4/4
    fillMeasureWithRests(0);
    
    const beats = useTabStore.getState().song.measures[0].beats;
    expect(beats).toHaveLength(4);
    const totalDuration = beats.reduce((sum, b) => sum + b.duration, 0);
    expect(totalDuration).toBe(4);
  });

  it('should toggle dotted status', () => {
    const { addBeat, toggleDot } = useTabStore.getState();
    addBeat(0, -1); // 1.0 duration
    toggleDot(0, 0);
    const beat = useTabStore.getState().song.measures[0].beats[0];
    expect(beat.isDotted).toBe(true);
    expect(beat.duration).toBe(1.5);
    
    toggleDot(0, 0);
    expect(useTabStore.getState().song.measures[0].beats[0].isDotted).toBe(false);
    expect(useTabStore.getState().song.measures[0].beats[0].duration).toBe(1.0);
  });

  it('should toggle triplet status', () => {
    const { addBeat, toggleTriplet } = useTabStore.getState();
    addBeat(0, -1); // 1.0 duration
    toggleTriplet(0, 0);
    const beat = useTabStore.getState().song.measures[0].beats[0];
    expect(beat.isTriplet).toBe(true);
    expect(beat.duration).toBeCloseTo(1 * (2/3));
    
    toggleTriplet(0, 0);
    expect(useTabStore.getState().song.measures[0].beats[0].isTriplet).toBe(false);
    expect(useTabStore.getState().song.measures[0].beats[0].duration).toBe(1.0);
  });
});
