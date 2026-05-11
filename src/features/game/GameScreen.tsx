import { useEffect } from 'react';
import type { GameResults } from './types';
import { useTempoGame } from './useTempoGame';

// UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

export default function GameScreen() {
  const {
    gameState,
    tempo,
    setTempo,
    isRandomBPM,
    setIsRandomBPM,
    startGame,
    handleTap,
    restartGame,
    results,
    currentBeatIndex,
    tapPhaseBeatCount,
    TOTAL_TAP_BEATS,
    COUNT_IN_BEATS
  } = useTempoGame();

  // Handle global keyboard / touch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // prevent scrolling
        if (gameState === 'tap') handleTap();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // If clicking on buttons, let the button handle it
      if ((e.target as HTMLElement).closest('button')) return;
      if (gameState === 'tap') handleTap();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [gameState, handleTap]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {gameState === 'setup' && (
          <SetupView tempo={tempo} setTempo={setTempo} onStart={startGame} isRandomBPM={isRandomBPM} setIsRandomBPM={setIsRandomBPM} />
        )}

        {gameState === 'count-in' && (
          <CountInView tempo={tempo} isRandomBPM={isRandomBPM} currentBeat={currentBeatIndex} totalBeats={COUNT_IN_BEATS} />
        )}

        {gameState === 'tap' && (
          <TapPhaseView tempo={tempo} isRandomBPM={isRandomBPM} tapCount={tapPhaseBeatCount} totalTaps={TOTAL_TAP_BEATS} />
        )}

        {gameState === 'results' && results && (
          <ResultsView results={results} tempo={tempo} onRestart={restartGame} />
        )}
      </div>
    </div>
  );
}

function SetupView({ tempo, setTempo, onStart, isRandomBPM, setIsRandomBPM }: { tempo: number, setTempo: (v: number) => void, onStart: () => void, isRandomBPM: boolean, setIsRandomBPM: (v: boolean) => void }) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-5xl">Whip Lash</CardTitle>
        <CardDescription>Are you rushing or are you dragging?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold tracking-tighter">{isRandomBPM ? "?" : tempo}</div>
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest">BPM</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-300">Random BPM</span>
            <Button
              variant={isRandomBPM ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRandomBPM(!isRandomBPM)}
            >
              {isRandomBPM ? "ON" : "OFF"}
            </Button>
          </div>
          {!isRandomBPM && (
            <>
              <Slider
                value={[tempo]}
                onValueChange={(val) => setTempo(val[0])}
                min={60}
                max={220}
                step={1}
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>60</span>
                <span>120</span>
                <span>220</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg text-sm text-center">
          You'll hear 4 count-in beats.
          <br />After they stop, continue tapping the tempo for 16 beats using Spacebar, Click, or Tap.
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full h-14 text-lg" onClick={onStart}>Start Test</Button>
      </CardFooter>
    </Card>
  );
}

function CountInView({ tempo, isRandomBPM, currentBeat, totalBeats }: { tempo: number, isRandomBPM: boolean, currentBeat: number, totalBeats: number }) {
  return (
    <Card className="w-full border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
      <CardHeader className="text-center">
        <Badge variant="secondary" className="mx-auto bg-blue-500/10 text-blue-500 mb-2">LISTEN</Badge>
        <CardTitle className="text-2xl">{isRandomBPM ? "??? BPM" : `${tempo} BPM`}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex gap-4">
          {Array.from({ length: totalBeats }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full transition-all duration-100 flex items-center justify-center font-bold text-xl
                ${i === currentBeat ? 'bg-blue-500 text-white scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                  i < currentBeat ? 'bg-blue-500/30 text-blue-200' : 'bg-neutral-800 text-neutral-600'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <p className="mt-8 text-neutral-400 text-sm animate-pulse">Wait for the count-in to finish...</p>
      </CardContent>
    </Card>
  );
}

function TapPhaseView({ tempo, isRandomBPM, tapCount, totalTaps }: { tempo: number, isRandomBPM: boolean, tapCount: number, totalTaps: number }) {
  const progress = Math.min(100, (tapCount / totalTaps) * 100);

  return (
    <Card className="w-full border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.1)] select-none">
      <CardHeader className="text-center">
        <Badge variant="secondary" className="mx-auto bg-green-500/10 text-green-500 mb-2">TAP NOW</Badge>
        <CardTitle className="text-2xl">{isRandomBPM ? "??? BPM" : `${tempo} BPM`}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-neutral-800">
          <div className="absolute inset-0 bg-green-500/5 rounded-full animate-ping opacity-50" />
          <div className="text-center z-10">
            <div className="text-5xl font-black">{tapCount}</div>
            <div className="text-sm text-neutral-400">/ {totalTaps}</div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2 bg-neutral-800" />
          <p className="text-center text-sm text-neutral-500">Press Space or Tap Screen on the beat</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsView({ results, tempo, onRestart }: { results: GameResults, tempo: number, onRestart: () => void }) {
  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGradeLetter = (score: number) => {
    if (score >= 95) return 'S';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getTendencyInfo = () => {
    // Average absolute error — if ≤10ms they're nailing it
    if (results.averageError <= 10) {
      return { label: 'ON BEAT', desc1: "You're whipping your lash.", desc2: "Nearly perfect timing." };
    }

    // Average signed error across all taps:
    //   negative = tapping before the beat = rushing (higher BPM)
    //   positive = tapping after the beat  = dragging (lower BPM)
    const avgSignedError = results.taps.length > 0
      ? results.taps.reduce((sum, t) => sum + t.errorMs, 0) / results.taps.length
      : 0;

    if (avgSignedError < 0) {
      return { label: 'RUSHING', desc1: "You're consistently ahead of the beat.", desc2: "Try to hold back slightly." };
    } else {
      return { label: 'DRAGGING', desc1: "You're consistently behind the beat.", desc2: "Try to anticipate the next click." };
    }
  };
  const tendency = getTendencyInfo();

  return (
    <Card className="w-full animate-in fade-in zoom-in duration-500">
      <CardContent className="space-y-6 pt-6">

        <div className="flex flex-row justify-between items-center gap-6 py-6 overflow-hidden">
          {/* Left Column */}
          <div className="flex flex-col text-left shrink min-w-0">
            <div className={`text-4xl font-black italic ${getGradeColor(results.overallScore)} leading-none`}>
              {getGradeLetter(results.overallScore)}
            </div>
            <div className="text-3xl font-black uppercase tracking-tighter text-white mt-1 leading-none">
              {tendency.label}
            </div>
            <div className="text-[11px] text-neutral-400 mt-3 leading-relaxed font-medium">
              <p>{tendency.desc1}</p>
              <p>{tendency.desc2}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col shrink-0 items-end text-right">
            {/* Target BPM */}
            <div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">Target BPM</div>
              <div className="flex items-baseline gap-1 leading-none mt-1">
                <span className="text-3xl font-bold text-white tracking-tight">{tempo}</span>
                <span className="text-[9px] text-neutral-500 font-medium">BPM</span>
              </div>
            </div>

            <div className="h-[1px] bg-neutral-800/60 w-full my-3"></div>

            {/* Accuracy */}
            <div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">Accuracy</div>
              <div className={`text-3xl font-bold leading-none tracking-tight mt-1 ${getGradeColor(results.accuracy)}`}>
                {results.accuracy}%
              </div>
              <div className="flex gap-1 mt-2 justify-end">
                {[1, 2, 3, 4, 5].map((v) => {
                  const isStrictActive = results.accuracy >= v * 20 - 10; 
                  return (
                    <div 
                      key={v} 
                      className={`h-1 w-5 rounded-full ${isStrictActive ? getGradeBgColor(results.accuracy) : 'bg-neutral-800'}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] bg-neutral-800/60 w-full my-3"></div>

            {/* Bottom Row */}
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">Avg Error</div>
                <div className="flex items-baseline gap-0.5 leading-none mt-1 justify-end">
                  <span className="text-xl font-bold text-white tracking-tight">{results.averageError}</span>
                  <span className="text-[9px] text-neutral-500 font-medium">ms</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">Avg BPM</div>
                <div className="flex items-baseline gap-0.5 leading-none mt-1 justify-end">
                  <span className="text-xl font-bold text-white tracking-tight">{results.averageBPM}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full flex justify-center py-4 bg-neutral-900/50 rounded-xl overflow-hidden">
            <div className="relative w-[164px]">
              {/* The vertical true timeline track */}
              <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-neutral-700"></div>

              {results.taps.map((tap, i) => {
                const maxVisualError = 150;
                const maxPx = 18; // Max offset in pixels
                let offsetPx = (tap.errorMs / maxVisualError) * maxPx;

                if (offsetPx > maxPx) offsetPx = maxPx;
                if (offsetPx < -maxPx) offsetPx = -maxPx;

                let color = 'bg-red-500/50';
                let boxColor = 'text-red-500 bg-red-500/10';

                if (tap.score === 100) {
                  color = 'bg-green-500/50';
                  boxColor = 'text-green-500 bg-green-500/10';
                } else if (tap.score >= 80) {
                  color = 'bg-green-400/50';
                  boxColor = 'text-green-400 bg-green-400/10';
                } else if (tap.score >= 50) {
                  color = 'bg-yellow-500/50';
                  boxColor = 'text-yellow-500 bg-yellow-500/10';
                } else if (tap.score >= 20) {
                  color = 'bg-orange-500/50';
                  boxColor = 'text-orange-500 bg-orange-500/10';
                }

                const errorMsRounded = Math.round(tap.errorMs);
                const diffStr = errorMsRounded > 0 ? `+${errorMsRounded}ms` : `${errorMsRounded}ms`;
                const isBest = results.bestTap && tap.timestamp === results.bestTap.timestamp;

                return (
                  <div key={i} className="relative h-12 w-full">
                    {/* True beat indicator */}
                    <div className="absolute left-[-1px] top-[50%] mt-[-1px] w-4 h-0.5 bg-neutral-500 z-0"></div>

                    {/* User Tap Marker */}
                    <div
                      className="absolute left-[1px] flex items-center"
                      style={{ top: `calc(50% + ${offsetPx}px)`, transform: 'translateY(-50%)', zIndex: 10 }}
                    >
                      <div className={`w-3 h-3 rounded-full shrink-0 ${color}`}></div>

                      {/* Score Box */}
                      <div className="ml-5">
                        <div
                          className={`flex flex-row items-center gap-3 px-3 py-1.5 rounded-md relative ${boxColor} w-[100px]`}
                          title={`Error: ${errorMsRounded}ms`}
                        >
                          {isBest && <span className="absolute -top-2 -right-2 text-xs">⭐</span>}
                          <span className="text-[10px] font-medium opacity-60 w-4">#{i + 1}</span>
                          <span className="text-[10px] font-medium opacity-80 flex-1 text-right">{diffStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full h-12" onClick={onRestart}>Try Again</Button>
      </CardFooter>
    </Card>
  );
}
