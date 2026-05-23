import React from 'react';
import { TabCanvas } from './components/Editor/TabCanvas';
import { useTabStore } from './store/useTabStore';

function App() {
  const song = useTabStore((state) => state.song);
  const cursor = useTabStore((state) => state.cursor);
  const addMeasure = useTabStore((state) => state.addMeasure);
  const deleteMeasure = useTabStore((state) => state.deleteMeasure);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{song.title}</h1>
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
      </header>
      <main className="flex-1 overflow-hidden">
        <TabCanvas />
      </main>
    </div>
  );
}

export default App;
