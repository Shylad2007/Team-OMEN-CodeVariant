import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { evaluateCircularDecisionTree } from '../../components/assessment/circular/circularTreeData';
import { RepairReplaceComparator } from '../../components/assessment/comparator/RepairReplaceComparator';
import type { OutcomeType } from '../../components/assessment/circular/circularTreeTypes';

export const ComparatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlAssessmentId = searchParams.get('id');

  const {
    data,
    assessmentId,
    loadAssessment,
    selectedOutcome: contextOutcome,
    setSelectedOutcome,
    setSelectedBranchId,
    saveAssessment,
  } = useAssessment();

  const [activeOutcome, setActiveOutcome] = useState<OutcomeType>('repair');
  const [isNavigating, setIsNavigating] = useState(false);

  // Load from URL if id provided and not already matching
  useEffect(() => {
    if (urlAssessmentId && urlAssessmentId !== assessmentId) {
      loadAssessment(urlAssessmentId);
    }
  }, [urlAssessmentId, assessmentId, loadAssessment]);

  // Synchronize evaluated circular tree with real assessment data
  const evaluatedTree = useMemo(() => {
    return evaluateCircularDecisionTree(data);
  }, [data]);

  // Sync active outcome with context or algorithm recommendation
  useEffect(() => {
    if (contextOutcome && (contextOutcome === 'repair' || contextOutcome === 'replace')) {
      setActiveOutcome(contextOutcome as OutcomeType);
    } else if (evaluatedTree.recommendedOutcome === 'replace') {
      setActiveOutcome('replace');
    } else {
      setActiveOutcome('repair');
    }
  }, [contextOutcome, evaluatedTree.recommendedOutcome]);

  const handleSelectOutcome = (outcome: OutcomeType) => {
    setActiveOutcome(outcome);
    setSelectedOutcome(outcome);
    // Auto-select first sub-branch for this outcome
    const sector = evaluatedTree.outcomes[outcome];
    if (sector && sector.subBranches.length > 0) {
      setSelectedBranchId(sector.subBranches[0].id);
    }
  };

  const handleProceedToActionPlan = async () => {
    setIsNavigating(true);
    try {
      // Pick first sub-branch for this outcome if none selected
      const sector = evaluatedTree.outcomes[activeOutcome];
      const branchId = sector?.subBranches[0]?.id || null;

      await saveAssessment(
        {},
        {
          currentStep: 4,
          isCompleted: true,
          recommendedOutcome: evaluatedTree.recommendedOutcome,
          selectedOutcome: activeOutcome,
          selectedBranchId: branchId,
        }
      );

      navigate(`/assess/action-plan${assessmentId ? `?id=${assessmentId}` : ''}`);
    } catch (err) {
      console.error('Error saving before Action Plan navigation:', err);
      // Navigate anyway to avoid trapping user
      navigate(`/assess/action-plan${assessmentId ? `?id=${assessmentId}` : ''}`);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE2] text-[#0B0B0B] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#FFFDF5] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              R3
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter font-display leading-none text-[#0B0B0B]">
                R3VIVE
              </span>
              <span className="text-[8.5px] font-mono tracking-widest text-[#6C6659] uppercase font-bold">
                Cost & Lifecycle Comparator
              </span>
            </div>
          </Link>

          {/* Workflow Stage Badges */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono font-bold">
            <Link to={`/assess${assessmentId ? `?id=${assessmentId}` : ''}`} className="px-2 py-0.5 text-[#6C6659] hover:text-[#0B0B0B]">
              01. Intake
            </Link>
            <span className="text-[#A59F92]">›</span>
            <Link to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`} className="px-2 py-0.5 text-[#6C6659] hover:text-[#0B0B0B]">
              02. Radial Matrix
            </Link>
            <span className="text-[#A59F92]">›</span>
            <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] shadow-[1px_1px_0px_#0B0B0B]">
              03. Trade-off Comparator
            </span>
            <span className="text-[#A59F92]">›</span>
            <Link to={`/assess/action-plan${assessmentId ? `?id=${assessmentId}` : ''}`} className="px-2 py-0.5 text-[#6C6659] hover:text-[#0B0B0B]">
              04. Action Plan
            </Link>
          </div>

          {/* Navigation CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
              className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </Link>

            <button
              type="button"
              onClick={handleProceedToActionPlan}
              disabled={isNavigating}
              className="assessment-nav-btn bg-[#FFE600] text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600] text-xs py-1.5 px-3.5 shadow-[2px_2px_0px_#0B0B0B] flex items-center gap-1.5 font-mono font-bold cursor-pointer disabled:opacity-50"
            >
              {isNavigating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Action Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <RepairReplaceComparator
          data={data}
          tree={evaluatedTree}
          selectedOutcome={activeOutcome}
          onSelectOutcome={handleSelectOutcome}
          onProceedToActionPlan={handleProceedToActionPlan}
        />
      </main>

      {/* Footer */}
      <footer className="py-3 text-center font-mono text-[11px] text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5]">
        <span>R3VIVE Economic & Circular Trade-off Matrix • Truthful Break-Even Intelligence</span>
      </footer>
    </div>
  );
};
