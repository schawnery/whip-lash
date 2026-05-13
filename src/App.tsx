import { useEffect } from 'react';
import GameScreen from './features/game/GameScreen';

function App() {
  useEffect(() => {
    // Force dark mode at the document level for consistent Safari rendering
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return (
    <main className="min-h-screen min-h-[100dvh] bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <GameScreen />
    </main>
  );
}

export default App;
