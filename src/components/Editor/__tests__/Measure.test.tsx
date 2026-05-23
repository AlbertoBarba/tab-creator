import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MeasureRenderer } from '../Measure';
import { Measure } from '../../../types/tab';

// Mock the store
vi.mock('../../../store/useTabStore', () => ({
  useTabStore: vi.fn((selector) => selector({ 
    cursor: { measureIndex: 0, beatIndex: 0, stringIndex: 0 },
    song: {
      timeSignature: [4, 4],
      tuning: ['E1', 'A1', 'D2', 'G2'],
    },
    theme: 'dark'
  })),
}));

describe('MeasureRenderer', () => {
  it('should render a red highlight for an invalid measure', () => {
    const invalidMeasure: Measure = {
      id: 'invalid-measure',
      beats: [
        {
          duration: 1, // Only 1 beat in a 4/4 measure
          isRest: true,
          notes: [],
        },
      ],
    };

    const { container } = render(
      <svg>
        <MeasureRenderer 
          measure={invalidMeasure} 
          index={0} 
          tuningCount={4} 
          x={0} 
          y={0} 
        />
      </svg>
    );

    const rects = container.querySelectorAll('rect');
    // It should have at least the red highlight rect
    expect(rects.length).toBeGreaterThan(0);
    // Dark mode invalidBg is rgba(239, 68, 68, 0.2)
    const highlight = Array.from(rects).find(r => r.getAttribute('fill') === 'rgba(239, 68, 68, 0.2)');
    expect(highlight).toBeDefined();
  });

  it('should NOT render a red highlight for a valid measure', () => {
    const validMeasure: Measure = {
      id: 'valid-measure',
      beats: [
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
        { duration: 1, isRest: true, notes: [] },
      ],
    };

    const { container } = render(
      <svg>
        <MeasureRenderer 
          measure={validMeasure} 
          index={1} // index 1, so cursor (at index 0) doesn't show up
          tuningCount={4} 
          x={0} 
          y={0} 
        />
      </svg>
    );

    const rects = container.querySelectorAll('rect');
    const highlight = Array.from(rects).find(r => r.getAttribute('fill') === 'rgba(239, 68, 68, 0.2)');
    expect(highlight).toBeUndefined();
  });

  it('should render a stem for a half note (duration 2)', () => {
    const halfMeasure: Measure = {
      id: 'half',
      beats: [{ duration: 2, isRest: false, notes: [{ string: 0, fret: 5 }] }]
    };
    
    const { container } = render(
      <svg>
        <MeasureRenderer 
          measure={halfMeasure} 
          index={0} 
          tuningCount={4} 
          x={0} 
          y={0} 
        />
      </svg>
    );

    const lines = container.querySelectorAll('line');
    // 4 strings + 2 bar lines + 1 stem = 7 lines
    // Wait, playhead might also render if isPlaying is true.
    // In our mock isPlaying is undefined (false).
    expect(lines.length).toBe(7);
  });

  it('should NOT render a stem for a whole note (duration 4)', () => {
    const wholeMeasure: Measure = {
      id: 'whole',
      beats: [{ duration: 4, isRest: false, notes: [{ string: 0, fret: 5 }] }]
    };

    const { container } = render(
      <svg>
        <MeasureRenderer 
          measure={wholeMeasure} 
          index={0} 
          tuningCount={4} 
          x={0} 
          y={0} 
        />
      </svg>
    );

    const lines = container.querySelectorAll('line');
    // 4 strings + 2 bar lines + 0 stems = 6 lines
    expect(lines.length).toBe(6);
  });
});
