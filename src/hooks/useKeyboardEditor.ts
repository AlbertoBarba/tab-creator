import { useEffect, useRef } from 'react';
import { useTabStore } from '../store/useTabStore';

export const useKeyboardEditor = () => {
  const { 
    moveCursor, 
    setNote, 
    setDuration, 
    addMeasure, 
    deleteMeasure, 
    toggleRest, 
    addBeat, 
    deleteBeat, 
    fillMeasureWithRests,
    toggleDot,
    toggleTriplet,
    copy,
    paste,
    cursor,
    song,
    isPlaying,
    setIsPlaying
  } = useTabStore();

  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if an input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Spacebar to play/pause
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // Navigation
      if (e.key.startsWith('Arrow')) {
        bufferRef.current = '';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        moveCursor(e.key.replace('Arrow', '').toLowerCase() as any, e.shiftKey);
        return;
      }

      // Copy/Paste
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'c') {
          copy();
          return;
        }
        if (e.key.toLowerCase() === 'v') {
          paste();
          return;
        }
      }

      // Add measure
      if (e.key === 'Enter' || e.key === '+') {
        if (!e.altKey) {
          addMeasure();
          return;
        }
      }

      // Delete measure
      if (e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        deleteMeasure(cursor.measureIndex);
        return;
      }

      // Toggle Rest
      if (e.key.toLowerCase() === 'r') {
        toggleRest(cursor.measureIndex, cursor.beatIndex);
        return;
      }

      // Add/Delete Beat
      if (e.altKey && e.key === 'Enter') {
        addBeat(cursor.measureIndex, cursor.beatIndex);
        return;
      }
      if (e.altKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        deleteBeat(cursor.measureIndex, cursor.beatIndex);
        return;
      }

      // Advanced Rhythmic Modifiers
      if (e.key === '.') {
        toggleDot(cursor.measureIndex, cursor.beatIndex);
        return;
      }
      if (e.key === '*') {
        toggleTriplet(cursor.measureIndex, cursor.beatIndex);
        return;
      }

      // Duration shortcuts
      const durationMap: Record<string, number> = {
        w: 4,
        h: 2,
        q: 1,
        e: 0.5,
        s: 0.25,
        t: 0.125,
      };

      const key = e.key.toLowerCase();
      if (durationMap[key]) {
        setDuration(cursor.measureIndex, cursor.beatIndex, durationMap[key]);
        return;
      }

      // Fret entry
      if (e.key >= '0' && e.key <= '9') {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

        // Auto-provision beat if measure is empty
        if (song.measures[cursor.measureIndex]?.beats.length === 0) {
          addBeat(cursor.measureIndex, -1);
        }

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

      // Deletion (Backspace/Delete deletes the entire beat)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const currentMeasure = song.measures[cursor.measureIndex];
        if (currentMeasure && currentMeasure.beats.length === 0) {
          deleteMeasure(cursor.measureIndex);
        } else {
          deleteBeat(cursor.measureIndex, cursor.beatIndex);
        }
        bufferRef.current = '';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    moveCursor, 
    setNote, 
    setDuration, 
    addMeasure, 
    deleteMeasure, 
    toggleRest, 
    addBeat, 
    deleteBeat, 
    fillMeasureWithRests,
    toggleDot,
    toggleTriplet,
    copy,
    paste,
    cursor,
    song,
    isPlaying,
    setIsPlaying
  ]);
};
