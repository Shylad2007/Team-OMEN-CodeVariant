import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export const SignUp: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const isCallbackInFlight =
    typeof window !== 'undefined' &&
    (window.location.search.includes('code=') ||
      window.location.hash.includes('access_token='));

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (isCallbackInFlight && loading) {
    return (
      <div className="auth-page items-center justify-center retro-grid-pattern">
        <div className="retro-box p-6 flex items-center gap-3 font-mono text-sm font-bold bg-[#FFFDF5]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B0B0B]" />
          <span>Completing authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page px-4 py-8 sm:py-12 retro-grid-pattern">
      {/* Top Header / Return Link */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors p-2 bg-[#FFFDF5] border border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to R3VIVE</span>
        </Link>
      </div>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center">
        <div className="auth-card auth-bracket p-6 sm:p-8">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
              <div className="w-9 h-9 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-lg group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                R3
              </div>
              <span className="font-black text-2xl tracking-tighter font-display text-[#0B0B0B]">
                R3VIVE
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B] mb-1">
              Create Account
            </h1>
            <p className="font-mono text-xs text-[#6C6659] uppercase font-bold tracking-wider">
              Rethink • Repair • Reimagine
            </p>
          </div>

          {/* Form */}
          <SignUpForm />

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="mt-8 text-center font-mono text-xs text-[#6C6659]">
        <span>Protected by Supabase Auth</span>
      </footer>
    </div>
  );
};
