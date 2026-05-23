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
  const layoutResult = song.measures.reduce((acc, measure) => {
    let { row, col, hasLabel } = acc;

    // Force new row if measure has a label (and it's not already the start of a row)
    if (measure.label && col !== 0) {
      row++;
      col = 0;
    }

    if (col === 0) {
      hasLabel = !!measure.label;
    }

    const x = marginX + col * measureWidth;
    // Apply consistent y-offset to the whole row if the first measure has a label
    const y = marginY + row * measureHeight + (hasLabel ? 30 : 0);

    col++;
    if (col >= maxMeasuresPerRow) {
      row++;
      col = 0;
    }

    acc.layout.push({ x, y });
    acc.row = row;
    acc.col = col;
    acc.hasLabel = hasLabel;
    return acc;
  }, { 
    layout: [] as { x: number, y: number }[], 
    row: 0, 
    col: 0, 
    hasLabel: false 
  });

  const layout = layoutResult.layout;
  const totalRows = layoutResult.row + (layoutResult.col > 0 ? 1 : 0);
  const totalHeight = totalRows * measureHeight + 2 * marginY;

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
