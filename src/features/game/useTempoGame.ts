import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, TapData, GameResults } from './types';
import { metronome } from './metronome';
import { calculateScoreForTap, calculateResults } from './scoring';

export const useTempoGame = () => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [tempo, setTempo] = useState<number>(100);
  const [results, setResults] = useState<GameResults | null>(null);
  
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [tapPhaseBeatCount, setTapPhaseBeatCount] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  
  const expectedBeatsRef = useRef<number[]>([]);
  const tapsRef = useRef<TapData[]>([]);
  const lastTapTimeRef = useRef<number>(0);

  // Settings
  const COUNT_IN_BEATS = 4;
  const TOTAL_TAP_BEATS = 16;
  const MIN_DOUBLE_TAP_MS = 80;

  useEffect(() => {
    // Keep beat indicator updated
    metronome.setOnBeatCallback((beat, time) => {
      // beat is 0-indexed.
      if (gameState === 'count-in') {
        setCurrentBeatIndex(beat);
        
        // Schedule transition to tap phase
        const secondsPerBeat = 60.0 / tempo;
        
        // Add the expected beats based on exact metronome timing
        if (beat === COUNT_IN_BEATS - 1) {
          // This is the last count-in beat.
          const startTime = time + secondsPerBeat;
          
          expectedBeatsRef.current = Array.from({ length: TOTAL_TAP_BEATS }).map(
            (_, i) => (startTime + i * secondsPerBeat) * 1000 // Convert to ms for easier comparison
          );
          
          setTimeout(() => {
            metronome.stop();
            setGameState('tap');
            setCurrentBeatIndex(0);
            setTapPhaseBeatCount(0);
          }, secondsPerBeat * 1000 - 50); // slight buffer before phase change
        }
      }
    });

    return () => {
      // Only clear the callback, don't stop the metronome here because it runs across state changes
      metronome.setOnBeatCallback(() => {});
    };
  }, [gameState, tempo]);

  // Clean up metronome on unmount
  useEffect(() => {
    return () => {
      metronome.stop();
    };
  }, []);

  // Finish game if tap phase runs out (using a timer fallback in case user stops tapping)
  useEffect(() => {
    let timeoutId: number;
    if (gameState === 'tap' && expectedBeatsRef.current.length > 0) {
      const lastExpectedTapMs = expectedBeatsRef.current[expectedBeatsRef.current.length - 1];
      const audioCtx = metronome.getContext();
      if (audioCtx) {
        const timeRemainingMs = lastExpectedTapMs - (audioCtx.currentTime * 1000) + 1000; // wait 1s after last beat
        timeoutId = window.setTimeout(() => {
          finishGame();
        }, Math.max(timeRemainingMs, 1000));
      }
    }
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  const startGame = useCallback(() => {
    tapsRef.current = [];
    expectedBeatsRef.current = [];
    lastTapTimeRef.current = 0;
    setResults(null);
    setCurrentBeatIndex(0);
    setTapPhaseBeatCount(0);
    
    metronome.init();
    audioContextRef.current = metronome.getContext();
    
    setGameState('count-in');
    metronome.start(tempo);
  }, [tempo]);

  const finishGame = useCallback(() => {
    setGameState('results');
    setResults(calculateResults(tapsRef.current));
  }, []);

  const handleTap = useCallback(() => {
    if (gameState !== 'tap' || !audioContextRef.current) return;
    
    const nowSecs = audioContextRef.current.currentTime;
    const nowMs = nowSecs * 1000;

    if (nowMs - lastTapTimeRef.current < MIN_DOUBLE_TAP_MS) {
      return; // prevent double taps
    }
    lastTapTimeRef.current = nowMs;

    // Find closest expected beat
    if (expectedBeatsRef.current.length === 0) return;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    
    expectedBeatsRef.current.forEach((expected, idx) => {
      // Check if this expected beat already has a tap recorded near it
      // For simplicity, we just find the absolute closest beat that hasn't been matched
      // or we can just find the closest beat overall.
      const diff = Math.abs(nowMs - expected);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    // In a real app, we might want to ensure a single expected beat can only be "hit" once.
    // For MVP, we'll just track whatever is closest.
    const expected = expectedBeatsRef.current[closestIdx];
    const errorMs = nowMs - expected;
    const isEarly = errorMs < 0;
    const score = calculateScoreForTap(errorMs);

    let prevTapTimestamp = 0;
    if (tapsRef.current.length === 0) {
      // Approximate the "previous tap" as the last metronome click
      prevTapTimestamp = expectedBeatsRef.current[0] - (60000 / tempo);
    } else {
      prevTapTimestamp = tapsRef.current[tapsRef.current.length - 1].timestamp;
    }

    const intervalMs = nowMs - prevTapTimestamp;
    const achievedBPM = intervalMs > 0 ? 60000 / intervalMs : 0;

    const newTap: TapData = {
      timestamp: nowMs,
      expectedTimestamp: expected,
      errorMs,
      isEarly,
      score,
      achievedBPM
    };

    tapsRef.current.push(newTap);
    
    // Update state to trigger UI
    setTapPhaseBeatCount(prev => prev + 1);

    if (tapsRef.current.length >= TOTAL_TAP_BEATS) {
      finishGame();
    }
  }, [gameState, finishGame]);

  const restartGame = useCallback(() => {
    setGameState('setup');
    setResults(null);
    setCurrentBeatIndex(0);
    setTapPhaseBeatCount(0);
  }, []);

  return {
    gameState,
    tempo,
    setTempo,
    startGame,
    handleTap,
    restartGame,
    results,
    currentBeatIndex,
    tapPhaseBeatCount,
    TOTAL_TAP_BEATS,
    COUNT_IN_BEATS
  };
};
