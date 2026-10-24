import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Plus, ArrowUpRight, Trash2, RefreshCw, AlertCircle, Sparkles, Clock, CheckCircle2, Sliders } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listUserAssessments, deleteAssessment, type AssessmentSummaryItem } from '../../services/assessmentApi';

export const MyDecisionsSection: React.FC = () => {
  const { session, user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      // If table doesn't exist yet, we keep assessments empty rather than showing broken UI
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

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null;
    const lower = outcome.toLowerCase();
    let bg = 'bg-[#FFE600] text-[#0B0B0B]'; // Default yellow
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

  return (
    <section id="decisions" className="mb-12 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#2A5BFF] border border-[#0B0B0B]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
              Persistent Decision Vault
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
            My Decisions
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={fetchAssessments}
              disabled={loading}
              className="p-1.5 border border-[#0B0B0B] bg-[#FFFDF5] hover:bg-[#FFE600] transition-colors shadow-[1px_1px_0px_#0B0B0B] text-[#0B0B0B] disabled:opacity-50"
              title="Refresh decisions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <Link
            to="/assess"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 px-2 border-b-2 border-[#0B0B0B] hover:border-[#2A5BFF] w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Assessment</span>
          </Link>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Unauthenticated Invitation State */}
      {!loading && !error && !user && (
        <div className="dashboard-card dashboard-bracket p-8 sm:p-10 text-center bg-[#FFFDF5]">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center justify-center mb-4">
              <Archive className="w-7 h-7 text-[#0B0B0B]" />
            </div>
            <h3 className="text-xl font-black font-display text-[#0B0B0B] mb-2">
              Sign In to Save Decisions
            </h3>
            <p className="font-sans text-xs text-[#544E43] leading-relaxed mb-6">
              Create a free account or sign in to persist your assessment diagnostic reports, view circular trade-offs, and resume saved evaluations anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/assess"
                className="retro-btn text-xs py-2 px-4 font-mono font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Assessment</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Card (When Authenticated but No Records) */}
      {!loading && !error && user && assessments.length === 0 && (
        <div className="dashboard-card dashboard-bracket p-8 sm:p-12 text-center bg-[#FFFDF5]">
          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Retro Icon Illustration */}
            <div className="w-16 h-16 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center justify-center mb-5">
              <Archive className="w-8 h-8 text-[#0B0B0B]" />
            </div>

            {/* Heading */}
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#0B0B0B] mb-2">
              No Saved Decisions Yet
            </h3>

            {/* Description */}
            <p className="font-sans text-sm text-[#544E43] leading-relaxed mb-6">
              You haven't evaluated any items yet. When you complete an assessment, your item's condition report, circular recommendations, and decision matrix will be securely stored here.
            </p>

            {/* Feature Highlights Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-[11px] mb-8">
              <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] space-y-1">
                <span className="font-bold text-[#0B0B0B] block">01. Evaluation</span>
                <span className="text-[#6C6659]">Condition scoring & feasibility check</span>
              </div>
              <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] space-y-1">
                <span className="font-bold text-[#0B0B0B] block">02. Trade-offs</span>
                <span className="text-[#6C6659]">Repair vs replace economic comparator</span>
              </div>
              <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] space-y-1">
                <span className="font-bold text-[#0B0B0B] block">03. Archive</span>
                <span className="text-[#6C6659]">Saved records accessible anytime</span>
              </div>
            </div>

            {/* Entry Point */}
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
                {/* Card Header Tags */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] font-mono text-[10px] font-bold uppercase text-[#0B0B0B]">
                        {item.category}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#6C6659] font-mono text-[10px] text-[#6C6659] uppercase">
                        {item.condition}
                      </span>
                    </div>

                    {getOutcomeBadge(activeOutcome)}
                  </div>

                  {/* Title & Brand */}
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

                      {/* Compact Secondary Actions Toolbar */}
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
  );
};
