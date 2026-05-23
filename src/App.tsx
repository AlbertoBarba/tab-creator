import React from 'react';
import { TabCanvas } from './components/Editor/TabCanvas';
import { useTabStore } from './store/useTabStore';

function App() {
  const title = useTabStore((state) => state.song.title);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <TabCanvas />
      </main>
    </div>
  );
}

export default App;
