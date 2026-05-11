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
        <CardTitle className="text-3xl">Rhythm Accuracy</CardTitle>
        <CardDescription>Test your internal metronome</CardDescription>
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
                max={180} 
                step={1} 
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>60</span>
                <span>120</span>
                <span>180</span>
              </div>
            </>
          )}
        </div>
        
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg text-sm text-center">
          You'll hear 4 count-in beats. 
          <br/>After they stop, continue tapping the tempo for 16 beats using Spacebar, Click, or Tap.
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

  const getGradeLetter = (score: number) => {
    if (score >= 95) return 'S';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <Card className="w-full animate-in fade-in zoom-in duration-500">
      <CardHeader className="text-center">
        <Badge variant="outline" className="mx-auto mb-2">COMPLETE</Badge>
        <CardTitle className="text-3xl">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`text-8xl font-black ${getGradeColor(results.overallScore)} drop-shadow-2xl leading-none`}>
            {getGradeLetter(results.overallScore)}
          </div>
          <div className="mt-4 text-xl text-neutral-400 font-medium">
            Target: <span className="text-white">{tempo} BPM</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-900 p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="text-xl font-bold">{results.accuracy}%</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Accuracy</div>
          </div>
          <div className="bg-neutral-900 p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="text-xl font-bold">{results.averageError}ms</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Avg Error</div>
          </div>
          <div className="bg-neutral-900 p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="text-xl font-bold">{results.averageBPM}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Avg BPM</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Tendency</span>
            <span className="font-medium">
              {results.earlyCount > results.lateCount ? 'Rushing (Early)' : 
               results.lateCount > results.earlyCount ? 'Dragging (Late)' : 'Balanced'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Best Tap</span>
            <span className="font-medium text-green-500">{Math.round(results.bestTap?.errorMs || 0)}ms</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Worst Tap</span>
            <span className="font-medium text-red-500">{Math.round(results.worstTap?.errorMs || 0)}ms</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-neutral-800">
          <h4 className="text-sm font-medium mb-3 text-neutral-400">Beat Breakdown (BPM)</h4>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 justify-center">
            {results.taps.map((tap, i) => {
              let color = 'text-red-500 bg-red-500/10';
              if (tap.score === 100) color = 'text-green-500 bg-green-500/10';
              else if (tap.score >= 80) color = 'text-green-400 bg-green-400/10';
              else if (tap.score >= 50) color = 'text-yellow-500 bg-yellow-500/10';
              else if (tap.score >= 20) color = 'text-orange-500 bg-orange-500/10';

              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center p-1 rounded-md ${color}`}
                  title={`Error: ${Math.round(tap.errorMs)}ms`}
                >
                  <span className="text-[10px] opacity-70">#{i + 1}</span>
                  <span className="text-sm font-bold">{Math.round(tap.achievedBPM)}</span>
                </div>
              );
            })}
          </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button className="w-full h-12" onClick={onRestart}>Try Again</Button>
      </CardFooter>
    </Card>
  );
}
