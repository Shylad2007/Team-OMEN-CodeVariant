import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters returned from auth provider
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const errorDescription =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error');

      if (errorDescription) {
        setErrorMsg(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
        return;
      }
    }

    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        // If loading completed with no user and no error params, redirect to login
        const timer = setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="auth-page items-center justify-center p-4 retro-grid-pattern">
      <div className="auth-card auth-bracket p-8 max-w-md w-full text-center">
        {errorMsg ? (
          <div className="space-y-4">
            <div className="auth-alert-error text-left">
              <AlertCircle className="w-5 h-5 text-[#FF3344] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block font-bold mb-0.5">Authentication Failed</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
            <Link
              to="/login"
              className="retro-btn w-full py-2.5 px-4 font-bold flex items-center justify-center gap-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-xl mx-auto mb-2">
              R3
            </div>
            <div className="flex items-center justify-center gap-2 font-mono text-sm font-bold text-[#0B0B0B]">
              <Loader2 className="w-5 h-5 animate-spin text-[#0B0B0B]" />
              <span>Completing authentication...</span>
            </div>
            <p className="font-mono text-xs text-[#6C6659]">
              Please wait while your session is securely confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
