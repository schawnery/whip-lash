import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-950 text-neutral-50 flex flex-col">
      <header className="w-full border-b border-neutral-900/50">
        <div className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold italic tracking-tighter text-neutral-50 hover:text-neutral-300 transition-colors">
            Whip Lash
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto">
        <Outlet />
      </main>
      
      <footer className="py-6 px-4 border-t border-neutral-900 bg-neutral-950">
        <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] text-neutral-500 sm:text-xs">
          <span>&copy; 2026 Whip Lash</span>
          <Link to="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
          <Link to="/accessibility" className="hover:text-neutral-300 transition-colors">Accessibility</Link>
          <Link to="/contact" className="hover:text-neutral-300 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
