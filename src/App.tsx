import React from 'react';
import { TabCanvas } from './components/Editor/TabCanvas';
import { useTabStore } from './store/useTabStore';

function App() {
  const song = useTabStore((state) => state.song);
  const cursor = useTabStore((state) => state.cursor);
  const addMeasure = useTabStore((state) => state.addMeasure);
  const deleteMeasure = useTabStore((state) => state.deleteMeasure);
  const updateTimeSignature = useTabStore((state) => state.updateTimeSignature);

  const handleTimeSigChange = (num: string, den: string) => {
    updateTimeSignature(parseInt(num) || 4, parseInt(den) || 4);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{song.title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
            <span className="text-xs font-medium text-gray-500 uppercase">Time Sig</span>
            <input 
              type="number" 
              value={song.timeSignature[0]} 
              onChange={(e) => handleTimeSigChange(e.target.value, song.timeSignature[1].toString())}
              className="w-10 border rounded px-1 text-center"
              min="1"
              max="32"
            />
            <span>/</span>
            <select 
              value={song.timeSignature[1]} 
              onChange={(e) => handleTimeSigChange(song.timeSignature[0].toString(), e.target.value)}
              className="border rounded px-1"
            >
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => addMeasure()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Add Measure
            </button>
            <button 
              onClick={() => deleteMeasure(cursor.measureIndex)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Delete Measure
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <TabCanvas />
      </main>
      <footer className="bg-white border-t p-4 text-sm text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-x-8 gap-y-2 justify-center">
          <div><kbd className="bg-gray-100 px-1 rounded border">Arrows</kbd> Navigate</div>
          <div><kbd className="bg-gray-100 px-1 rounded border">0-9</kbd> Enter Fret</div>
          <div><kbd className="bg-gray-100 px-1 rounded border">Backspace</kbd> Delete Note</div>
          <div><kbd className="bg-gray-100 px-1 rounded border">w</kbd>/<kbd className="bg-gray-100 px-1 rounded border">h</kbd>/<kbd className="bg-gray-100 px-1 rounded border">q</kbd>/<kbd className="bg-gray-100 px-1 rounded border">e</kbd> Whole/Half/Quarter/Eighth</div>
          <div><kbd className="bg-gray-100 px-1 rounded border">Enter</kbd>/<kbd className="bg-gray-100 px-1 rounded border">+</kbd> New Measure</div>
          <div><kbd className="bg-gray-100 px-1 rounded border">Shift+BS</kbd> Delete Measure</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
