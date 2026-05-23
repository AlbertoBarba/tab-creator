import React from 'react';
import { useTabStore } from '../../store/useTabStore';
import { MeasureRenderer } from './Measure';
import { useKeyboardEditor } from '../../hooks/useKeyboardEditor';

export const TabCanvas: React.FC = () => {
  const song = useTabStore((state) => state.song);

  // Register keyboard listeners
  useKeyboardEditor();

  const measureWidth = 300;
  const measureHeight = 150;
  const marginX = 50;
  const marginY = 50;
  const measuresPerRow = 4;

  return (
    <div className="p-8 bg-white overflow-auto h-full">
      <svg 
        width={measuresPerRow * measureWidth + 2 * marginX} 
        height={Math.ceil(song.measures.length / measuresPerRow) * measureHeight + 2 * marginY} 
        viewBox={`0 0 ${measuresPerRow * measureWidth + 2 * marginX} ${Math.ceil(song.measures.length / measuresPerRow) * measureHeight + 2 * marginY}`}
      >
        {song.measures.map((measure, index) => {
          const row = Math.floor(index / measuresPerRow);
          const col = index % measuresPerRow;
          const x = marginX + col * measureWidth;
          const y = marginY + row * measureHeight;

          return (
            <MeasureRenderer 
              key={measure.id} 
              measure={measure} 
              index={index} 
              tuningCount={song.tuning.length} 
              x={x}
              y={y}
            />
          );
        })}
      </svg>
    </div>
  );
};
