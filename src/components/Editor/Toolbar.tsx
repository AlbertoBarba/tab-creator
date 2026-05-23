import React from 'react';
import { useTabStore } from '../../store/useTabStore';
import { 
  Sun, 
  Moon, 
  Copy, 
  Clipboard, 
  Wand2,
  Trash2,
  Plus,
  Play,
  Pause,
  Square,
  Download,
  Save,
  Upload
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TabDocument } from '../Export/PDFExporter';
import { saveSong } from '../../utils/persistence';

const WholeNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <ellipse cx="12" cy="12" rx="7" ry="4" transform="rotate(-20 12 12)" />
  </svg>
);

const HalfNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <ellipse cx="8" cy="18" rx="5" ry="3" transform="rotate(-20 8 18)" />
    <line x1="13" y1="18" x2="13" y2="4" />
  </svg>
);

const QuarterNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <ellipse cx="8" cy="18" rx="5" ry="3" transform="rotate(-20 8 18)" />
    <line x1="13" y1="18" x2="13" y2="4" />
  </svg>
);

const EighthNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <ellipse cx="8" cy="18" rx="5" ry="3" transform="rotate(-20 8 18)" />
    <path d="M 13 18 L 13 4 C 13 4 18 6 18 10" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const SixteenthNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <ellipse cx="8" cy="18" rx="5" ry="3" transform="rotate(-20 8 18)" />
    <path d="M 13 18 L 13 4 C 13 4 18 6 18 10 M 13 8 C 13 8 18 10 18 14" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const ThirtySecondNoteIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <ellipse cx="8" cy="18" rx="5" ry="3" transform="rotate(-20 8 18)" />
    <path d="M 13 18 L 13 4 C 13 4 18 6 18 10 M 13 8 C 13 8 18 10 18 14 M 13 12 C 13 12 18 14 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const Toolbar: React.FC = () => {
  const { 
    song, 
    cursor, 
    selection, 
    theme, 
    toggleTheme, 
    setDuration, 
    toggleDot,
    toggleTriplet,
    copy, 
    paste, 
    fillMeasureWithRests,
    addMeasure,
    deleteMeasure,
    setTechnique,
    setMeasureLabel,
    updateTuning,
    isPlaying,
    setIsPlaying,
    setTempo,
    loadSong
  } = useTabStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedSong = JSON.parse(event.target?.result as string);
        loadSong(loadedSong);
      } catch (err) {
        alert('Failed to load file. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSetDuration = (duration: number) => {
    if (selection) {
      const { start, end } = selection;
      const mMin = Math.min(start.measureIndex, end.measureIndex);
      const mMax = Math.max(start.measureIndex, end.measureIndex);

      for (let m = mMin; m <= mMax; m++) {
        const measure = song.measures[m];
        let bStart = 0;
        let bEnd = measure.beats.length - 1;

        if (m === start.measureIndex && m === end.measureIndex) {
          bStart = Math.min(start.beatIndex, end.beatIndex);
          bEnd = Math.max(start.beatIndex, end.beatIndex);
        } else if (m === mMin) {
          bStart = start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex;
        } else if (m === mMax) {
          bEnd = start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex;
        }

        for (let b = bStart; b <= bEnd; b++) {
          setDuration(m, b, duration);
        }
      }
    } else {
      setDuration(cursor.measureIndex, cursor.beatIndex, duration);
    }
  };

  const handleToggleDot = () => {
    if (selection) {
      const { start, end } = selection;
      const mMin = Math.min(start.measureIndex, end.measureIndex);
      const mMax = Math.max(start.measureIndex, end.measureIndex);
      for (let m = mMin; m <= mMax; m++) {
        const measure = song.measures[m];
        let bStart = m === mMin ? (start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex) : 0;
        let bEnd = m === mMax ? (start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex) : measure.beats.length - 1;
        if (mMin === mMax) { bStart = Math.min(start.beatIndex, end.beatIndex); bEnd = Math.max(start.beatIndex, end.beatIndex); }
        for (let b = bStart; b <= bEnd; b++) toggleDot(m, b);
      }
    } else {
      toggleDot(cursor.measureIndex, cursor.beatIndex);
    }
  };

  const handleToggleTriplet = () => {
    if (selection) {
      const { start, end } = selection;
      const mMin = Math.min(start.measureIndex, end.measureIndex);
      const mMax = Math.max(start.measureIndex, end.measureIndex);
      for (let m = mMin; m <= mMax; m++) {
        const measure = song.measures[m];
        let bStart = m === mMin ? (start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex) : 0;
        let bEnd = m === mMax ? (start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex) : measure.beats.length - 1;
        if (mMin === mMax) { bStart = Math.min(start.beatIndex, end.beatIndex); bEnd = Math.max(start.beatIndex, end.beatIndex); }
        for (let b = bStart; b <= bEnd; b++) toggleTriplet(m, b);
      }
    } else {
      toggleTriplet(cursor.measureIndex, cursor.beatIndex);
    }
  };

  const handleSetTechnique = (tech: string | undefined) => {
    if (selection) {
      const { start, end } = selection;
      const mMin = Math.min(start.measureIndex, end.measureIndex);
      const mMax = Math.max(start.measureIndex, end.measureIndex);

      for (let m = mMin; m <= mMax; m++) {
        const measure = song.measures[m];
        let bStart = 0;
        let bEnd = measure.beats.length - 1;

        if (m === start.measureIndex && m === end.measureIndex) {
          bStart = Math.min(start.beatIndex, end.beatIndex);
          bEnd = Math.max(start.beatIndex, end.beatIndex);
        } else if (m === mMin) {
          bStart = start.measureIndex < end.measureIndex ? start.beatIndex : end.beatIndex;
        } else if (m === mMax) {
          bEnd = start.measureIndex < end.measureIndex ? end.beatIndex : start.beatIndex;
        }

        for (let b = bStart; b <= bEnd; b++) {
          setTechnique(m, b, cursor.stringIndex, tech);
        }
      }
    } else {
      setTechnique(cursor.measureIndex, cursor.beatIndex, cursor.stringIndex, tech);
    }
  };

  const buttonClass = "p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border dark:border-slate-600 flex items-center gap-2 text-sm font-medium";
  const activeClass = "bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300";

  // Get active properties of selection/cursor
  const getActiveDuration = () => {
    if (selection) {
      const { start } = selection;
      return song.measures[start.measureIndex].beats[start.beatIndex]?.duration;
    }
    return song.measures[cursor.measureIndex].beats[cursor.beatIndex]?.duration;
  };

  const getActiveTechnique = () => {
    const mIdx = cursor.measureIndex;
    const bIdx = cursor.beatIndex;
    const sIdx = cursor.stringIndex;
    const beat = song.measures[mIdx].beats[bIdx];
    if (!beat) return undefined;
    const note = beat.notes.find(n => n.string === sIdx);
    return note?.technique;
  };

  const activeDuration = getActiveDuration();
  const activeTechnique = getActiveTechnique();
  const activeIsDotted = selection ? song.measures[selection.start.measureIndex].beats[selection.start.beatIndex]?.isDotted : song.measures[cursor.measureIndex].beats[cursor.beatIndex]?.isDotted;
  const activeIsTriplet = selection ? song.measures[selection.start.measureIndex].beats[selection.start.beatIndex]?.isTriplet : song.measures[cursor.measureIndex].beats[cursor.beatIndex]?.isTriplet;

  // Get the effective section label (walk backwards to find the last defined label)
  const getActiveSectionLabel = () => {
    for (let i = cursor.measureIndex; i >= 0; i--) {
      if (song.measures[i].label) return { label: song.measures[i].label, sourceIndex: i };
    }
    return { label: '', sourceIndex: -1 };
  };

  const { label: activeSectionName, sourceIndex: labelOriginIndex } = getActiveSectionLabel();
  const currentIsSectionStart = !!song.measures[cursor.measureIndex].label;

  const handleSectionNameChange = (newName: string) => {
    if (currentIsSectionStart) {
      setMeasureLabel(cursor.measureIndex, newName);
    } else if (labelOriginIndex >= 0) {
      setMeasureLabel(labelOriginIndex, newName);
    } else {
      // If no section exists yet, start one at the current bar
      setMeasureLabel(cursor.measureIndex, newName);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 transition-colors duration-200 text-sans font-sans">
      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button 
          onClick={() => saveSong(song)} 
          className={buttonClass}
          title="Save to file (.btab)"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className={buttonClass}
          title="Load from file (.btab)"
        >
          <Upload size={16} />
          <span>Load</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleLoad} 
          accept=".btab,application/json" 
          className="hidden" 
        />
      </div>

      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className={`${buttonClass} ${isPlaying ? 'bg-amber-100 dark:bg-amber-900 border-amber-500' : ''}`}
          title={isPlaying ? "Pause" : "Play (Space)"}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button 
          onClick={() => setIsPlaying(false)} 
          className={buttonClass}
          title="Stop"
        >
          <Square size={16} fill="currentColor" />
        </button>
      </div>

      <div className="flex items-center gap-2 border-r dark:border-slate-700 pr-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">BPM</span>
        <input 
          type="number" 
          value={song.tempo} 
          onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
          className="w-16 border rounded px-2 py-1 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white font-mono"
        />
      </div>

      <div className="flex items-center gap-2 border-r dark:border-slate-700 pr-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Strings</span>
        <select 
          value={song.tuning.length} 
          onChange={(e) => {
            const count = parseInt(e.target.value);
            if (count === 4) updateTuning(['E1', 'A1', 'D2', 'G2']);
            if (count === 5) updateTuning(['B0', 'E1', 'A1', 'D2', 'G2']);
            if (count === 6) updateTuning(['B0', 'E1', 'A1', 'D2', 'G2', 'C3']);
          }}
          className="border rounded px-2 py-1 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm"
        >
          <option value="4">4-String</option>
          <option value="5">5-String</option>
          <option value="6">6-String</option>
        </select>
        <div className="flex gap-1">
          {song.tuning.map((pitch, idx) => (
            <input
              key={idx}
              type="text"
              value={pitch}
              onChange={(e) => {
                const newTuning = [...song.tuning];
                newTuning[idx] = e.target.value.toUpperCase();
                updateTuning(newTuning);
              }}
              className="w-10 border rounded px-1 text-center bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white text-xs font-mono"
              title={`String ${idx + 1} pitch`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-r dark:border-slate-700 pr-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Section Name</span>
          <input 
            type="text"
            value={activeSectionName || ''} 
            onChange={(e) => handleSectionNameChange(e.target.value)}
            className="w-32 border rounded px-2 py-1 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm font-sans"
            placeholder="e.g. Verse"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={currentIsSectionStart}
            onChange={(e) => setMeasureLabel(cursor.measureIndex, e.target.checked ? (activeSectionName || 'New Section') : undefined)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Start Section</span>
        </label>
      </div>

      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button onClick={() => handleSetDuration(4)} className={`${buttonClass} ${activeDuration === 4 ? activeClass : ''}`} title="Whole Note (w)">
          <WholeNoteIcon />
        </button>
        <button onClick={() => handleSetDuration(2)} className={`${buttonClass} ${activeDuration === 2 ? activeClass : ''}`} title="Half Note (h)">
          <HalfNoteIcon />
        </button>
        <button onClick={() => handleSetDuration(1)} className={`${buttonClass} ${activeDuration === 1 ? activeClass : ''}`} title="Quarter Note (q)">
          <QuarterNoteIcon />
        </button>
        <button onClick={() => handleSetDuration(0.5)} className={`${buttonClass} ${activeDuration === 0.5 ? activeClass : ''}`} title="Eighth Note (e)">
          <EighthNoteIcon />
        </button>
        <button onClick={() => handleSetDuration(0.25)} className={`${buttonClass} ${activeDuration === 0.25 ? activeClass : ''}`} title="Sixteenth Note (s)">
          <SixteenthNoteIcon />
        </button>
        <button onClick={() => handleSetDuration(0.125)} className={`${buttonClass} ${activeDuration === 0.125 ? activeClass : ''}`} title="Thirty-second Note (t)">
          <ThirtySecondNoteIcon />
        </button>
        <div className="w-[1px] bg-gray-200 dark:bg-slate-700 mx-1" />
        <button onClick={handleToggleDot} className={`${buttonClass} ${activeIsDotted ? activeClass : ''}`} title="Dotted Note (.)">
          <span className="text-lg leading-none">.</span>
        </button>
        <button onClick={handleToggleTriplet} className={`${buttonClass} ${activeIsTriplet ? activeClass : ''}`} title="Triplet Note (*)">
          <span className="text-xs font-bold">3</span>
        </button>
      </div>

      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button onClick={() => handleSetTechnique('slide')} className={`${buttonClass} ${activeTechnique === 'slide' ? activeClass : ''}`} title="Slide">Slide</button>
        <button onClick={() => handleSetTechnique('hammer')} className={`${buttonClass} ${activeTechnique === 'hammer' ? activeClass : ''}`} title="Hammer-on">Hammer</button>
        <button onClick={() => handleSetTechnique('pull')} className={`${buttonClass} ${activeTechnique === 'pull' ? activeClass : ''}`} title="Pull-off">Pull</button>
        <button onClick={() => handleSetTechnique('mute')} className={`${buttonClass} ${activeTechnique === 'mute' ? activeClass : ''}`} title="Mute">Mute</button>
        <button onClick={() => handleSetTechnique('vibrato')} className={`${buttonClass} ${activeTechnique === 'vibrato' ? activeClass : ''}`} title="Vibrato">Vibrato</button>
        <button onClick={() => handleSetTechnique(undefined)} className={`${buttonClass} ${activeTechnique === undefined ? activeClass : ''}`} title="Clear Technique">Clear</button>
      </div>

      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button onClick={copy} className={buttonClass} title="Copy (Ctrl+C)">
          <Copy size={16} />
        </button>
        <button onClick={paste} className={buttonClass} title="Paste (Ctrl+V)">
          <Clipboard size={16} />
        </button>
      </div>

      <div className="flex gap-1 border-r dark:border-slate-700 pr-4">
        <button 
          onClick={() => fillMeasureWithRests(cursor.measureIndex)} 
          className={`${buttonClass} text-emerald-600 dark:text-emerald-400`}
          title="Fill Measure with Rests"
        >
          <Wand2 size={16} /> Fill
        </button>
        <button 
          onClick={addMeasure} 
          className={`${buttonClass} text-blue-600 dark:text-blue-400`}
          title="Add Measure (+)"
        >
          <Plus size={16} /> Measure
        </button>
        <button 
          onClick={() => deleteMeasure(cursor.measureIndex)} 
          className={`${buttonClass} text-red-600 dark:text-red-400`}
          title="Delete Current Measure (Shift+BS)"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-1 pr-4">
        <PDFDownloadLink 
          document={<TabDocument song={song} />} 
          fileName={`${song.title.replace(/\s+/g, '_') || 'bass_tab'}.pdf`}
          className={buttonClass}
        >
          {({ loading }) => (
            <>
              <Download size={16} className={loading ? 'animate-pulse' : ''} />
              <span>{loading ? '...' : 'PDF'}</span>
            </>
          )}
        </PDFDownloadLink>
      </div>

      <button
        onClick={toggleTheme}
        className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border dark:border-slate-600"
      >
        {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
      </button>
    </div>
  );
};
