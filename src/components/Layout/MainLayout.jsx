import { Outlet } from 'react-router-dom';
import TopNavigation from './TopNavigation';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] font-sans antialiased selection:bg-[var(--color-primary)] selection:text-white">
      <TopNavigation />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        <div className="animate-in fade-in duration-500 w-full h-full">
          <Outlet />
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="w-full py-4 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] mt-auto bg-[var(--color-bg-alt)]/50">
        <p>&copy; {new Date().getFullYear()} StudyHub Institute. All rights reserved.</p>
      </footer>
    </div>
  );
}
