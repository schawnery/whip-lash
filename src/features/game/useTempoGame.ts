import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, TapData, GameResults } from './types';
import { metronome } from './metronome';
import { calculateScoreForTap, calculateResults } from './scoring';

/** Get the current date string in US Eastern Time (YYYY-M-D) */
export function getDailyDateStr(): string {
  const d = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(d);
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

/** Get the Day number relative to epoch */
export function getDailyEpochDay(): number {
  const d = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(d);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day')!.value);
  
  const nyDate = new Date(year, month, day);
  const epochDate = new Date(2024, 4, 1); // May 1, 2024 as epoch
  
  const diffTime = Math.abs(nyDate.getTime() - epochDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Generate a deterministic BPM for today's daily challenge (60-220). */
function getDailyBPM(): number {
  const dateStr = getDailyDateStr();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % (220 - 60 + 1)) + 60;
}

const ONBOARDING_STORAGE_KEY = 'whiplash_onboarding_completed';

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

function markOnboardingCompleted() {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

export const useTempoGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => (hasCompletedOnboarding() ? 'setup' : 'welcome'));
  const [tempo, setTempo] = useState<number>(100);
  const [isRandomBPM, setIsRandomBPM] = useState<boolean>(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);
  const [results, setResults] = useState<GameResults | null>(null);

  const [hasPlayedDaily, setHasPlayedDaily] = useState<boolean>(false);
  const [dailyResults, setDailyResults] = useState<GameResults | null>(null);

  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [tapPhaseBeatCount, setTapPhaseBeatCount] = useState<number>(0);
  const [tutorialTapCount, setTutorialTapCount] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  const expectedBeatsRef = useRef<number[]>([]);
  const tapsRef = useRef<TapData[]>([]);
  const lastTapTimeRef = useRef<number>(0);
  const tutorialTimeoutRef = useRef<number | null>(null);

  // Settings
  const COUNT_IN_BEATS = 4;
  const TOTAL_TAP_BEATS = 16;
  const TUTORIAL_TAP_BEATS = 8;
  const TUTORIAL_TEMPO = 100;
  const MIN_DOUBLE_TAP_MS = 80;

  useEffect(() => {
    // Keep beat indicator updated
    metronome.setOnBeatCallback((beat, time) => {
      // beat is 0-indexed.
      if (gameState === 'count-in' || gameState === 'tutorial-listen') {
        setCurrentBeatIndex(beat);

        const activeTempo = gameState === 'tutorial-listen' ? TUTORIAL_TEMPO : tempo;
        const secondsPerBeat = 60.0 / activeTempo;

        // Add the expected beats based on exact metronome timing
        if (beat === COUNT_IN_BEATS - 1) {
          // This is the last count-in beat.
          const startTime = time + secondsPerBeat;

          if (gameState === 'count-in') {
            expectedBeatsRef.current = Array.from({ length: TOTAL_TAP_BEATS }).map(
              (_, i) => (startTime + i * secondsPerBeat) * 1000 // Convert to ms for easier comparison
            );

            setTimeout(() => {
              metronome.stop();
              setGameState('tap');
              setCurrentBeatIndex(0);
              setTapPhaseBeatCount(0);
            }, secondsPerBeat * 1000 - 50); // slight buffer before phase change
          } else {
            // Tutorial: continue the rhythm, unscored. Auto-advance to the
            // confirmation step regardless of how many taps land, so the
            // player can never fail the tutorial.
            setTimeout(() => {
              metronome.stop();
              setGameState('tutorial-tap');
              setCurrentBeatIndex(0);
              setTutorialTapCount(0);

              tutorialTimeoutRef.current = window.setTimeout(() => {
                setGameState('tutorial-done');
              }, TUTORIAL_TAP_BEATS * secondsPerBeat * 1000 + 500);
            }, secondsPerBeat * 1000 - 50);
          }
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
    // Check localStorage for daily
    const saved = localStorage.getItem('whiplash_daily');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dateStr === getDailyDateStr()) {
          setHasPlayedDaily(true);
          setDailyResults(parsed.results);
        }
      } catch (e) {
        // ignore
      }
    }

    return () => {
      metronome.stop();
      if (tutorialTimeoutRef.current) {
        window.clearTimeout(tutorialTimeoutRef.current);
      }
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
    
    let startingTempo = tempo;
    if (isRandomBPM) {
      startingTempo = Math.floor(Math.random() * (180 - 60 + 1)) + 60;
      setTempo(startingTempo);
    }
    
    metronome.init();
    audioContextRef.current = metronome.getContext();
    
    setGameState('count-in');
    metronome.start(startingTempo, COUNT_IN_BEATS);
  }, [tempo, isRandomBPM]);

  const clearTutorialTimeout = () => {
    if (tutorialTimeoutRef.current) {
      window.clearTimeout(tutorialTimeoutRef.current);
      tutorialTimeoutRef.current = null;
    }
  };

  const startTutorial = useCallback(() => {
    clearTutorialTimeout();
    tapsRef.current = [];
    expectedBeatsRef.current = [];
    lastTapTimeRef.current = 0;
    setCurrentBeatIndex(0);
    setTutorialTapCount(0);

    metronome.init();
    audioContextRef.current = metronome.getContext();

    setGameState('tutorial-listen');
    metronome.start(TUTORIAL_TEMPO, COUNT_IN_BEATS);
  }, []);

  const skipTutorial = useCallback(() => {
    clearTutorialTimeout();
    metronome.stop();
    markOnboardingCompleted();
    setGameState('setup');
  }, []);

  const finishTutorial = useCallback(() => {
    clearTutorialTimeout();
    markOnboardingCompleted();
    startGame();
  }, [startGame]);

  const startDailyChallenge = useCallback(() => {
    if (hasPlayedDaily && dailyResults) {
      setResults(dailyResults);
      setIsDailyChallenge(true);
      setGameState('results');
      return;
    }

    tapsRef.current = [];
    expectedBeatsRef.current = [];
    lastTapTimeRef.current = 0;
    setResults(null);
    setCurrentBeatIndex(0);
    setTapPhaseBeatCount(0);

    const dailyTempo = getDailyBPM();
    setTempo(dailyTempo);
    setIsDailyChallenge(true);

    metronome.init();
    audioContextRef.current = metronome.getContext();

    setGameState('count-in');
    metronome.start(dailyTempo, COUNT_IN_BEATS);
  }, [hasPlayedDaily, dailyResults]);

  const finishGame = useCallback(() => {
    setGameState('results');
    const newResults = calculateResults(tapsRef.current);
    setResults(newResults);

    if (isDailyChallenge) {
      setHasPlayedDaily(true);
      setDailyResults(newResults);
      localStorage.setItem('whiplash_daily', JSON.stringify({
        dateStr: getDailyDateStr(),
        results: newResults
      }));
    }
  }, [isDailyChallenge]);

  const handleTap = useCallback(() => {
    if (gameState === 'tutorial-tap') {
      if (!audioContextRef.current) return;
      const nowMs = audioContextRef.current.currentTime * 1000;
      if (nowMs - lastTapTimeRef.current < MIN_DOUBLE_TAP_MS) return;
      lastTapTimeRef.current = nowMs;
      setTutorialTapCount(prev => prev + 1);
      return;
    }

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
    metronome.stop();
    setIsDailyChallenge(false);
    setGameState('setup');
    setResults(null);
    setCurrentBeatIndex(0);
    setTapPhaseBeatCount(0);
  }, []);

  return {
    gameState,
    tempo,
    setTempo,
    isRandomBPM,
    setIsRandomBPM,
    isDailyChallenge,
    startGame,
    startDailyChallenge,
    startTutorial,
    skipTutorial,
    finishTutorial,
    handleTap,
    restartGame,
    results,
    hasPlayedDaily,
    currentBeatIndex,
    tapPhaseBeatCount,
    tutorialTapCount,
    TOTAL_TAP_BEATS,
    TUTORIAL_TAP_BEATS,
    COUNT_IN_BEATS
  };
};
