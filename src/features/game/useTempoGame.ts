import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, TapData, GameResults } from './types';
import { metronome } from './metronome';
import { calculateScoreForTap, calculateResults } from './scoring';

/** Get a UTC date string (YYYY-MM-DD) offset by a number of days from a base date. */
function getDateStrForOffset(daysOffset: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + daysOffset);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Get today's UTC date string (YYYY-MM-DD). Every player gets the same value on the same day. */
export function getDailyDateStr(date: Date = new Date()): string {
  return getDateStrForOffset(0, date);
}

/** Get the Day number relative to epoch, based on the UTC calendar date. */
export function getDailyEpochDay(date: Date = new Date()): number {
  const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const epochDate = Date.UTC(2024, 4, 1); // May 1, 2024 as epoch

  const diffTime = utcDate - epochDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Milliseconds remaining until the next UTC day begins. */
function getMsUntilNextUTCDay(date: Date = new Date()): number {
  const nextUTCMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  return nextUTCMidnight - date.getTime();
}

/** Format a millisecond duration as HH:MM:SS. */
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Hash a string into a 32-bit unsigned integer seed. */
function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Mulberry32 seeded PRNG — returns a function producing deterministic floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed for a named daily variable, scoped to today's date so each variable gets its own stream. */
function getDailySeed(component: string, date: Date = new Date()): number {
  return hashStringToSeed(`${getDailyDateStr(date)}:${component}`);
}

/** Generate a deterministic BPM for today's challenge (60-220) from the daily seed. */
function getDailyBPM(date: Date = new Date()): number {
  const rand = mulberry32(getDailySeed('bpm', date));
  return Math.floor(rand() * (220 - 60 + 1)) + 60;
}

const ONBOARDING_STORAGE_KEY = 'whiplash_onboarding_completed';
const HAS_PLAYED_GAME_STORAGE_KEY = 'whiplash_has_played_game';
const DAILY_RESULTS_STORAGE_KEY = 'whiplash_daily';
const STREAK_STORAGE_KEY = 'whiplash_streak';

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

function markOnboardingCompleted() {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

function hasPlayedAnyGame(): boolean {
  return localStorage.getItem(HAS_PLAYED_GAME_STORAGE_KEY) === 'true';
}

function markHasPlayedGame() {
  localStorage.setItem(HAS_PLAYED_GAME_STORAGE_KEY, 'true');
}

interface DailyRecord {
  dateStr: string;
  results: GameResults;
}

function loadDailyRecord(): DailyRecord | null {
  const saved = localStorage.getItem(DAILY_RESULTS_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

interface StreakRecord {
  count: number;
  lastCompletedDateStr: string;
}

function loadStreakRecord(): StreakRecord | null {
  const saved = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/** The streak as of `date`, accounting for a missed day breaking it even before today is played. */
function getCurrentStreak(date: Date = new Date()): number {
  const existing = loadStreakRecord();
  if (!existing) return 0;

  const today = getDailyDateStr(date);
  const yesterday = getDateStrForOffset(-1, date);
  if (existing.lastCompletedDateStr === today || existing.lastCompletedDateStr === yesterday) {
    return existing.count;
  }
  return 0;
}

/** Record that Today's Challenge was completed, extending the streak if completed yesterday too. */
function recordStreakCompletion(date: Date = new Date()): void {
  const today = getDailyDateStr(date);
  const yesterday = getDateStrForOffset(-1, date);
  const existing = loadStreakRecord();

  let newCount: number;
  if (existing?.lastCompletedDateStr === today) {
    newCount = existing.count;
  } else if (existing?.lastCompletedDateStr === yesterday) {
    newCount = existing.count + 1;
  } else {
    newCount = 1;
  }

  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify({ count: newCount, lastCompletedDateStr: today }));
}

export const useTempoGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => (hasCompletedOnboarding() ? 'setup' : 'welcome'));
  const [tempo, setTempo] = useState<number>(100);
  const [isRandomBPM, setIsRandomBPM] = useState<boolean>(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);
  const [results, setResults] = useState<GameResults | null>(null);

  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(() => loadDailyRecord());
  const [showPracticeRecommendation, setShowPracticeRecommendation] = useState<boolean>(() => !hasPlayedAnyGame());

  // Ticks once a second so the daily countdown, BPM preview, and streak stay
  // live (and roll over correctly) without requiring a page reload.
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

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

  const nowDate = new Date(nowTick);
  const dailyDateStr = getDailyDateStr(nowDate);
  const hasPlayedDaily = dailyRecord?.dateStr === dailyDateStr;
  const dailyResults = hasPlayedDaily ? dailyRecord!.results : null;
  const dailyBPM = getDailyBPM(nowDate);
  const dailyCountdown = formatCountdown(getMsUntilNextUTCDay(nowDate));
  const streak = getCurrentStreak(nowDate);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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

    setTempo(dailyBPM);
    setIsDailyChallenge(true);

    metronome.init();
    audioContextRef.current = metronome.getContext();

    setGameState('count-in');
    metronome.start(dailyBPM, COUNT_IN_BEATS);
  }, [hasPlayedDaily, dailyResults, dailyBPM]);

  const finishGame = useCallback(() => {
    setGameState('results');
    const newResults = calculateResults(tapsRef.current);
    setResults(newResults);

    markHasPlayedGame();
    setShowPracticeRecommendation(false);

    if (isDailyChallenge) {
      const record: DailyRecord = { dateStr: getDailyDateStr(), results: newResults };
      localStorage.setItem(DAILY_RESULTS_STORAGE_KEY, JSON.stringify(record));
      setDailyRecord(record);
      recordStreakCompletion();
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
    dailyBPM,
    dailyCountdown,
    streak,
    showPracticeRecommendation,
    currentBeatIndex,
    tapPhaseBeatCount,
    tutorialTapCount,
    TOTAL_TAP_BEATS,
    TUTORIAL_TAP_BEATS,
    COUNT_IN_BEATS
  };
};
