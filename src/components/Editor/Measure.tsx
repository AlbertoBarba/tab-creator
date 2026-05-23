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
  const theme = useTabStore((state) => state.theme);
  const selection = useTabStore((state) => state.selection);
  const setCursor = useTabStore((state) => state.setCursor);
  const isSelectedMeasure = cursor.measureIndex === index;

  const isBeatSelected = (bIdx: number) => {
    if (!selection) return false;
    const start = selection.start;
    const end = selection.end;
    const mMin = Math.min(start.measureIndex, end.measureIndex);
    const mMax = Math.max(start.measureIndex, end.measureIndex);
    if (index < mMin || index > mMax) return false;
    if (mMin === mMax) {
      const bMin = Math.min(start.beatIndex, end.beatIndex);
      const bMax = Math.max(start.beatIndex, end.beatIndex);
      return bIdx >= bMin && bIdx <= bMax;
    }
    if (index > mMin && index < mMax) return true;
    if (index === mMin) {
      const bStart = start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex;
      return bIdx >= bStart;
    }
    if (index === mMax) {
      const bEnd = start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex;
      return bIdx <= bEnd;
    }
    return false;
  };

  const colors = {
    staffLine: theme === 'dark' ? '#444' : '#ccc',
    barLine: theme === 'dark' ? '#eee' : 'black',
    text: theme === 'dark' ? '#eee' : 'black',
    rest: theme === 'dark' ? '#666' : '#999',
    noteBg: theme === 'dark' ? '#1e293b' : 'white',
    stem: theme === 'dark' ? '#eee' : 'black',
    invalidBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
    invalidStroke: theme === 'dark' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.5)',
    technique: theme === 'dark' ? '#60a5fa' : '#2563eb',
  };

  const renderRest = (duration: number, color: string) => {
    if (duration >= 4) { // Whole Rest
      return <rect x={-6} y={lineSpacing} width={12} height={6} fill={color} />;
    }
    if (duration >= 2) { // Half Rest
      return <rect x={-6} y={lineSpacing * 2 - 6} width={12} height={6} fill={color} />;
    }
    if (duration >= 1) { // Quarter Rest
      return (
        <path 
          d="M -3 -8 L 2 -2 L -2 3 L 2 7 L 0 10" 
          stroke={color} 
          strokeWidth="1.5" 
          fill="none" 
          transform="translate(0, 5)"
        />
      );
    }
    const restY = (tuningCount - 1) * lineSpacing / 2;
    return (
      <g transform={`translate(0, ${restY})`}>
        <line x1={4} y1={-10} x2={-4} y2={10} stroke={color} strokeWidth="1.5" />
        <circle cx={-4} cy={-6} r={2.5} fill={color} />
        {duration <= 0.25 && <circle cx={-6} cy={0} r={2.5} fill={color} />}
        {duration <= 0.125 && <circle cx={-8} cy={6} r={2.5} fill={color} />}
      </g>
    );
  };

  const expectedDuration = song.timeSignature[0] * (4 / song.timeSignature[1]);
  const pixelsPerDuration = measureWidth / expectedDuration;

  const actualDuration = measure.beats.reduce((sum, beat) => sum + beat.duration, 0);
  const isInvalid = Math.abs(actualDuration - expectedDuration) > 0.001;
  const actualNumerator = Math.round(actualDuration / (4 / song.timeSignature[1]));

  // Pre-calculate beat positions
  const beatPositions = measure.beats.reduce((acc, beat) => {
    const xPos = acc.currentX;
    const width = beat.duration * pixelsPerDuration;
    acc.positions.push({ x: xPos, width });
    acc.currentX += width;
    return acc;
  }, { positions: [] as { x: number, width: number }[], currentX: 0 }).positions;

  const playhead = useTabStore((state) => state.playhead);
  const isPlaying = useTabStore((state) => state.isPlaying);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Section Label */}
      {measure.label && (
        <g transform="translate(0, -35)">
          <rect
            x={0}
            y={0}
            width={measure.label.length * 8 + 20}
            height={20}
            rx={4}
            fill="#3b82f6"
          />
          <text
            x={10}
            y={14}
            fontSize="11"
            fontWeight="bold"
            fill="white"
            className="select-none uppercase tracking-wider"
          >
            {measure.label}
          </text>
        </g>
      )}

      {/* Playhead */}
      {isPlaying && playhead?.measureIndex === index && beatPositions[playhead.beatIndex] && (
        <line
          x1={beatPositions[playhead.beatIndex].x + beatPositions[playhead.beatIndex].width / 2}
          y1={-10}
          x2={beatPositions[playhead.beatIndex].x + beatPositions[playhead.beatIndex].width / 2}
          y2={(tuningCount - 1) * lineSpacing + 40}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      {isInvalid && (
        <g>
          <rect x={0} y={-10} width={measureWidth} height={(tuningCount - 1) * lineSpacing + 20} fill={colors.invalidBg} stroke={colors.invalidStroke} strokeWidth="1" />
          <text x={measureWidth / 2} y={-15} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444" className="select-none">{actualNumerator}/{song.timeSignature[1]}</text>
        </g>
      )}

      {Array.from({ length: tuningCount }).map((_, i) => (
        <line key={i} x1={0} y1={i * lineSpacing} x2={measureWidth} y2={i * lineSpacing} stroke={colors.staffLine} strokeWidth="1" pointerEvents="none" />
      ))}
      
      <line x1={0} y1={0} x2={0} y2={(tuningCount - 1) * lineSpacing} stroke={colors.barLine} strokeWidth="2" pointerEvents="none" />
      <line x1={measureWidth} y1={0} x2={measureWidth} y2={(tuningCount - 1) * lineSpacing} stroke={colors.barLine} strokeWidth="2" pointerEvents="none" />

      {measure.beats.map((beat, bIdx) => {
        const { x: beatX, width: beatWidth } = beatPositions[bIdx];
        const stemY1 = (tuningCount - 0.5) * lineSpacing;
        const stemY2 = stemY1 + (beat.duration <= 0.25 ? 40 : 30);
        const isSelected = isBeatSelected(bIdx);

        return (
          <g key={bIdx} transform={`translate(${beatX}, 0)`}>
            {Array.from({ length: tuningCount }).map((_, sIdx) => (
              <rect key={sIdx} x={0} y={sIdx * lineSpacing - lineSpacing / 2} width={beatWidth} height={lineSpacing} fill="transparent" onMouseDown={(e) => { e.stopPropagation(); setCursor({ measureIndex: index, beatIndex: bIdx, stringIndex: sIdx }, e.shiftKey); }} onMouseEnter={(e) => { if (e.buttons === 1) setCursor({ measureIndex: index, beatIndex: bIdx, stringIndex: sIdx }, true); }} className="cursor-pointer" />
            ))}

            {isSelected && <rect x={0} y={-5} width={beatWidth} height={(tuningCount - 1) * lineSpacing + 10} fill="rgba(59, 130, 246, 0.2)" pointerEvents="none" />}

            <g transform={`translate(${beatWidth / 2}, 0)`} pointerEvents="none">
              {!beat.isRest && beat.notes.map((note) => (
                <g key={note.string}>
                  <circle cx={0} cy={note.string * lineSpacing} r={8} fill={colors.noteBg} />
                  <text x={0} y={note.string * lineSpacing} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill={colors.text} className="select-none">{note.fret}</text>
                  {note.technique && (
                    <text x={0} y={note.string * lineSpacing - 14} textAnchor="middle" fontSize="9" fontWeight="bold" fill={colors.technique} className="select-none">
                      {note.technique === 'slide' ? 'Slide' : note.technique === 'hammer' ? 'Hammer' : note.technique === 'pull' ? 'Pull' : note.technique === 'mute' ? 'Mute' : note.technique === 'vibrato' ? 'Vibrato' : ''}
                    </text>
                  )}
                </g>
              ))}
              
              {beat.isRest && renderRest(beat.duration, colors.rest)}

              {!beat.isRest && beat.duration <= 2 && (
                <g>
                  <line x1={0} y1={stemY1} x2={0} y2={stemY2} stroke={colors.stem} strokeWidth="1.5" />
                  {beat.duration <= 0.5 && <path d={`M 0 ${stemY2} L 8 ${stemY2 - 6}`} stroke={colors.stem} strokeWidth="1.5" fill="none" />}
                  {beat.duration <= 0.25 && <path d={`M 0 ${stemY2 - 6} L 8 ${stemY2 - 12}`} stroke={colors.stem} strokeWidth="1.5" fill="none" />}
                  {beat.duration <= 0.125 && <path d={`M 0 ${stemY2 - 12} L 8 ${stemY2 - 18}`} stroke={colors.stem} strokeWidth="1.5" fill="none" />}
                </g>
              )}
            </g>
          </g>
        );
      })}

      {isSelectedMeasure && (
        <rect 
          x={beatPositions[cursor.beatIndex]?.x + beatPositions[cursor.beatIndex]?.width / 2 - 10 || 0} 
          y={cursor.stringIndex * lineSpacing - 10} 
          width={20} 
          height={20} 
          fill="rgba(59, 130, 246, 0.3)" 
          rx={4} 
          pointerEvents="none" 
        />
      )}
    </g>
  );
};
