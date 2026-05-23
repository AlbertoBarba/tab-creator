import { useEffect, useRef } from 'react';
import { useTabStore } from '../store/useTabStore';

export const useKeyboardEditor = () => {
  const moveCursor = useTabStore((state) => state.moveCursor);
  const setNote = useTabStore((state) => state.setNote);
  const deleteNote = useTabStore((state) => state.deleteNote);
  const cursor = useTabStore((state) => state.cursor);

  const addMeasure = useTabStore((state) => state.addMeasure);
  const deleteMeasure = useTabStore((state) => state.deleteMeasure);

  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation
      if (e.key.startsWith('Arrow')) {
        bufferRef.current = '';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        moveCursor(e.key.replace('Arrow', '').toLowerCase() as any);
        return;
      }

      // Add measure
      if (e.key === 'Enter' || e.key === '+') {
        addMeasure();
        return;
      }

      // Delete measure
      if (e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        deleteMeasure(cursor.measureIndex);
        return;
      }

      // Fret entry
      if (e.key >= '0' && e.key <= '9') {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

        bufferRef.current += e.key;
        let fret = parseInt(bufferRef.current);

        if (fret > 24) {
          // If exceeding 24, treat the new key as a fresh single digit
          bufferRef.current = e.key;
          fret = parseInt(e.key);
        }

        setNote(cursor.measureIndex, cursor.beatIndex, cursor.stringIndex, fret);

        // Reset buffer after 500ms
        timeoutRef.current = window.setTimeout(() => {
          bufferRef.current = '';
        }, 500);
        return;
      }

      // Deletion
      if (e.key === 'Backspace' || e.key === 'Delete') {
        deleteNote(cursor.measureIndex, cursor.beatIndex, cursor.stringIndex);
        bufferRef.current = '';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCursor, setNote, deleteNote, cursor]);
};
