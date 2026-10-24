import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Plus, Trash2, Sparkles, Clock, CheckCircle2, Edit3, Search, Compass, GripVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssessment } from '../../context/AssessmentContext';
import { listUserAssessments, deleteAssessment, type AssessmentSummaryItem } from '../../services/assessmentApi';
import { DraggableCard, ActionZone } from '../canvas';

export const MyDecisionsSection: React.FC = () => {
  const { session, user } = useAuth();
  const { startNewAssessment } = useAssessment();
  const navigate = useNavigate();

  const handleAddNewItem = () => {
    const freshId = startNewAssessment();
    navigate(`/assess?id=${freshId}`);
  };

  const [assessments, setAssessments] = useState<AssessmentSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listUserAssessments(session?.access_token);
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

  const handleDeleteItem = async (id: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to purge the assessment for "${itemName}"? This cannot be undone.`)) {
      return false;
    }
    try {
      await deleteAssessment(id, session?.access_token || '');
      setAssessments((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      alert(`Failed to delete assessment: ${err.message || 'Unknown error'}`);
      return false;
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

  return (
    <section id="decisions" className="mb-12 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Archive className="w-5 h-5 text-[#0B0B0B]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
              DECISION VAULT • REPOSITORY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
            Assessed Hardware Repository
          </h2>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Error Notice */}
      {error && !loading && (
        <div className="p-6 bg-[#FFF5F5] border-2 border-[#DC2626] shadow-[4px_4px_0px_#DC2626] text-center font-mono text-xs space-y-3">
          <p className="text-[#DC2626] font-bold">Failed to load decision vault: {error}</p>
          <button
            type="button"
            onClick={fetchAssessments}
            className="px-3 py-1 bg-[#DC2626] text-white hover:bg-[#0B0B0B] font-bold border border-[#0B0B0B] cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State with Canvas Token Initialization */}
      {!loading && !error && assessments.length === 0 && (
        <div className="p-8 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] text-center space-y-4">
          <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0B0B0B]">
            <Archive className="w-6 h-6 text-[#0B0B0B]" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-[#0B0B0B]">No Assessments in Vault</h3>
            <p className="font-mono text-xs text-[#6C6659] max-w-md mx-auto mt-1">
              Your decision vault is empty. Drag the Intake Token into the Action Zone below to start your first evaluation.
            </p>
          </div>

          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#0B0B0B]/20">
            <DraggableCard
              payload={{
                type: 'new_assessment_token',
                id: 'new_vault_token',
                title: 'First Intake Token',
                badge: 'TOKEN',
              }}
              onCardClick={handleAddNewItem}
              className="h-full"
            >
              <div className="p-3 flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-[#0B0B0B]" />
                <div className="text-left">
                  <strong className="font-display text-sm block">First Item Payload</strong>
                  <span className="font-mono text-[10px] text-[#6C6659]">Click or drag to activate</span>
                </div>
              </div>
            </DraggableCard>

            <ActionZone
              id="zone_vault_first_item"
              accepts={['new_assessment_token']}
              label="Initialize First Assessment"
              hint="Drop payload card here to launch"
              activeColor="bg-[#FFE600]"
              onDrop={handleAddNewItem}
              className="border-2 border-dashed border-[#0B0B0B]"
            />
          </div>
        </div>
      )}

      {/* Populated Decision Vault with Drag-and-Drop Action Deck */}
      {!loading && !error && assessments.length > 0 && (
        <>
          {/* Guest Session Note */}
          {!user && (
            <div className="mb-4 p-3 bg-[#FFFDF5] border border-[#0B0B0B] font-mono text-xs text-[#544E43] flex items-center justify-between gap-3 shadow-[2px_2px_0px_#0B0B0B]">
              <span><strong>Guest Session:</strong> Items are saved in this browser. Sign in anytime to sync across devices.</span>
              <Link to="/login" className="font-bold underline text-[#0B0B0B] hover:text-[#2A5BFF]">Sign In</Link>
            </div>
          )}

          {/* Action Zone Dock: Targets for Dragged Assessment Cards */}
          <div className="mb-6 p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[11px] font-black uppercase text-[#0B0B0B] flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-[#0B0B0B]" />
                <span>CANVAS ACTION DECK: DRAG ANY REPOSITORY CARD INTO A TARGET ZONE BELOW</span>
              </span>
              <span className="font-mono text-[10px] text-[#6C6659] hidden md:inline">
                (Press Space on card + Enter in zone for keyboard control)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ActionZone
                id="vault_zone_action_plan"
                accepts={['assessment_summary_card']}
                label="Action Plan"
                hint="Drop card to open smart execution roadmap"
                icon={<Sparkles className="w-4 h-4 text-[#10B25A]" />}
                activeColor="bg-[#10B25A]"
                onDrop={(payload) => navigate(`/assess/action-plan?id=${payload.id}`)}
                className="py-3 px-2 border-2 border-dashed"
              />

              <ActionZone
                id="vault_zone_edit"
                accepts={['assessment_summary_card']}
                label="Resume / Edit"
                hint="Drop card to edit answers or resume intake"
                icon={<Edit3 className="w-4 h-4 text-[#0B0B0B]" />}
                activeColor="bg-[#FFE600]"
                onDrop={(payload) => navigate(`/assess?id=${payload.id}`)}
                className="py-3 px-2 border-2 border-dashed"
              />

              <ActionZone
                id="vault_zone_tree"
                accepts={['assessment_summary_card']}
                label="Decision Matrix"
                hint="Drop card to inspect circular graph"
                icon={<Compass className="w-4 h-4 text-[#2A5BFF]" />}
                activeColor="bg-[#2A5BFF]"
                onDrop={(payload) => navigate(`/assess/decision-tree?id=${payload.id}`)}
                className="py-3 px-2 border-2 border-dashed"
              />

              <ActionZone
                id="vault_zone_delete"
                accepts={['assessment_summary_card']}
                label="Purge Item"
                hint="Drop card to delete record permanently"
                icon={<Trash2 className="w-4 h-4 text-[#DC2626]" />}
                activeColor="bg-[#DC2626]"
                onDrop={(payload) => handleDeleteItem(payload.id, payload.title)}
                className="py-3 px-2 border-2 border-dashed border-[#DC2626]/60"
              />
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 font-mono text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 border border-[#0B0B0B] font-bold transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#0B0B0B] text-[#FFE600] shadow-[2px_2px_0px_#2A5BFF]'
                    : 'bg-[#FFFDF5] text-[#0B0B0B] hover:bg-[#F4EFE2]'
                }`}
              >
                All ({assessments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('in_progress')}
                className={`px-3 py-1.5 border border-[#0B0B0B] font-bold transition-colors cursor-pointer ${
                  activeFilter === 'in_progress'
                    ? 'bg-[#0B0B0B] text-[#FFE600] shadow-[2px_2px_0px_#2A5BFF]'
                    : 'bg-[#FFFDF5] text-[#0B0B0B] hover:bg-[#F4EFE2]'
                }`}
              >
                In Progress ({assessments.filter((a) => !a.is_completed && a.current_step < 5).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 border border-[#0B0B0B] font-bold transition-colors cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-[#0B0B0B] text-[#FFE600] shadow-[2px_2px_0px_#2A5BFF]'
                    : 'bg-[#FFFDF5] text-[#0B0B0B] hover:bg-[#F4EFE2]'
                }`}
              >
                Completed ({assessments.filter((a) => a.is_completed || a.current_step >= 5).length})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#6C6659] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search items by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FFFDF5] border border-[#0B0B0B] text-xs font-mono text-[#0B0B0B] placeholder-[#8A8477] focus:outline-none focus:ring-1 focus:ring-[#0B0B0B]"
              />
            </div>
          </div>

          {/* Draggable Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments
              .filter((item) => {
                if (activeFilter === 'in_progress') return !item.is_completed && item.current_step < 5;
                if (activeFilter === 'completed') return item.is_completed || item.current_step >= 5;
                return true;
              })
              .filter((item) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  item.item_name.toLowerCase().includes(q) ||
                  (item.category && item.category.toLowerCase().includes(q)) ||
                  (item.brand_model && item.brand_model.toLowerCase().includes(q))
                );
              })
              .map((item) => {
                const activeOutcome = item.selected_outcome || item.recommended_outcome;
                const isCompleted = item.is_completed || item.current_step >= 5;

                return (
                  <DraggableCard
                    key={item.id}
                    payload={{
                      type: 'assessment_summary_card',
                      id: item.id,
                      title: item.item_name,
                      subtitle: `${item.category} • ${item.condition}`,
                      badge: isCompleted ? 'VERIFIED' : `STAGE 0${item.current_step}`,
                      badgeColor: isCompleted ? 'bg-[#10B25A] text-white' : 'bg-[#D97706] text-white',
                      data: item,
                    }}
                    onCardClick={() => {
                      if (isCompleted) {
                        navigate(`/assess/action-plan?id=${item.id}`);
                      } else {
                        navigate(`/assess?id=${item.id}`);
                      }
                    }}
                    className="h-full flex flex-col justify-between"
                  >
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div>
                        {/* Header Tags */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] font-mono text-[9.5px] font-bold uppercase text-[#0B0B0B]">
                              {item.category}
                            </span>
                            <span className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#6C6659] font-mono text-[9.5px] text-[#6C6659] uppercase">
                              {item.condition?.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {getOutcomeBadge(activeOutcome)}
                        </div>

                        {/* Title & Brand */}
                        <h4 className="font-display font-black text-lg text-[#0B0B0B] leading-tight mb-1 line-clamp-1">
                          {item.item_name}
                        </h4>
                        {item.brand_model && (
                          <p className="font-mono text-xs text-[#6C6659] mb-2 line-clamp-1">
                            {item.brand_model}
                          </p>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-2 font-mono text-[10.5px] text-[#544E43] my-2 pt-2 border-t border-[#E0D9C8]">
                          {isCompleted ? (
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

                      {/* Drop Targets Quick Guide on Card */}
                      <div className="pt-2 mt-2 border-t border-[#0B0B0B]/15 font-mono text-[10px] text-[#6C6659] flex items-center justify-between">
                        <span className="font-bold text-[#0B0B0B]">DRAG TO ACTIVATE:</span>
                        <div className="flex items-center gap-1">
                          <span className="px-1 py-0.2 bg-[#F4EFE2] border border-[#0B0B0B]">Plan</span>
                          <span className="px-1 py-0.2 bg-[#F4EFE2] border border-[#0B0B0B]">Matrix</span>
                          <span className="px-1 py-0.2 bg-[#F4EFE2] border border-[#0B0B0B]">Edit</span>
                          <span className="px-1 py-0.2 bg-[#FFF5F5] text-[#DC2626] border border-[#DC2626]">Trash</span>
                        </div>
                      </div>
                    </div>
                  </DraggableCard>
                );
              })}
          </div>
        </>
      )}
    </section>
  );
};
