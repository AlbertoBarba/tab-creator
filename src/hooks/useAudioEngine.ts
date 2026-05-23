import { useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useTabStore } from '../store/useTabStore';

export const useAudioEngine = () => {
  const { song, isPlaying, setIsPlaying, setPlayhead } = useTabStore();
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);

  // Initialize a basic bass sound
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).toDestination();
    
    synthRef.current = synth;
    return () => {
      synth.dispose();
    };
  }, []);

  const stopPlayback = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    scheduledEventsRef.current.forEach(id => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];
    setIsPlaying(false);
    setPlayhead(null);
  }, [setIsPlaying, setPlayhead]);

  const startPlayback = useCallback(async () => {
    await Tone.start();
    Tone.Transport.bpm.value = song.tempo;
    Tone.Transport.cancel();
    
    let currentTime = 0;
    const events: number[] = [];

    song.measures.forEach((measure, mIdx) => {
      measure.beats.forEach((beat, bIdx) => {
        const duration = beat.duration * (60 / song.tempo);
        
        // Schedule sound
        if (!beat.isRest) {
          beat.notes.forEach(note => {
            const pitch = Tone.Frequency(song.tuning[note.string]).transpose(note.fret).toNote();
            Tone.Transport.schedule((time) => {
              synthRef.current?.triggerAttackRelease(pitch, beat.duration * 0.9, time);
            }, currentTime);
          });
        }

        // Schedule visual playhead
        const eventId = Tone.Transport.schedule((time) => {
          Tone.Draw.schedule(() => {
            setPlayhead({ measureIndex: mIdx, beatIndex: bIdx });
          }, time);
        }, currentTime);
        events.push(eventId);

        currentTime += beat.duration * (4 / song.timeSignature[1]) * (60 / song.tempo);
      });
    });

    scheduledEventsRef.current = events;
    Tone.Transport.start();
    setIsPlaying(true);

    // Stop automatically at end
    const totalDuration = currentTime;
    Tone.Transport.schedule(() => {
      Tone.Draw.schedule(() => stopPlayback(), Tone.now());
    }, totalDuration);

  }, [song, setIsPlaying, setPlayhead, stopPlayback]);

  useEffect(() => {
    if (isPlaying && Tone.Transport.state !== 'started') {
      startPlayback();
    } else if (!isPlaying && Tone.Transport.state === 'started') {
      stopPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  return { startPlayback, stopPlayback };
};
