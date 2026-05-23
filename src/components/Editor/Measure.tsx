import React from 'react';
import { Measure } from '../../types/tab';
import { useTabStore } from '../../store/useTabStore';

interface Props {
  measure: Measure;
  index: number;
  tuningCount: number;
  x: number;
  y: number;
}

export const MeasureRenderer: React.FC<Props> = ({ measure, index, tuningCount, x, y }) => {
  const lineSpacing = 20;
  const measureWidth = 300;

  const song = useTabStore((state) => state.song);
  const cursor = useTabStore((state) => state.cursor);
  const isSelectedMeasure = cursor.measureIndex === index;

  // Calculate expected total duration for this time signature
  // numerator * (4 / denominator) -> e.g. 4/4 = 4.0, 3/4 = 3.0, 6/8 = 3.0
  const expectedDuration = song.timeSignature[0] * (4 / song.timeSignature[1]);
  const actualDuration = measure.beats.reduce((sum, beat) => sum + beat.duration, 0);
  const isInvalid = Math.abs(actualDuration - expectedDuration) > 0.001;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Red highlight for invalid measures */}
      {isInvalid && (
        <rect
          x={0}
          y={-10}
          width={measureWidth}
          height={(tuningCount - 1) * lineSpacing + 20}
          fill="rgba(239, 68, 68, 0.1)"
          stroke="rgba(239, 68, 68, 0.5)"
          strokeWidth="1"
        />
      )}

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

      {measure.beats.map((beat, bIdx) => {
        const beatWidth = measureWidth / (measure.beats.length || 1);
        const stemY1 = (tuningCount - 0.5) * lineSpacing; // Start just below the last string
        const stemY2 = stemY1 + 30; // 30px stem length

        return (
          <g key={bIdx} transform={`translate(${bIdx * beatWidth + beatWidth / 2}, 0)`}>
            {!beat.isRest && beat.notes.map((note) => (
              <g key={note.string}>
                {/* White background circle for the number */}
                <circle
                  cx={0}
                  cy={note.string * lineSpacing}
                  r={8}
                  fill="white"
                />
                <text
                  x={0}
                  y={note.string * lineSpacing}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="bold"
                  className="select-none"
                >
                  {note.fret}
                </text>
              </g>
            ))}
            {beat.isRest && (
              <text
                x={0}
                y={(tuningCount - 1) * lineSpacing / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="16"
                fill="#999"
                className="select-none"
              >
                /
              </text>
            )}

            {/* Rhythmic Stem */}
            {!beat.isRest && beat.duration <= 2 && (
              <line
                x1={0}
                y1={stemY1}
                x2={0}
                y2={stemY2}
                stroke="black"
                strokeWidth="1.5"
              />
            )}

            {/* Eighth Note Flag/Beam (simplified for now as individual flags) */}
            {!beat.isRest && beat.duration === 0.5 && (
              <path
                d={`M 0 ${stemY2} L 8 ${stemY2 - 5}`}
                stroke="black"
                strokeWidth="1.5"
                fill="none"
              />
            )}
          </g>
        );
      })}

      {isSelectedMeasure && (
        <rect
          x={(measureWidth / (measure.beats.length || 1)) * cursor.beatIndex + (measureWidth / (measure.beats.length || 1)) / 2 - 10}
          y={cursor.stringIndex * lineSpacing - 10}
          width={20}
          height={20}
          fill="rgba(59, 130, 246, 0.3)"
          rx={4}
        />
      )}
    </g>
  );
};
