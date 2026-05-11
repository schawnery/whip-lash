import { useEffect } from 'react';
import GameScreen from './features/game/GameScreen';

function App() {
  useEffect(() => {
    // Force dark mode at the document level for consistent Safari rendering
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <GameScreen />
    </main>
  );
}

export default App;
