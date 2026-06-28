import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, Play, Trophy, Share2 } from 'lucide-react';
import type { GameResults } from './types';
import { useTempoGame, getDailyEpochDay } from './useTempoGame';

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
    showPracticeRecommendation,
    currentBeatIndex,
    tapPhaseBeatCount,
    tutorialTapCount,
    TOTAL_TAP_BEATS,
    COUNT_IN_BEATS
  } = useTempoGame();

  // Handle global keyboard / touch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // prevent scrolling
        if (gameState === 'tap' || gameState === 'tutorial-tap') handleTap();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // If clicking on buttons, let the button handle it
      if ((e.target as HTMLElement).closest('button')) return;
      if (gameState === 'tap' || gameState === 'tutorial-tap') handleTap();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [gameState, handleTap]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full">
      <div className="w-full">
        {gameState === 'welcome' && (
          <WelcomeView onStartTutorial={startTutorial} onSkip={skipTutorial} />
        )}

        {gameState === 'tutorial-listen' && (
          <TutorialListenView currentBeat={currentBeatIndex} totalBeats={COUNT_IN_BEATS} onBack={skipTutorial} />
        )}

        {gameState === 'tutorial-tap' && (
          <TutorialTapView tapCount={tutorialTapCount} onBack={skipTutorial} />
        )}

        {gameState === 'tutorial-done' && (
          <TutorialDoneView onStartPractice={finishTutorial} />
        )}

        {gameState === 'setup' && (
          <SetupView
            tempo={tempo}
            setTempo={setTempo}
            onStart={startGame}
            onDailyChallenge={startDailyChallenge}
            onReplayTutorial={startTutorial}
            isRandomBPM={isRandomBPM}
            setIsRandomBPM={setIsRandomBPM}
            hasPlayedDaily={hasPlayedDaily}
            showPracticeRecommendation={showPracticeRecommendation}
          />
        )}

        {gameState === 'count-in' && (
          <CountInView 
            tempo={tempo} 
            isRandomBPM={isRandomBPM} 
            isDailyChallenge={isDailyChallenge}
            currentBeat={currentBeatIndex} 
            totalBeats={COUNT_IN_BEATS} 
            onBack={restartGame} 
          />
        )}

        {gameState === 'tap' && (
          <TapPhaseView 
            tempo={tempo} 
            isRandomBPM={isRandomBPM} 
            isDailyChallenge={isDailyChallenge}
            tapCount={tapPhaseBeatCount} 
            totalTaps={TOTAL_TAP_BEATS} 
            onBack={restartGame} 
          />
        )}

        {gameState === 'results' && results && (
          <ResultsView results={results} tempo={tempo} isDailyChallenge={isDailyChallenge} onRestart={startGame} onBack={restartGame} />
        )}
      </div>
    </div>
  );
}

function SetupView({ tempo, setTempo, onStart, onDailyChallenge, onReplayTutorial, isRandomBPM, setIsRandomBPM, hasPlayedDaily, showPracticeRecommendation }: { tempo: number, setTempo: (v: number) => void, onStart: () => void, onDailyChallenge: () => void, onReplayTutorial: () => void, isRandomBPM: boolean, setIsRandomBPM: (v: boolean) => void, hasPlayedDaily: boolean, showPracticeRecommendation: boolean }) {
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
          <div className={`space-y-4 transition-opacity ${isRandomBPM ? "opacity-30 pointer-events-none" : ""}`}>
            <Slider
              value={[tempo]}
              onValueChange={(val) => setTempo(val[0])}
              min={60}
              max={220}
              step={1}
              disabled={isRandomBPM}
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>60</span>
              <span>120</span>
              <span>220</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {showPracticeRecommendation && (
          <p className="text-xs text-neutral-500 text-center">New here? Start with Practice.</p>
        )}
        <Button
          className="w-full h-12 text-base"
          onClick={onStart}
        >
          <Play className="w-4 h-4 mr-2" />
          Practice
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base"
          onClick={onDailyChallenge}
        >
          <Trophy className="w-4 h-4 mr-2" />
          {hasPlayedDaily ? "View Daily Challenge Results" : "Play Daily Challenge"}
        </Button>
        <div className="mt-4 bg-neutral-900 p-4 rounded-lg text-sm text-center text-neutral-400 w-full">
          The conductor gives a four-beat count-in.
          <br />Continue the rhythm for 16 beats after they stop — using Spacebar, Click, or Tap.
        </div>
        <button
          onClick={onReplayTutorial}
          className="text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-2 mt-1"
        >
          Replay Tutorial
        </button>
      </CardFooter>
    </Card>
  );
}

function WelcomeView({ onStartTutorial, onSkip }: { onStartTutorial: () => void, onSkip: () => void }) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl">Keep the Beat Alive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-center text-neutral-300">
        <p>The conductor gives you four beats.</p>
        <p>Then they disappear.</p>
        <p>Continue the rhythm for 16 beats without speeding up or slowing down.</p>
        <p className="text-sm text-neutral-500 pt-2">You'll learn the game in about 20 seconds.</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full h-12 text-base" onClick={onStartTutorial}>
          <Play className="w-4 h-4 mr-2" />
          Start Tutorial
        </Button>
        <Button variant="ghost" className="w-full" onClick={onSkip}>
          Skip
        </Button>
      </CardFooter>
    </Card>
  );
}

function TutorialListenView({ currentBeat, totalBeats, onBack }: { currentBeat: number, totalBeats: number, onBack: () => void }) {
  return (
    <Card className="w-full border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-2 text-neutral-500 hover:text-neutral-200 z-10"
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <CardHeader className="text-center flex flex-col items-center">
        <Badge variant="secondary" className="bg-blue-950 text-blue-400 border-blue-800 mb-2">CONDUCTOR'S COUNT-IN</Badge>
        <CardTitle className="text-2xl">Listen to the conductor.</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex gap-4">
          {Array.from({ length: totalBeats }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full transition-all duration-100 flex items-center justify-center font-bold text-xl
                ${i === currentBeat ? 'bg-blue-500 text-white scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                  i < currentBeat ? 'bg-blue-900 text-blue-300' : 'bg-neutral-800 text-neutral-500'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TutorialTapView({ tapCount, onBack }: { tapCount: number, onBack: () => void }) {
  return (
    <Card className="w-full border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] select-none relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-2 text-neutral-500 hover:text-neutral-200 z-10"
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <CardHeader className="text-center flex flex-col items-center">
        <Badge variant="secondary" className="bg-green-950 text-green-400 border-green-800 mb-2">CONTINUE</Badge>
        <CardTitle className="text-2xl">Now continue the rhythm.</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-neutral-800">
          <div className="absolute inset-0 bg-green-900 rounded-full animate-ping opacity-30" />
          <div className="text-center z-10">
            <div className="text-5xl font-black">{tapCount}</div>
          </div>
        </div>
        <p className="text-center text-sm text-neutral-500">Press Space or Tap Screen on the beat</p>
      </CardContent>
    </Card>
  );
}

function TutorialDoneView({ onStartPractice }: { onStartPractice: () => void }) {
  return (
    <Card className="w-full animate-in fade-in zoom-in duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Nice.</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-neutral-300 space-y-2">
        <p>That's the entire game.</p>
        <p>Now let's try it for real.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full h-12 text-base" onClick={onStartPractice}>
          <Play className="w-4 h-4 mr-2" />
          Start Practice
        </Button>
      </CardFooter>
    </Card>
  );
}

function CountInView({ tempo, isRandomBPM, isDailyChallenge, currentBeat, totalBeats, onBack }: { tempo: number, isRandomBPM: boolean, isDailyChallenge: boolean, currentBeat: number, totalBeats: number, onBack: () => void }) {
  return (
    <Card className="w-full border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-2 top-2 text-neutral-500 hover:text-neutral-200 z-10" 
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <CardHeader className="text-center flex flex-col items-center">
        <Badge variant="secondary" className="bg-blue-950 text-blue-400 border-blue-800 mb-2">LISTEN</Badge>
        <CardTitle className="text-2xl">{isDailyChallenge ? "Daily Challenge" : `${tempo} BPM`}</CardTitle>
        {isRandomBPM && !isDailyChallenge && (
          <Badge variant="outline" className="mt-2 text-[10px] border-neutral-700 text-neutral-400 tracking-widest uppercase">Random Mode</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex gap-4">
          {Array.from({ length: totalBeats }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full transition-all duration-100 flex items-center justify-center font-bold text-xl
                ${i === currentBeat ? 'bg-blue-500 text-white scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                  i < currentBeat ? 'bg-blue-900 text-blue-300' : 'bg-neutral-800 text-neutral-500'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TapPhaseView({ tempo, isRandomBPM, isDailyChallenge, tapCount, totalTaps, onBack }: { tempo: number, isRandomBPM: boolean, isDailyChallenge: boolean, tapCount: number, totalTaps: number, onBack: () => void }) {
  const progress = Math.min(100, (tapCount / totalTaps) * 100);

  return (
    <Card className="w-full border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] select-none relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-2 top-2 text-neutral-500 hover:text-neutral-200 z-10" 
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <CardHeader className="text-center flex flex-col items-center">
        <Badge variant="secondary" className="bg-green-950 text-green-400 border-green-800 mb-2">TAP NOW</Badge>
        <CardTitle className="text-2xl">{isDailyChallenge ? "Daily Challenge" : `${tempo} BPM`}</CardTitle>
        {isRandomBPM && !isDailyChallenge && (
          <Badge variant="outline" className="mt-2 text-[10px] border-neutral-700 text-neutral-400 tracking-widest uppercase">Random Mode</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-neutral-800">
          <div className="absolute inset-0 bg-green-900 rounded-full animate-ping opacity-30" />
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

function ResultsView({ results, tempo, isDailyChallenge, onRestart, onBack }: { results: GameResults, tempo: number, isDailyChallenge: boolean, onRestart: () => void, onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [shareTextPreview, setShareTextPreview] = useState<string | null>(null);

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

  const handleShare = () => {
    const dayNum = getDailyEpochDay();
    let grid = "";
    results.taps.forEach((tap, index) => {
      if (tap.score === 100) grid += "🟩";
      else if (tap.score === 80) grid += "🟨";
      else if (tap.score === 50) grid += "🟧";
      else if (tap.score === 20) grid += "🟥";
      else grid += "⬛";
      
      if ((index + 1) % 8 === 0 && index !== results.taps.length - 1) {
        grid += "\n";
      }
    });
    
    let niceLabel = tendency.label;
    if (niceLabel === 'ON BEAT') niceLabel = 'In the Pocket';
    if (niceLabel === 'RUSHING') niceLabel = 'Rushing';
    if (niceLabel === 'DRAGGING') niceLabel = 'Dragging';

    const url = "https://whip-lash.vercel.app/";
    const text = `Whip-lash | Day ${dayNum} | I was ${niceLabel}\n${grid}\nAvg Error: ${results.averageError}ms\nTest your skill @ ${url}`;
    navigator.clipboard.writeText(text);
    
    setShareTextPreview(text);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
      setShareTextPreview(null);
    }, 4000);
  };

  // Safari-safe dot and box colors: use solid bg colors instead of alpha channels
  const getDotColor = (score: number) => {
    if (score === 100) return 'bg-green-500';
    if (score === 80) return 'bg-yellow-400';
    if (score === 50) return 'bg-orange-500';
    if (score === 20) return 'bg-red-500';
    return 'bg-neutral-600';
  };

  const getBoxColor = (score: number) => {
    if (score === 100) return 'text-green-500 bg-green-950';
    if (score === 80) return 'text-yellow-400 bg-yellow-950';
    if (score === 50) return 'text-orange-500 bg-orange-950';
    if (score === 20) return 'text-red-500 bg-red-950';
    return 'text-neutral-400 bg-neutral-900';
  };

  return (
    <>
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
            {isDailyChallenge && (
              <Badge className="mt-2 w-fit bg-amber-950 text-amber-400 border-amber-800">DAILY CHALLENGE</Badge>
            )}
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

            <div className="h-[1px] bg-neutral-800 w-full my-3"></div>

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

            <div className="h-[1px] bg-neutral-800 w-full my-3"></div>

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
          {/* Timing visualizer: solid dark bg instead of translucent muted */}
          <div className="w-full flex justify-center py-4 bg-neutral-900 rounded-xl overflow-hidden">
            <div className="relative w-[164px]">
              {/* The vertical true timeline track */}
              <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-neutral-700"></div>

              {results.taps.map((tap, i) => {
                const maxVisualError = 150;
                const maxPx = 18; // Max offset in pixels
                let offsetPx = (tap.errorMs / maxVisualError) * maxPx;

                if (offsetPx > maxPx) offsetPx = maxPx;
                if (offsetPx < -maxPx) offsetPx = -maxPx;

                const dotColor = getDotColor(tap.score);
                const boxColor = getBoxColor(tap.score);

                const errorMsRounded = Math.round(tap.errorMs);
                const diffStr = errorMsRounded > 0 ? `+${errorMsRounded}ms` : `${errorMsRounded}ms`;
                const isBest = results.bestTap && tap.timestamp === results.bestTap.timestamp;

                return (
                  <div key={i} className="relative h-12 w-full">
                    {/* True beat indicator */}
                    <div className="absolute left-[-1px] top-[50%] mt-[-1px] w-4 h-0.5 bg-neutral-600 z-0"></div>

                    {/* User Tap Marker */}
                    <div
                      className="absolute left-[1px] flex items-center"
                      style={{ top: `calc(50% + ${offsetPx}px)`, transform: 'translateY(-50%)', zIndex: 10 }}
                    >
                      <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`}></div>

                      {/* Score Box */}
                      <div className="ml-5">
                        <div
                          className={`flex flex-row items-center gap-3 px-3 py-1.5 rounded-md relative ${boxColor} w-[100px]`}
                          title={`Error: ${errorMsRounded}ms`}
                        >
                          {isBest && <span className="absolute -top-2 -right-2 text-xs">⭐</span>}
                          <span className="text-[10px] font-medium text-neutral-500 w-4">#{i + 1}</span>
                          <span className="text-[10px] font-medium flex-1 text-right">{diffStr}</span>
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
      <CardFooter className="flex gap-3">
        <Button variant="outline" className="flex-1 h-12" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Menu
        </Button>
        {!isDailyChallenge && (
          <Button className="flex-1 h-12" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {isDailyChallenge && (
          <Button 
            className={`flex-1 h-12 text-white transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`} 
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Share"}
          </Button>
        )}
      </CardFooter>
    </Card>
    
    {shareTextPreview && (
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-sm px-4">
        <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
            <Share2 className="w-4 h-4" />
            Copied to clipboard
          </div>
          <pre className="text-[10px] text-neutral-400 whitespace-pre-wrap font-sans bg-neutral-950 p-3 rounded-lg leading-relaxed">
            {shareTextPreview}
          </pre>
        </div>
      </div>
    )}
    </>
  );
}
