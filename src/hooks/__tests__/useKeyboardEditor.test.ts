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
      cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 },
    };
    (useTabStore as any).mockImplementation((selector: any) => selector(storeState));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should call moveCursor("up") when ArrowUp is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('up');
  });

  it('should call moveCursor("down") when ArrowDown is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('down');
  });

  it('should call moveCursor("left") when ArrowLeft is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('left');
  });

  it('should call moveCursor("right") when ArrowRight is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);
    expect(storeState.moveCursor).toHaveBeenCalledWith('right');
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

  it('should call deleteNote when Backspace is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    window.dispatchEvent(event);
    expect(storeState.deleteNote).toHaveBeenCalledWith(0, 0, 0);
  });

  it('should call deleteNote when Delete is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    window.dispatchEvent(event);
    expect(storeState.deleteNote).toHaveBeenCalledWith(0, 0, 0);
  });
});
