import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Sun, Moon, Bell, LogOut, Code2, Flame, Crown
} from 'lucide-react';

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Students', path: '/students' },
    { name: 'Batches', path: '/batches' },
    { name: 'Courses', path: '/courses' },
    { name: 'Assessments', path: '/tests' },
  ];

  const studentNavItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Browse Courses', path: '/catalog' },
    { name: 'My Courses', path: '/courses' },
    { name: 'Assessments', path: '/tests' },
    { name: 'Results', path: '/reports' },
  ];
  
  const publicNavItems = [
    { name: 'Home', path: '/' },
    // { name: 'Features', path: '/features' },
    // { name: 'Pricing', path: '/pricing' },
  ];

  const navItems = user ? (user.role === 'ADMIN' ? adminNavItems : studentNavItems) : publicNavItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/  95 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-14">
          
          {/* Left Side: Logo & Compact Links */}
          <div className="flex items-center gap-6">
            {/* Logo Brand */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] rounded">
              <Code2 className="h-6 w-6 text-[var(--color-primary)]" />
              <span className="font-bold text-lg tracking-tight text-[var(--color-text)] hidden sm:block">
                StudyHub
              </span>
            </Link>

            {/* Desktop Navigation Links  */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-4 text-[13px] font-medium transition-colors border-b-2
                    ${isActive
                      ? `border-[var(--color-text)] text-[var(--color-text)]`
                      : `border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]`
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Side: Tools & Actions */}
          <div className="hidden md:flex items-center space-x-3 h-full">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors focus:outline-none"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {user ? (
              <>
                
                {/* Minimal Profile Avatar */}
                <div className="flex items-center gap-4 pl-3 ml-1 border-l border-[var(--color-border)] group relative">
                  <Link to="/profile" className="h-8 w-8 rounded-full border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-text)] transition-colors focus:outline-none cursor-pointer">
                     <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="Profile" className="w-full h-full object-cover" />
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Public / Unauthenticated Actions */
              <div className="hidden lg:flex items-center gap-4">
                <Link to="/login" className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus:outline-none">Log in</Link>
                <Link to="/login" className="text-[13px] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors px-4 py-1.5 rounded-md focus:outline-none">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && (
               <Link to="/login" className="text-sm font-medium text-[var(--color-text)]">Sign in</Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] animate-in slide-in-from-top-1">
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? `bg-[var(--color-bg)] text-[var(--color-text)] font-semibold`
                    : `text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]`
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-4 pb-4 border-t border-[var(--color-border)] px-4">
             {user ? (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                     <div className="h-9 w-9 rounded overflow-hidden border border-[var(--color-border)]">
                        <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="Profile" />
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-[var(--color-text)]">{user.name}</div>
                       <div className="text-xs text-[var(--color-text-muted)]">{user.email}</div>
                     </div>
                   </Link>
                   <button onClick={toggleTheme} className="p-2 rounded-md bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                     {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                   </button>
                 </div>
                 <div className="flex justify-between items-center bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)]">
                    <div className="flex gap-4">
                       <span className="text-xs font-semibold text-[var(--color-text-muted)]">Signed in as {user.role}</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => { handleLogout(); setIsOpen(false); }}
                   className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-red-500/10 text-red-500 font-medium text-sm hover:bg-red-500 hover:text-white transition-colors"
                 >
                   <LogOut className="w-[18px] h-[18px]" /> Sign Out
                 </button>
               </div>
             ) : (
               <div className="flex flex-col gap-2">
                 <button onClick={toggleTheme} className="self-end mb-2 p-2 rounded-md bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                   {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                 </button>
                 <div className="mt-8 space-y-3 pb-6 border-b border-[var(--color-border)]">
                 <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 rounded border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-border)]">Log in</Link>
                 <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 rounded bg-[var(--color-primary)] text-sm font-medium text-white">Get Started</Link>
              </div>
               </div>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}
