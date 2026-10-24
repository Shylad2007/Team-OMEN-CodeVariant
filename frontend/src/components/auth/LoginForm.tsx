import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PasswordField } from './PasswordField';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isConfigured } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    if (!isConfigured) {
      setFormError(
        'Supabase is not configured yet. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend .env file.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setFormError(
            'Your account was created, but your email has not been confirmed yet. Please check your inbox for the confirmation link from Supabase, or confirm your user in the Supabase Dashboard.'
          );
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setFormError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setFormError(error.message || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        // Successful login -> redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Configuration Advisory if unconfigured */}
      {!isConfigured && (
        <div className="auth-alert-warning" role="alert">
          <AlertCircle className="w-5 h-5 text-[#0B0B0B] shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block font-bold">Supabase Setup Required</strong>
            <span>
              Authentication requires connecting your Supabase project. Add your{' '}
              <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
              <code>frontend/.env</code>.
            </span>
          </div>
        </div>
      )}

      {/* Main Error Banner */}
      {formError && (
        <div className="auth-alert-error" role="alert">
          <AlertCircle className="w-5 h-5 text-[#FF3344] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5">Authentication Error</strong>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="login-email" className="auth-label">
            Email Address <span className="text-[#FF3344]">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="you@example.com"
            disabled={loading}
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="auth-error-msg" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          placeholder="••••••••"
          error={fieldErrors.password}
          disabled={loading}
          autoComplete="current-password"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-btn-primary mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to R3VIVE</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Link to Sign-Up */}
      <div className="mt-6 pt-5 border-t border-[#0B0B0B]/20 text-center font-mono text-xs">
        <span className="text-[#6C6659]">Don't have an account? </span>
        <Link
          to="/signup"
          className="font-bold text-[#0B0B0B] underline hover:text-[#2A5BFF] transition-colors ml-1"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
