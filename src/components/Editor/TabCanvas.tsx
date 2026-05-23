import React from 'react';
import { useTabStore } from '../../store/useTabStore';
import { MeasureRenderer } from './Measure';
import { useKeyboardEditor } from '../../hooks/useKeyboardEditor';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export const TabCanvas: React.FC = () => {
  const song = useTabStore((state) => state.song);

  // Register listeners
  useKeyboardEditor();
  useAudioEngine();

  const measureWidth = 300;
  const measureHeight = 180; // Increased to accommodate section labels
  const marginX = 50;
  const marginY = 50;
  const maxMeasuresPerRow = 4;

  // Calculate layout coordinates
  let currentRow = 0;
  let currentCol = 0;
  let currentRowHasLabel = false;

  const layout = song.measures.map((measure, index) => {
    // Force new row if measure has a label (and it's not already the start of a row)
    if (measure.label && currentCol !== 0) {
      currentRow++;
      currentCol = 0;
    }

    if (currentCol === 0) {
      currentRowHasLabel = !!measure.label;
    }

    const x = marginX + currentCol * measureWidth;
    // Apply consistent y-offset to the whole row if the first measure has a label
    const y = marginY + currentRow * measureHeight + (currentRowHasLabel ? 30 : 0);

    currentCol++;
    if (currentCol >= maxMeasuresPerRow) {
      currentRow++;
      currentCol = 0;
    }

    return { x, y };
  });

  const totalHeight = (currentRow + (currentCol > 0 ? 1 : 0)) * measureHeight + 2 * marginY;

  return (
    <div className="p-8 bg-white dark:bg-slate-900 overflow-auto h-full transition-colors duration-200">
      <svg 
        width={maxMeasuresPerRow * measureWidth + 2 * marginX} 
        height={totalHeight} 
        viewBox={`0 0 ${maxMeasuresPerRow * measureWidth + 2 * marginX} ${totalHeight}`}
      >
        {song.measures.map((measure, index) => {
          const { x, y } = layout[index];

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
