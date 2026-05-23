import React from 'react';
import { useTabStore } from '../../store/useTabStore';
import { MeasureRenderer } from './Measure';
import { useKeyboardEditor } from '../../hooks/useKeyboardEditor';

export const TabCanvas: React.FC = () => {
  const song = useTabStore((state) => state.song);

  // Register keyboard listeners
  useKeyboardEditor();

  return (
    <div className="p-8 bg-white overflow-auto h-full">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000">
        {song.measures.map((measure, index) => (
          <MeasureRenderer 
            key={measure.id} 
            measure={measure} 
            index={index} 
            tuningCount={song.tuning.length} 
          />
        ))}
      </svg>
    </div>
  );
};
