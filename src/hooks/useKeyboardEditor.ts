import { useEffect } from 'react';
import { useTabStore } from '../store/useTabStore';

export const useKeyboardEditor = () => {
  const moveCursor = useTabStore((state) => state.moveCursor);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          moveCursor('up');
          break;
        case 'ArrowDown':
          moveCursor('down');
          break;
        case 'ArrowLeft':
          moveCursor('left');
          break;
        case 'ArrowRight':
          moveCursor('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCursor]);
};
