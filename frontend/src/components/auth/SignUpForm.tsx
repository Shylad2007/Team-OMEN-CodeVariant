import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PasswordField } from './PasswordField';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isConfigured } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setConfirmationNotice(null);

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
      const result = await signUp(email, password, fullName);

      if (result.error) {
        if (result.error.message?.toLowerCase().includes('already registered')) {
          setFormError('An account with this email address already exists. Please sign in instead.');
        } else {
          setFormError(result.error.message || 'Registration failed. Please check your details.');
        }
      } else if (result.needsEmailConfirmation) {
        setConfirmationNotice(
          `A verification link has been sent to ${email}. Please check your email to activate your account before logging in.`
        );
      } else {
        // Immediate session created -> navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred during registration.');
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

      {/* Email Confirmation Notice Banner */}
      {confirmationNotice && (
        <div className="auth-alert-success" role="status">
          <Mail className="w-5 h-5 text-[#10B25A] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5">Verification Email Sent</strong>
            <span>{confirmationNotice}</span>
            <div className="mt-3">
              <Link to="/login" className="retro-btn text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5">
                Go to Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Error Banner */}
      {formError && (
        <div className="auth-alert-error" role="alert">
          <AlertCircle className="w-5 h-5 text-[#FF3344] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5">Registration Error</strong>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name Field */}
        <div className="mb-4">
          <label htmlFor="signup-name" className="auth-label">
            Full Name <span className="text-[#FF3344]">*</span>
          </label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            placeholder="Jane Doe"
            disabled={loading}
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? 'signup-name-error' : undefined}
            className={`auth-input ${fieldErrors.fullName ? 'has-error' : ''}`}
          />
          {fieldErrors.fullName && (
            <p id="signup-name-error" className="auth-error-msg" role="alert">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="signup-email" className="auth-label">
            Email Address <span className="text-[#FF3344]">*</span>
          </label>
          <input
            id="signup-email"
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
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
          />
          {fieldErrors.email && (
            <p id="signup-email-error" className="auth-error-msg" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordField
          id="signup-password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          placeholder="At least 6 characters"
          error={fieldErrors.password}
          disabled={loading}
          autoComplete="new-password"
        />

        {/* Confirm Password Field */}
        <PasswordField
          id="signup-confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
          disabled={loading}
          autoComplete="new-password"
        />

        {/* Password Requirements hint */}
        <div className="mb-6 p-2.5 bg-[#F4EFE2] border border-[#0B0B0B] font-mono text-[11px] text-[#6C6659] space-y-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${password.length >= 6 ? 'text-[#10B25A]' : 'text-gray-400'}`} />
            <span>Minimum 6 characters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${password && password === confirmPassword ? 'text-[#10B25A]' : 'text-gray-400'}`} />
            <span>Passwords must match</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Link to Login */}
      <div className="mt-6 pt-5 border-t border-[#0B0B0B]/20 text-center font-mono text-xs">
        <span className="text-[#6C6659]">Already have an account? </span>
        <Link
          to="/login"
          className="font-bold text-[#0B0B0B] underline hover:text-[#2A5BFF] transition-colors ml-1"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
