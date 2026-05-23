import { renderHook } from '@testing-library/react';
import { useKeyboardEditor } from '../useKeyboardEditor';
import { useTabStore } from '../../store/useTabStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../store/useTabStore', () => ({
  useTabStore: vi.fn(),
}));

describe('useKeyboardEditor', () => {
  let moveCursorMock: any;

  beforeEach(() => {
    moveCursorMock = vi.fn();
    (useTabStore as any).mockReturnValue(moveCursorMock);
  });

  it('should call moveCursor("up") when ArrowUp is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(event);
    expect(moveCursorMock).toHaveBeenCalledWith('up');
  });

  it('should call moveCursor("down") when ArrowDown is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    window.dispatchEvent(event);
    expect(moveCursorMock).toHaveBeenCalledWith('down');
  });

  it('should call moveCursor("left") when ArrowLeft is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);
    expect(moveCursorMock).toHaveBeenCalledWith('left');
  });

  it('should call moveCursor("right") when ArrowRight is pressed', () => {
    renderHook(() => useKeyboardEditor());
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);
    expect(moveCursorMock).toHaveBeenCalledWith('right');
  });
});
