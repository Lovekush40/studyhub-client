import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Signup() {
  const { user, signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-primary)]/20 to-emerald-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[var(--color-bg-alt)]/80 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl animate-in zoom-in-95 duration-500 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-emerald-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">Join StudyHub</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center">
            Register your institute account securely.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setError('');
              await signup(name, email, password);
            } catch (err) {
              setError(err.message || 'Signup failed');
            }
          }}
        >
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 rounded-lg border p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 rounded-lg border p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 rounded-lg border p-2 bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-primary)] text-white font-semibold shadow-sm hover:brightness-110 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-[var(--color-text)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">Log in</Link>
        </div>

        <div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
