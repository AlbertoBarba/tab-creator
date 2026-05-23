import { Song } from '../types/tab';

export const saveSong = (song: Song) => {
  const data = JSON.stringify(song, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(song.title || 'bass_tab').replace(/\s+/g, '_')}.btab`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
