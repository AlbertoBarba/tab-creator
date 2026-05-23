import React from 'react';
import { TabCanvas } from './components/Editor/TabCanvas';
import { Toolbar } from './components/Editor/Toolbar';
import { useTabStore } from './store/useTabStore';

function App() {
  const song = useTabStore((state) => state.song);
  const theme = useTabStore((state) => state.theme);
  const updateTimeSignature = useTabStore((state) => state.updateTimeSignature);

  const handleTimeSigChange = (num: string, den: string) => {
    updateTimeSignature(parseInt(num) || 4, parseInt(den) || 4);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200 text-sans">
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center border-b dark:border-slate-700 transition-colors duration-200">
          <div className="flex flex-col gap-1 flex-1 max-w-xl">
            <input 
              type="text" 
              value={song.title} 
              onChange={(e) => useTabStore.getState().updateTitle(e.target.value)}
              className="bg-transparent border-none text-xl font-bold focus:ring-0 focus:outline-none w-full p-0 text-blue-600 dark:text-blue-400"
              placeholder="Song Title"
            />
            <input 
              type="text" 
              value={song.artist} 
              onChange={(e) => useTabStore.getState().updateArtist(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none w-full p-0 text-gray-500 dark:text-gray-400 font-medium"
              placeholder="Artist"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 p-2 rounded border dark:border-slate-600 transition-colors duration-200">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time Sig</span>
            <input 
              type="number" 
              value={song.timeSignature[0]} 
              onChange={(e) => handleTimeSigChange(e.target.value, song.timeSignature[1].toString())}
              className="w-10 border rounded px-1 text-center bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              min="1"
              max="32"
            />
            <span className="dark:text-gray-400">/</span>
            <select 
              value={song.timeSignature[1]} 
              onChange={(e) => handleTimeSigChange(song.timeSignature[0].toString(), e.target.value)}
              className="border rounded px-1 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            >
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>
        </header>
        
        <Toolbar />

        <main className="flex-1 overflow-hidden">
          <TabCanvas />
        </main>

        <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-x-6 gap-y-2 justify-center text-center">
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">Arrows</kbd> Navigate</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">Shift+Arrows</kbd> Select</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">0-9</kbd> Fret</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">Backspace</kbd> Delete</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">Ctrl+C/V</kbd> Copy/Paste</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">r</kbd> Rest</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">w/h/q/e</kbd> Durations</div>
            <div><kbd className="bg-gray-100 dark:bg-slate-700 px-1 rounded border dark:border-slate-600 shadow-sm">Enter</kbd> New Bar</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
