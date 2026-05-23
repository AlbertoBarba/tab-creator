import { renderHook } from '@testing-library/react';
import { useKeyboardEditor } from '../useKeyboardEditor';
import { useTabStore } from '../../store/useTabStore';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../store/useTabStore', () => ({
  useTabStore: vi.fn(),
}));

describe('useKeyboardEditor', () => {
  let storeState: any;

  beforeEach(() => {
    vi.useFakeTimers();
    storeState = {
      moveCursor: vi.fn(),
      setNote: vi.fn(),
      deleteNote: vi.fn(),
      setDuration: vi.fn(),
      addMeasure: vi.fn(),
      deleteMeasure: vi.fn(),
      toggleRest: vi.fn(),
      addBeat: vi.fn(),
      deleteBeat: vi.fn(),
      cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 },
      song: {
        measures: [{ beats: [{ duration: 1, isRest: false, notes: [] }] }]
      }
    };
    (useTabStore as any).mockImplementation((selector: any) => 
      selector ? selector(storeState) : storeState
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should call addMeasure() when "Enter" is pressed without Alt', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);
    expect(storeState.addMeasure).toHaveBeenCalled();
  });

  it('should call addMeasure() when "+" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: '+' });
    window.dispatchEvent(event);
    expect(storeState.addMeasure).toHaveBeenCalled();
  });

  it('should call deleteMeasure(0) when Shift+Backspace is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Backspace', shiftKey: true });
    window.dispatchEvent(event);
    expect(storeState.deleteMeasure).toHaveBeenCalledWith(0);
  });

  it('should call deleteMeasure(0) when Shift+Delete is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Delete', shiftKey: true });
    window.dispatchEvent(event);
    expect(storeState.deleteMeasure).toHaveBeenCalledWith(0);
  });

  it('should call toggleRest(0, 0) when "r" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'r' });
    window.dispatchEvent(event);
    expect(storeState.toggleRest).toHaveBeenCalledWith(0, 0);
  });

  it('should call addBeat(0, 0) when Alt+Enter is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Enter', altKey: true });
    window.dispatchEvent(event);
    expect(storeState.addBeat).toHaveBeenCalledWith(0, 0);
  });

  it('should call deleteBeat(0, 0) when Alt+Backspace is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Backspace', altKey: true });
    window.dispatchEvent(event);
    expect(storeState.deleteBeat).toHaveBeenCalledWith(0, 0);
  });

  it('should call deleteBeat(0, 0) when Alt+Delete is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Delete', altKey: true });
    window.dispatchEvent(event);
    expect(storeState.deleteBeat).toHaveBeenCalledWith(0, 0);
  });

  it('should call setDuration(0, 0, 4) when "w" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'w' });
    window.dispatchEvent(event);
    expect(storeState.setDuration).toHaveBeenCalledWith(0, 0, 4);
  });

  it('should call setDuration(0, 0, 2) when "h" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'h' });
    window.dispatchEvent(event);
    expect(storeState.setDuration).toHaveBeenCalledWith(0, 0, 2);
  });

  it('should call setDuration(0, 0, 1) when "q" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'q' });
    window.dispatchEvent(event);
    expect(storeState.setDuration).toHaveBeenCalledWith(0, 0, 1);
  });

  it('should call setDuration(0, 0, 0.5) when "e" is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'e' });
    window.dispatchEvent(event);
    expect(storeState.setDuration).toHaveBeenCalledWith(0, 0, 0.5);
  });

  it('should be case-insensitive for duration shortcuts', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'W' });
    window.dispatchEvent(event);
    expect(storeState.setDuration).toHaveBeenCalledWith(0, 0, 4);
  });

  it('should call moveCursor("up") when ArrowUp is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('up', false);
  });

  it('should call moveCursor("down") when ArrowDown is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('down', false);
  });

  it('should call moveCursor("left") when ArrowLeft is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('left', false);
  });

  it('should call moveCursor("right") when ArrowRight is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('right', false);
  });

  it('should call moveCursor with shiftKey: true when Shift+Arrow is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('right', true);
  });

  it('should call setNote with single digit fret', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: '5' });
    window.dispatchEvent(event);
    expect(storeState.setNote).toHaveBeenCalledWith(0, 0, 0, 5);
  });

  it('should call setNote with multi-digit fret (e.g., 12)', () => {
    renderHook(() => useKeyboardEditor());
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    
    expect(storeState.setNote).toHaveBeenLastCalledWith(0, 0, 0, 12);
  });

  it('should reset buffer after timeout', () => {
    renderHook(() => useKeyboardEditor());
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    vi.advanceTimersByTime(600);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    
    expect(storeState.setNote).toHaveBeenLastCalledWith(0, 0, 0, 2);
  });

  it('should reset buffer if fret exceeds 24', () => {
    renderHook(() => useKeyboardEditor());
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    
    expect(storeState.setNote).toHaveBeenLastCalledWith(0, 0, 0, 5);
  });

  it('should call deleteBeat when Backspace is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    window.dispatchEvent(event);
    expect(storeState.deleteBeat).toHaveBeenCalledWith(0, 0);
  });

  it('should call deleteBeat when Delete is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    window.dispatchEvent(event);
    expect(storeState.deleteBeat).toHaveBeenCalledWith(0, 0);
  });
});
