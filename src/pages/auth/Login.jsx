import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const { user, loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  // Handle OAuth Redirection (Token and Error)
  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (token) {
      try {
        loginWithToken(token);
      } catch (err) {
        setError('Integration failed. Please try again.');
      }
    } else if (errorParam) {
      const errorMap = {
        'email_not_verified': 'Google email is not verified. Please verify your email first.',
        'unauthorized_email': 'Your email is not authorized for this platform.',
        'authentication_failed': 'Authentication failed. Please try again.',
        'session_expired': 'Your session expired. Please sign in again with Google.'
      };
      setError(errorMap[errorParam] || 'Authentication failed. Please try again.');
    }
  }, [searchParams, loginWithToken]);

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    window.location.href = `${API_URL}/auth/google`;
  };

  if (user) {
    // Force navigation
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-primary)]/20 to-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[var(--color-bg-alt)]/80 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl animate-in zoom-in-95 duration-500 relative">
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">Welcome to StudyHub</h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
            Securely access your personalized dashboard and academic resources using your Google account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg)]/80 text-[var(--color-text)] font-semibold shadow-sm transition-all hover:border-[var(--color-primary)]/50 hover:shadow-md focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          By signing in, you agree to our Terms of Service and Privacy Policy. <br />
          Only verified student and administrative accounts are permitted.
        </div>
      </div>
    </div>
  );
}
