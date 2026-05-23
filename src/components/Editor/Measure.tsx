import React from 'react';
import { Measure } from '../../types/tab';

interface Props {
  measure: Measure;
  index: number;
  tuningCount: number;
}

export const MeasureRenderer: React.FC<Props> = ({ measure, index, tuningCount }) => {
  const lineSpacing = 20;
  const measureWidth = 300;
  const startY = 100 + index * 150; // Simple vertical stacking for now

  return (
    <g transform={`translate(50, ${startY})`}>
      {/* Horizontal String Lines */}
      {Array.from({ length: tuningCount }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={i * lineSpacing}
          x2={measureWidth}
          y2={i * lineSpacing}
          stroke="#ccc"
          strokeWidth="1"
        />
      ))}
      
      {/* Bar Lines */}
      <line x1={0} y1={0} x2={0} y2={(tuningCount - 1) * lineSpacing} stroke="black" strokeWidth="2" />
      <line x1={measureWidth} y1={0} x2={measureWidth} y2={(tuningCount - 1) * lineSpacing} stroke="black" strokeWidth="2" />
    </g>
  );
};
