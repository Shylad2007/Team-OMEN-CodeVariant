import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive,
  Plus,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  Sliders,
  LogOut,
  ListChecks,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listUserAssessments, deleteAssessment, type AssessmentSummaryItem } from '../../services/assessmentApi';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { session, user, signIn, signUp, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<AssessmentSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  // Inline auth state for unauthenticated users
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const fetchAssessments = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      setAssessments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await listUserAssessments(session.access_token);
      setAssessments(items);
    } catch (err: any) {
      console.error('Failed to load user assessments:', err);
      if (err.message?.includes('schema cache') || err.message?.includes('not found')) {
        setAssessments([]);
      } else {
        setError(err.message || 'Failed to retrieve assessment records.');
      }
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleDelete = async (id: string, itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete the assessment for "${itemName}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAssessment(id, session?.access_token || '');
      setAssessments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`Failed to delete assessment: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setAssessments([]);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signin') {
        const { error: signInErr } = await signIn(authEmail, authPassword);
        if (signInErr) throw signInErr;
      } else {
        const { error: signUpErr, needsEmailConfirmation } = await signUp(authEmail, authPassword, authName);
        if (signUpErr) throw signUpErr;
        if (needsEmailConfirmation) {
          setAuthSuccess('Confirmation email sent! Please verify your email before signing in.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null;
    const lower = outcome.toLowerCase();
    let bg = 'bg-[#FFE600] text-[#0B0B0B]';
    if (lower.includes('repair')) bg = 'bg-[#FFE600] text-[#0B0B0B]';
    else if (lower.includes('reuse')) bg = 'bg-[#10B25A] text-[#FFFDF5]';
    else if (lower.includes('repurpose')) bg = 'bg-[#2A5BFF] text-[#FFFDF5]';
    else if (lower.includes('replace')) bg = 'bg-[#FF6B00] text-[#FFFDF5]';
    else if (lower.includes('recycle') || lower.includes('discard')) bg = 'bg-[#8E24AA] text-[#FFFDF5]';

    return (
      <span className={`px-2 py-0.5 border border-[#0B0B0B] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#0B0B0B] ${bg}`}>
        {outcome}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const completedPlans = assessments.filter((item) => item.is_completed || item.current_step >= 5);

  return (
    <div className="min-h-screen bg-[#F4EFE2] text-[#0B0B0B] font-sans selection:bg-[#FFE600] selection:text-[#0B0B0B]">
      {/* Top Navbar */}
      <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-xl group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                R3
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter font-display leading-none text-[#0B0B0B]">
                  R3VIVE
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#6C6659] uppercase font-bold mt-0.5">
                  Rethink • Repair • Reimagine
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold">
            <a
              href="#decisions"
              className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
            >
              My Decisions
            </a>
            <a
              href="#action-plans"
              className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
            >
              Action Plans
            </a>
            <a
              href="#pathways"
              className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
            >
              5 Outcomes
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="retro-btn retro-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold"
                title="Sign out of this session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/assess"
                className="retro-btn text-xs py-2 px-4 flex items-center gap-2 font-mono font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Assessment</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        {/* Welcome Banner */}
        <div className="dashboard-card bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 bg-[#FFE600] border border-[#0B0B0B]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
                  Circular Decision Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#0B0B0B] tracking-tight">
                Assessment History & Decision Tracking
              </h1>
              <p className="font-sans text-sm text-[#544E43] mt-2 max-w-2xl leading-relaxed">
                Review verified multi-criteria diagnostics, resume assessments in progress, track action plan
                progress, and manage your circular lifecycle decisions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-none">
              <Link
                to="/assess"
                className="retro-btn text-xs sm:text-sm py-2.5 px-5 font-mono font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Assessment</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Unauthenticated Invitation & Inline Auth */}
        {!user && (
          <div className="dashboard-card dashboard-bracket p-6 sm:p-10 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B]">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center mx-auto mb-3">
                  <Archive className="w-6 h-6 text-[#0B0B0B]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-[#0B0B0B]">
                  {authMode === 'signin' ? 'Sign In to View History' : 'Create an Account'}
                </h2>
                <p className="font-sans text-xs text-[#544E43] mt-1">
                  Authenticate to access saved diagnostic reports and maintain action plans across sessions.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex border-2 border-[#0B0B0B] mb-5 font-mono text-xs font-bold shadow-[2px_2px_0px_#0B0B0B]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-center transition-colors ${
                    authMode === 'signin' ? 'bg-[#FFE600] text-[#0B0B0B]' : 'bg-[#FFFDF5] text-[#6C6659] hover:bg-[#F4EFE2]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-center border-l-2 border-[#0B0B0B] transition-colors ${
                    authMode === 'signup' ? 'bg-[#FFE600] text-[#0B0B0B]' : 'bg-[#FFFDF5] text-[#6C6659] hover:bg-[#F4EFE2]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Feedback */}
              {authError && (
                <div className="p-3 bg-[#FFF5F5] border-2 border-[#DC2626] font-mono text-xs text-[#DC2626] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-[#F0FDF4] border-2 border-[#16A34A] font-mono text-xs text-[#16A34A] mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 flex-none" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-xs">
                {authMode === 'signup' && (
                  <div>
                    <label className="block font-bold mb-1 uppercase text-[#0B0B0B]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 bg-[#F4EFE2] border-2 border-[#0B0B0B] text-xs focus:bg-white outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold mb-1 uppercase text-[#0B0B0B]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2.5 bg-[#F4EFE2] border-2 border-[#0B0B0B] text-xs focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase text-[#0B0B0B]">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-[#F4EFE2] border-2 border-[#0B0B0B] text-xs focus:bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full retro-btn text-xs py-2.5 mt-2 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                >
                  {authLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </button>
              </form>

              {!isConfigured && (
                <p className="mt-4 text-[11px] font-mono text-[#D97706] text-center">
                  Notice: Supabase environment credentials not detected. Guest assessments can be taken below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Section: My Decisions (Saved Assessment History) */}
        <section id="decisions" className="scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 bg-[#2A5BFF] border border-[#0B0B0B]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
                  Historical Record Vault
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
                My Decisions
              </h2>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAssessments}
                  disabled={loading}
                  className="p-1.5 border border-[#0B0B0B] bg-[#FFFDF5] hover:bg-[#FFE600] transition-colors shadow-[1px_1px_0px_#0B0B0B] text-[#0B0B0B] disabled:opacity-50 flex items-center gap-1.5 font-mono text-xs font-bold"
                  title="Refresh decision records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            )}
          </div>

          {/* Loading Skeleton State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="dashboard-card p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 bg-[#E0D9C8]" />
                    <div className="w-16 h-4 bg-[#E0D9C8]" />
                  </div>
                  <div className="w-3/4 h-6 bg-[#E0D9C8]" />
                  <div className="w-1/2 h-3 bg-[#E0D9C8]" />
                  <div className="w-full h-8 bg-[#E0D9C8] mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="dashboard-card p-6 bg-[#FFFDF5] border-2 border-[#DC2626] shadow-[4px_4px_0px_#DC2626] space-y-3">
              <div className="flex items-center gap-2 text-[#DC2626] font-bold font-mono text-sm">
                <AlertCircle className="w-5 h-5 flex-none" />
                <span>Failed to sync decision records</span>
              </div>
              <p className="font-mono text-xs text-[#544E43]">{error}</p>
              <button
                onClick={fetchAssessments}
                className="retro-btn text-xs py-1.5 px-3 font-mono font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Sync</span>
              </button>
            </div>
          )}

          {/* Authenticated with Empty Records */}
          {!loading && !error && user && assessments.length === 0 && (
            <div className="dashboard-card dashboard-bracket p-8 sm:p-12 text-center bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B]">
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center justify-center mb-5">
                  <Archive className="w-8 h-8 text-[#0B0B0B]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-[#0B0B0B] mb-2">
                  No Saved Decisions Yet
                </h3>
                <p className="font-sans text-sm text-[#544E43] leading-relaxed mb-6">
                  You haven't evaluated any items yet. When you complete an assessment, your diagnostic report,
                  selected outcome, and execution checklist will be archived here.
                </p>
                <Link
                  to="/assess"
                  className="retro-btn text-xs sm:text-sm py-2.5 px-5 font-mono font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assess Your First Item</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Populated Saved Decisions Grid */}
          {!loading && !error && assessments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assessments.map((item) => {
                const activeOutcome = item.selected_outcome || item.recommended_outcome;

                return (
                  <div
                    key={item.id}
                    className="dashboard-card bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] hover:shadow-[6px_6px_0px_#0B0B0B] transition-shadow p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] font-mono text-[10px] font-bold uppercase text-[#0B0B0B]">
                            {item.category}
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#6C6659] font-mono text-[10px] text-[#6C6659] uppercase">
                            {item.condition?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {getOutcomeBadge(activeOutcome)}
                      </div>

                      {/* Item Name & Details */}
                      <h4 className="font-display font-black text-lg text-[#0B0B0B] leading-tight mb-1 group-hover:text-[#2A5BFF] transition-colors line-clamp-1">
                        {item.item_name}
                      </h4>
                      {item.brand_model && (
                        <p className="font-mono text-xs text-[#6C6659] mb-3 line-clamp-1">
                          {item.brand_model}
                        </p>
                      )}

                      {/* Status Indicator */}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#544E43] my-3 pt-2 border-t border-[#E0D9C8]">
                        {item.is_completed ? (
                          <span className="inline-flex items-center gap-1 text-[#15803D] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Matrix Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#D97706] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Stage 0{item.current_step} In Progress</span>
                          </span>
                        )}
                        <span className="text-[#A59F92]">•</span>
                        <span>{formatDate(item.updated_at)}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 mt-2 border-t-2 border-[#0B0B0B] space-y-2">
                      {item.is_completed ? (
                        <>
                          {/* Primary Action Button */}
                          <Link
                            to={`/assess/action-plan?id=${item.id}`}
                            className="w-full assessment-nav-btn bg-[#FFE600] text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600] text-xs py-2 px-3 shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center gap-1.5 font-mono font-bold transition-all text-center"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Action Plan</span>
                          </Link>

                          {/* Secondary Actions Toolbar */}
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/assess/decision-tree?id=${item.id}`}
                              className="flex-1 py-1.5 px-2 bg-[#FFFDF5] hover:bg-[#FFE600] border border-[#0B0B0B] text-center font-mono text-[11px] font-bold text-[#0B0B0B] shadow-[1px_1px_0px_#0B0B0B] transition-colors"
                              title="Inspect Decision Matrix"
                            >
                              Matrix
                            </Link>

                            <Link
                              to={`/assess/comparator?id=${item.id}`}
                              className="flex-1 py-1.5 px-2 bg-[#FFFDF5] hover:bg-[#FFE600] border border-[#0B0B0B] text-center font-mono text-[11px] font-bold text-[#0B0B0B] shadow-[1px_1px_0px_#0B0B0B] transition-colors flex items-center justify-center gap-1"
                              title="Compare Repair vs Replace"
                            >
                              <Sliders className="w-3 h-3 text-[#2A5BFF]" />
                              <span>Compare</span>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id, item.item_name, e)}
                              disabled={deletingId === item.id}
                              className="p-1.5 bg-[#FFFDF5] hover:bg-[#FFE5E5] border border-[#0B0B0B] text-[#DC2626] shadow-[1px_1px_0px_#0B0B0B] transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="Delete assessment record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/assess?id=${item.id}`}
                            className="flex-1 assessment-nav-btn bg-[#FFE600] text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600] text-xs py-2 px-3 shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center gap-1.5 font-mono font-bold"
                          >
                            <span>Resume</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, item.item_name, e)}
                            disabled={deletingId === item.id}
                            className="p-2 bg-[#FFFDF5] hover:bg-[#FFE5E5] border-2 border-[#0B0B0B] text-[#DC2626] shadow-[2px_2px_0px_#0B0B0B] transition-colors disabled:opacity-50 flex items-center justify-center"
                            title="Delete assessment record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section: Action Plans (Execution Roadmaps) */}
        <section id="action-plans" className="scroll-mt-24">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#10B25A] border border-[#0B0B0B]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
                Execution Roadmaps
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
              Action Plans
            </h2>
          </div>

          {!loading && completedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedPlans.map((plan) => {
                const outcome = (plan.selected_outcome || plan.recommended_outcome || 'repair').toUpperCase();
                return (
                  <div
                    key={plan.id}
                    className="dashboard-card bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#0B0B0B]">
                          {outcome}
                        </span>
                        <span className="font-mono text-[10px] text-[#6C6659] uppercase">
                          {plan.category}
                        </span>
                      </div>

                      <h3 className="font-display font-black text-lg text-[#0B0B0B] mb-1 line-clamp-1">
                        {plan.item_name}
                      </h3>

                      <p className="font-mono text-xs text-[#544E43] mb-4">
                        Condition: {plan.condition?.replace(/_/g, ' ')}
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-[#0B0B0B] flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#15803D] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Roadmap Ready</span>
                      </span>

                      <Link
                        to={`/assess/action-plan?id=${plan.id}`}
                        className="assessment-nav-btn text-xs py-1.5 px-3 shadow-[2px_2px_0px_#0B0B0B] flex items-center gap-1 font-mono font-bold bg-[#FFE600] text-[#0B0B0B]"
                      >
                        <span>View Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-card dashboard-bracket p-8 sm:p-12 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B]">
              <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center justify-center mb-5">
                  <ListChecks className="w-8 h-8 text-[#0B0B0B]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-[#0B0B0B] mb-2">
                  No Active Action Plans
                </h3>
                <p className="font-sans text-sm text-[#544E43] leading-relaxed mb-6 max-w-lg">
                  Action plans bridge the gap between deciding and doing. When you complete an assessment,
                  R3VIVE generates an ordered checklist with tools, safety notes, and waste tracking.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Section: 5 Circular Outcomes Reference */}
        <section id="pathways" className="scroll-mt-24 pt-4 border-t-2 border-[#0B0B0B]">
          <div className="mb-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659] block mb-1">
              Decision Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
              The 5 Circular Pathways
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 font-mono text-xs">
            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
              <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-black uppercase text-[10px] inline-block mb-2">
                01. Repair
              </span>
              <p className="font-sans text-xs text-[#544E43]">
                Restore functionality via modular component replacement, soldering, or localized fixes.
              </p>
            </div>

            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
              <span className="px-2 py-0.5 bg-[#10B25A] text-white border border-[#0B0B0B] font-black uppercase text-[10px] inline-block mb-2">
                02. Reuse
              </span>
              <p className="font-sans text-xs text-[#544E43]">
                Redeploy functional assets internally, donate to local initiatives, or secondary market resale.
              </p>
            </div>

            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
              <span className="px-2 py-0.5 bg-[#2A5BFF] text-white border border-[#0B0B0B] font-black uppercase text-[10px] inline-block mb-2">
                03. Repurpose
              </span>
              <p className="font-sans text-xs text-[#544E43]">
                Transform obsolete equipment or enclosures into homelab servers, fixtures, or learning kits.
              </p>
            </div>

            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
              <span className="px-2 py-0.5 bg-[#FF6B00] text-white border border-[#0B0B0B] font-black uppercase text-[10px] inline-block mb-2">
                04. Replace
              </span>
              <p className="font-sans text-xs text-[#544E43]">
                Acquire energy-efficient, right-to-repair certified alternatives when repair exceeds realistic bounds.
              </p>
            </div>

            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
              <span className="px-2 py-0.5 bg-[#8E24AA] text-white border border-[#0B0B0B] font-black uppercase text-[10px] inline-block mb-2">
                05. Recycle
              </span>
              <p className="font-sans text-xs text-[#544E43]">
                Direct to certified e-waste processors for material reclamation when safety hazards dictate.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center font-mono text-[11px] text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5] mt-12">
        <span>R3VIVE Circular Decision Engine • Persistent Decision Vault & History</span>
      </footer>
    </div>
  );
};
