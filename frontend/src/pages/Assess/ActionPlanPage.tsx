import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Sparkles,
  Wrench,
  RefreshCw,
  ArrowUpRight,
  Leaf,
  IndianRupee,
  ShieldCheck,
  Printer,
  AlertCircle,
  RotateCw,
  Bot,
  AlertTriangle,
  Sliders,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssessment } from '../../context/AssessmentContext';
import { evaluateCircularDecisionTree } from '../../components/assessment/circular/circularTreeData';
import { getDecisionAiGuidance, type DecisionGuidanceResult } from '../../services/assessmentApi';
import type { OutcomeType } from '../../components/assessment/circular/circularTreeTypes';
import './Assessment.css';

export const ActionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlAssessmentId = searchParams.get('id');

  const {
    data,
    assessmentId,
    selectedOutcome: contextOutcome,
    selectedBranchId: contextBranchId,
    checklistProgress,
    setChecklistProgress,
    saveAssessment,
    loadAssessment,
    startNewAssessment,
    isItemAssessed,
  } = useAssessment();

  // If page is loaded or refreshed with an ID, resume that assessment from database
  useEffect(() => {
    if (urlAssessmentId && urlAssessmentId !== assessmentId) {
      loadAssessment(urlAssessmentId);
    }
  }, [urlAssessmentId, assessmentId, loadAssessment]);

  // Dynamically evaluate the decision tree from the persistent assessment data
  const evaluatedTree = useMemo(() => evaluateCircularDecisionTree(data), [data]);

  // Selected outcome and branch state
  const [activeOutcome, setActiveOutcome] = useState<OutcomeType>(
    (contextOutcome as OutcomeType) || evaluatedTree.recommendedOutcome
  );

  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    contextBranchId || evaluatedTree.activeBranchId
  );

  const { session } = useAuth();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [aiGuidance, setAiGuidance] = useState<DecisionGuidanceResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const guidanceCacheRef = useRef<Record<string, DecisionGuidanceResult>>({});

  // Sync state if context updates
  useEffect(() => {
    if (contextOutcome) {
      setActiveOutcome(contextOutcome as OutcomeType);
    }
    if (contextBranchId) {
      setActiveBranchId(contextBranchId);
    }
  }, [contextOutcome, contextBranchId]);

  // Find the active sector and branch action plan
  const activeSector = evaluatedTree.outcomes[activeOutcome] || evaluatedTree.outcomes[evaluatedTree.recommendedOutcome];
  const allBranches = Object.values(evaluatedTree.outcomes).flatMap((s) => s.subBranches);
  const activeBranch =
    allBranches.find((b) => b.id === activeBranchId && b.outcomeType === activeOutcome) ||
    activeSector.subBranches[0] ||
    allBranches[0];

  const plan = activeBranch?.actionPlan;

  const fetchAiGuidance = useCallback(async (forceRefresh = false) => {
    if (!data.itemName || !data.category) return;

    const cacheKey = `${data.itemName}_${data.category}_${activeOutcome}_${activeBranch?.title || ''}_${data.repairCost || ''}_${data.replacementCost || ''}`;
    
    if (!forceRefresh && guidanceCacheRef.current[cacheKey]) {
      setAiGuidance(guidanceCacheRef.current[cacheKey]);
      setAiError(null);
      return;
    }

    setIsLoadingAi(true);
    setAiError(null);
    try {
      const res = await getDecisionAiGuidance(
        {
          item_name: data.itemName,
          category: data.category,
          brand_model: data.brandModel,
          condition: data.condition || 'assessed',
          reported_fault: data.reportedFault || 'General maintenance evaluation',
          age: data.age,
          repair_cost: data.repairCost,
          repair_cost_unknown: data.repairCostUnknown,
          replacement_cost: data.replacementCost,
          replacement_cost_unknown: data.replacementCostUnknown,
          budget_constraint: data.budgetConstraint,
          urgency: data.urgency,
          primary_priority: data.primaryPriority,
          recommended_outcome: evaluatedTree.recommendedOutcome,
          selected_outcome: activeOutcome,
          selected_branch_title: activeBranch?.title,
        },
        session?.access_token
      );
      guidanceCacheRef.current[cacheKey] = res;
      setAiGuidance(res);
    } catch (err: any) {
      setAiError(err.message || 'Unable to retrieve AI decision guidance.');
    } finally {
      setIsLoadingAi(false);
    }
  }, [data, evaluatedTree.recommendedOutcome, activeOutcome, activeBranch?.title, session?.access_token]);

  // Fetch AI guidance on mount or when activeOutcome / activeBranch changes
  useEffect(() => {
    fetchAiGuidance(false);
  }, [activeOutcome, activeBranchId]);

  // Active branch checklist steps progress
  const currentBranchSteps = useMemo(() => {
    if (!activeBranch?.id) return {};
    return checklistProgress[activeBranch.id] || {};
  }, [checklistProgress, activeBranch?.id]);

  // Completed steps calculation for current branch
  const completedCount = useMemo(() => {
    if (!plan?.recommendedSteps) return 0;
    return plan.recommendedSteps.filter((_, idx) => Boolean(currentBranchSteps[idx])).length;
  }, [plan?.recommendedSteps, currentBranchSteps]);

  const totalCount = plan?.recommendedSteps?.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Toggle step and auto-save checklist progress
  const toggleStep = async (idx: number) => {
    if (!activeBranch?.id) return;

    const newBranchSteps = {
      ...currentBranchSteps,
      [idx]: !currentBranchSteps[idx],
    };

    const newChecklistProgress = {
      ...checklistProgress,
      [activeBranch.id]: newBranchSteps,
    };

    setChecklistProgress(newChecklistProgress);
    setFeedbackMessage(null);

    try {
      await saveAssessment(undefined, {
        currentStep: 5,
        isCompleted: true,
        selectedOutcome: activeOutcome,
        selectedBranchId: activeBranch.id,
        checklistProgress: newChecklistProgress,
      });
    } catch (err: any) {
      console.error('Failed to auto-save checklist step:', err);
      setFeedbackMessage(err.message || 'Failed to save checklist state to cloud.');
    }
  };

  // Handler to change outcome and switch to appropriate branch checklist
  const handleSelectOutcome = async (newOutcome: OutcomeType) => {
    setActiveOutcome(newOutcome);
    const sector = evaluatedTree.outcomes[newOutcome];
    const defaultBranch = sector?.subBranches[0] || allBranches.find((b) => b.outcomeType === newOutcome);
    const targetBranchId = defaultBranch ? defaultBranch.id : activeBranchId;
    if (targetBranchId) {
      setActiveBranchId(targetBranchId);
    }
    setFeedbackMessage(null);

    try {
      await saveAssessment(undefined, {
        currentStep: 5,
        isCompleted: true,
        selectedOutcome: newOutcome,
        selectedBranchId: targetBranchId,
        checklistProgress,
      });
    } catch (err: any) {
      console.error('Failed to persist outcome change:', err);
    }
  };

  // Handler to change specific sub-branch within outcome
  const handleSelectBranch = async (bId: string) => {
    setActiveBranchId(bId);
    const matchingSector = Object.values(evaluatedTree.outcomes).find((s) =>
      s.subBranches.some((b) => b.id === bId)
    );
    const newOutcome = matchingSector?.outcomeType || activeOutcome;
    setActiveOutcome(newOutcome);
    setFeedbackMessage(null);

    try {
      await saveAssessment(undefined, {
        currentStep: 5,
        isCompleted: true,
        selectedBranchId: bId,
        selectedOutcome: newOutcome,
        checklistProgress,
      });
    } catch (err: any) {
      console.error('Failed to persist branch change:', err);
    }
  };

  // Finalize and return to dashboard
  const handleAssessAnother = (e: React.MouseEvent) => {
    e.preventDefault();
    const freshId = startNewAssessment();
    navigate(`/assess?id=${freshId}`);
  };

  const handleFinalizeAndExit = async () => {
    setIsFinalizing(true);
    setFeedbackMessage(null);
    try {
      await saveAssessment(undefined, {
        currentStep: 5,
        isCompleted: true,
        selectedOutcome: activeOutcome,
        selectedBranchId: activeBranchId || activeBranch.id,
        checklistProgress,
      });
      navigate('/dashboard#decisions');
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Failed to save before exiting. Please retry.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const getOutcomeColor = (type: OutcomeType) => {
    switch (type) {
      case 'repair':
        return { bg: 'bg-[#FFE600]', text: 'text-[#0B0B0B]', border: 'border-[#0B0B0B]' };
      case 'reuse':
        return { bg: 'bg-[#10B25A]', text: 'text-white', border: 'border-[#0B0B0B]' };
      case 'repurpose':
        return { bg: 'bg-[#2A5BFF]', text: 'text-white', border: 'border-[#0B0B0B]' };
      case 'replace':
        return { bg: 'bg-[#FF6B00]', text: 'text-white', border: 'border-[#0B0B0B]' };
      case 'recycle':
        return { bg: 'bg-[#8E24AA]', text: 'text-white', border: 'border-[#0B0B0B]' };
    }
  };

  const outcomeColors = getOutcomeColor(activeOutcome);

  // If accessed directly without item details, prompt user to fill out the form
  if (!isItemAssessed) {
    return (
      <div className="min-h-screen bg-[#F4EFE2] text-[#0B0B0B] flex flex-col justify-center items-center p-6 retro-grid-pattern">
        <div className="max-w-md w-full bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] p-6 sm:p-8 space-y-5 text-center">
          <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0B0B0B]">
            <AlertCircle className="w-6 h-6 text-[#0B0B0B]" />
          </div>
          <h2 className="font-display font-black text-xl text-[#0B0B0B]">
            Assessment Required
          </h2>
          <p className="font-sans text-xs text-[#544E43] leading-relaxed">
            An active action plan requires an assessed item. Please complete the assessment diagnostic to view tailored execution roadmaps.
          </p>
          <Link to="/assess" className="assessment-nav-btn w-full justify-center text-sm py-2.5">
            <span>Complete Assessment Form →</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page retro-grid-pattern min-h-screen flex flex-col">
      {/* =========================================================================
          Dedicated Printable Action Plan (Print Only — Clean, Ink-Efficient)
          ========================================================================= */}
      <div className="print-only print-document">
        {/* Header Letterhead */}
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-base font-black px-1.5 py-0.5 bg-black text-white">R3</span>
              <span className="font-mono text-lg font-black tracking-tight text-black">R3VIVE CIRCULAR ACTION PLAN</span>
            </div>
            <span className="font-mono text-[9.5pt] text-gray-700 block">
              Diagnostic Execution Roadmap & Workshop Checklist
            </span>
          </div>
          <div className="text-right font-mono text-[9pt] text-gray-600">
            <div>REF ID: {assessmentId ? assessmentId.substring(0, 8).toUpperCase() : 'DRAFT'}</div>
            <div>DATE: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Item Identity & Diagnosis Summary */}
        <div className="border border-black p-3 mb-3 bg-gray-50 print-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[9.5pt]">
            <div>
              <span className="text-gray-500 block text-[8pt]">ITEM ASSESSED</span>
              <strong className="text-black text-[10.5pt]">{data.itemName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[8pt]">CATEGORY</span>
              <strong className="text-black uppercase">{data.category}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[8pt]">CONDITION</span>
              <strong className="text-black uppercase">{data.condition?.replace(/_/g, ' ') || 'Assessed'}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[8pt]">MODEL / DETAILS</span>
              <span className="text-black">{data.brandModel || 'Standard'}</span>
            </div>
          </div>
          {data.reportedFault && (
            <div className="mt-2 pt-2 border-t border-gray-300 font-mono text-[9pt]">
              <span className="text-gray-500 block text-[8pt]">REPORTED ISSUE / FAULT:</span>
              <span className="text-black">{data.reportedFault}</span>
            </div>
          )}
        </div>

        {/* Verified Outcome & Execution Strategy */}
        <div className="border-2 border-black p-3 mb-3 print-card">
          <div className="flex justify-between items-center mb-1">
            <span className="print-badge">
              STRATEGY: {activeOutcome.toUpperCase()}
            </span>
            <span className="font-mono text-[9pt] font-bold">
              MATCH CONFIDENCE: {plan?.confidenceScore || activeSector.fitPercentage}%
            </span>
          </div>
          <h2 className="print-title text-black mt-2 mb-1">
            {plan?.title || activeBranch?.title}
          </h2>
          <p className="font-sans text-[10pt] text-gray-800 mb-2">
            {plan?.headline}
          </p>
          <div className="bg-gray-100 p-2 border border-gray-300 text-[9pt] font-sans italic text-gray-700">
            "{plan?.rationale || activeSector.summary}"
          </div>
        </div>

        {/* Key Metrics Table */}
        <div className="grid grid-cols-3 gap-2 mb-3 font-mono text-[9pt]">
          <div className="border border-black p-2">
            <span className="text-gray-600 block text-[8pt]">ENVIRONMENTAL SAVING</span>
            <strong>{plan?.wasteSavedEstimate || 'Waste diverted'}</strong>
            <span className="text-[8pt] text-gray-600 block mt-0.5">CO₂: {plan?.co2SavingsEstimate || 'Avoided'}</span>
          </div>
          <div className="border border-black p-2">
            <span className="text-gray-600 block text-[8pt]">FINANCIAL ESTIMATE</span>
            <strong>{data.repairCost ? `₹ ${data.repairCost.toLocaleString('en-IN')}` : plan?.costEfficiency}</strong>
            {data.replacementCost && (
              <span className="text-[8pt] text-gray-600 block mt-0.5">
                New: ₹ {data.replacementCost.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="border border-black p-2">
            <span className="text-gray-600 block text-[8pt]">FEASIBILITY & SKILL</span>
            <strong>{plan?.difficulty || 'Moderate'}</strong>
            <span className="text-[8pt] text-gray-600 block mt-0.5 truncate">{plan?.feasibility || 'DIY / Local'}</span>
          </div>
        </div>

        {/* Implementation Steps with Empty Printable Checkboxes */}
        <div className="mb-4">
          <div className="border-b border-black pb-1 mb-2">
            <span className="font-mono text-[10.5pt] font-black text-black uppercase">
              ORDERED IMPLEMENTATION CHECKLIST (TICK OFF AS COMPLETED)
            </span>
          </div>

          <div className="space-y-1.5">
            {plan?.recommendedSteps?.map((step, idx) => (
              <div key={idx} className="print-step-item">
                <span className="print-checkbox"></span>
                <div className="flex-1 font-mono text-[9.5pt]">
                  <strong className="block text-[8pt] text-gray-600 uppercase mb-0.5">
                    STEP 0{idx + 1}
                  </strong>
                  <span className="text-black font-sans leading-relaxed block">
                    {step}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Notes Section for Handwriting */}
        <div className="border border-black p-3 mb-3 print-card">
          <span className="font-mono text-[8.5pt] font-bold text-gray-700 block mb-1 uppercase">
            WORKSHOP NOTES & COMPONENT SERIALS:
          </span>
          <div className="h-14 border-b border-dotted border-gray-400"></div>
        </div>

        {/* Print Footer */}
        <div className="text-center font-mono text-[8pt] text-gray-500 pt-2 border-t border-gray-400">
          <span>R3VIVE Circular Diagnostic Intelligence Platform • r3vive.io</span>
        </div>
      </div>

      {/* =========================================================================
          On-Screen Interactive UI (Completely Preserved Retro Terminal Design)
          ========================================================================= */}
      <div className="screen-only no-print flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
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
                  Smart Action Plan
                </span>
              </div>
            </Link>

            {/* Quick Item Tag */}
            <div className="hidden md:flex items-center gap-2 font-mono text-xs">
              <span className="text-[#6C6659]">ACTION ROADMAP FOR:</span>
              <span className="font-bold text-[#0B0B0B] px-2 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B]">
                {data.itemName}
              </span>
              <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-black uppercase text-[10px]">
                {data.category}
              </span>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Return to Decision Matrix Button */}
              <Link
                to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
                className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-mono font-bold"
                title="Return to Circular Graph Matrix"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </Link>

              {/* View Comparator Button */}
              <Link
                to={`/assess/comparator${assessmentId ? `?id=${assessmentId}` : ''}`}
                className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-mono font-bold"
                title="Inspect Repair vs Replace Trade-Offs"
              >
                <Sliders className="w-3.5 h-3.5 text-[#2A5BFF]" />
                <span>Comparator</span>
              </Link>

              {/* Dashboard Link */}
              <Link
                to="/dashboard"
                className="inline-flex items-center text-xs font-mono font-bold text-[#6C6659] hover:text-[#0B0B0B] py-1.5 px-2 transition-colors"
                title="Return to Dashboard"
              >
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Feedback message banner if an operation encounters error */}
          {feedbackMessage && (
            <div className="p-3 bg-[#FFF5F5] border-2 border-[#DC2626] text-xs font-mono text-[#DC2626] flex items-center justify-between shadow-[2px_2px_0px_#DC2626]">
              <span>{feedbackMessage}</span>
              <button
                onClick={() => setFeedbackMessage(null)}
                className="underline font-bold ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reconsideration Banner */}
          <div className="p-3 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2A5BFF]" />
              <span className="text-[#0B0B0B]">
                Reviewing Action Plan for <strong>{activeOutcome.toUpperCase()}</strong> pathway.
              </span>
            </div>

            <Link
              to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
              className="text-[#2A5BFF] hover:underline font-bold inline-flex items-center gap-1 ml-auto"
            >
              <span>Change outcome or explore matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Hero Section: Action Plan Header Card */}
          <div className="assessment-card assessment-bracket p-6 sm:p-8 bg-[#FFFDF5]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#0B0B0B]">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 border-2 ${outcomeColors.border} ${outcomeColors.bg} ${outcomeColors.text} font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0B0B0B]`}
                  >
                    VERIFIED OUTCOME: {activeOutcome}
                  </span>

                  {activeOutcome === evaluatedTree.recommendedOutcome ? (
                    <span className="px-2 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] font-mono text-[10px] font-bold text-[#15803D] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                      PRIMARY ALGORITHM RECOMMENDATION
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#FFFBEB] border border-[#D97706] font-mono text-[10px] font-bold text-[#B45309] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                      USER ALTERNATIVE SELECTION (ALGO RECOMMENDED {evaluatedTree.recommendedOutcome.toUpperCase()})
                    </span>
                  )}
                </div>

                {activeOutcome !== evaluatedTree.recommendedOutcome && (
                  <div className="mb-3 p-2.5 bg-[#FFFBEB] border-2 border-[#D97706] font-mono text-[11px] text-[#B45309] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_#D97706]">
                    <div>
                      <strong>Comparative Note:</strong> The algorithm ranked <strong>{evaluatedTree.recommendedOutcome.toUpperCase()}</strong> #1 ({evaluatedTree.outcomes[evaluatedTree.recommendedOutcome].fitPercentage}% match) for your {data.category} in {data.condition?.replace(/_/g, ' ')} condition. You are viewing your custom selected <strong>{activeOutcome.toUpperCase()}</strong> strategy.
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectOutcome(evaluatedTree.recommendedOutcome)}
                      className="px-2.5 py-1 bg-[#10B25A] text-white hover:bg-[#0B0B0B] font-bold text-[10px] uppercase border border-[#0B0B0B] shrink-0 cursor-pointer"
                    >
                      Apply Recommended Plan
                    </button>
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B] mb-1">
                  {plan?.title || activeBranch?.title}
                </h1>

                <p className="font-mono text-xs text-[#544E43] font-bold">
                  {plan?.headline}
                </p>
              </div>

              {/* Confidence & Fit Score Badge */}
              <div className="sm:text-right shrink-0 p-3 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
                <span className="text-[10px] font-mono text-[#6C6659] block uppercase font-bold">
                  CIRCULAR MATCH
                </span>
                <span className="text-2xl font-black font-display text-[#0B0B0B]">
                  {plan?.confidenceScore || activeSector.fitPercentage}%
                </span>
                <span className="text-[10px] font-mono text-[#10B25A] block font-bold">
                  {activeSector.viability.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Rationale Quote */}
            <div className="pt-5">
              <span className="font-mono text-[11px] font-bold text-[#6C6659] uppercase block mb-1">
                DECISION RATIONALE:
              </span>
              <p className="p-3.5 bg-[#F4EFE2] border border-[#0B0B0B] font-sans text-xs sm:text-sm text-[#262422] leading-relaxed">
                {plan?.rationale || activeSector.summary}
              </p>
            </div>

            {/* Alternative Pathway Tabs within this Outcome */}
            {activeSector.subBranches.length > 1 && (
              <div className="pt-5 border-t border-[#0B0B0B]/20 mt-5">
                <span className="font-mono text-xs font-bold text-[#0B0B0B] block mb-2">
                  SELECT SUB-BRANCH EXECUTION METHOD:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSector.subBranches.map((branch) => {
                    const isSelected = branch.id === activeBranchId;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => handleSelectBranch(branch.id)}
                        className={`p-3 text-left border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]'
                            : 'bg-[#FFFDF5] border-[#0B0B0B]/40 hover:border-[#0B0B0B]'
                        }`}
                      >
                        <strong className="font-mono text-xs text-[#0B0B0B] block">
                          {branch.title}
                        </strong>
                        <span className="text-[11px] font-sans text-[#544E43] block mt-0.5">
                          {branch.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3-Pillar Impact & Feasibility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Carbon & Waste */}
            <div className="assessment-card p-5 bg-[#FFFDF5]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#10B25A]/20 border border-[#0B0B0B] flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-[#10B25A]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6C6659] block uppercase font-bold">
                    ENVIRONMENTAL GAIN
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0B0B0B]">
                    Resource Saved
                  </span>
                </div>
              </div>
              <div className="space-y-1 pt-2 font-mono text-xs border-t border-[#0B0B0B]/10">
                <div className="flex justify-between">
                  <span className="text-[#6C6659]">Waste:</span>
                  <strong className="text-[#0B0B0B]">{plan?.wasteSavedEstimate || 'Diverted'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6659]">CO₂e avoided:</span>
                  <strong className="text-[#15803D]">{plan?.co2SavingsEstimate || '12 kg'}</strong>
                </div>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className="assessment-card p-5 bg-[#FFFDF5]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#FFE600]/40 border border-[#0B0B0B] flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-[#0B0B0B]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6C6659] block uppercase font-bold">
                    ECONOMIC TRADE-OFF
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0B0B0B]">
                    Cost Analysis
                  </span>
                </div>
              </div>
              <div className="space-y-1 pt-2 font-mono text-xs border-t border-[#0B0B0B]/10">
                <div className="flex justify-between">
                  <span className="text-[#6C6659]">Est. Cost:</span>
                  <strong className="text-[#0B0B0B]">
                    {data.repairCost ? `₹ ${data.repairCost.toLocaleString('en-IN')}` : plan?.costEfficiency || 'Optimized'}
                  </strong>
                </div>
                {data.replacementCost && (
                  <div className="flex justify-between">
                    <span className="text-[#6C6659]">New item:</span>
                    <span className="line-through text-[#8C8476]">
                      ₹ {data.replacementCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <Link
                  to={`/assess/comparator${assessmentId ? `?id=${assessmentId}` : ''}`}
                  className="mt-2 pt-2 border-t border-[#0B0B0B]/10 font-mono text-[10.5px] font-bold text-[#2A5BFF] hover:underline flex items-center justify-between"
                  title="Open Repair vs Replace Trade-off Matrix"
                >
                  <span>Repair vs Replace Breakdown</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Feasibility & Skill */}
            <div className="assessment-card p-5 bg-[#FFFDF5]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#2A5BFF]/20 border border-[#0B0B0B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2A5BFF]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6C6659] block uppercase font-bold">
                    EXECUTION READINESS
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0B0B0B]">
                    Feasibility Grade
                  </span>
                </div>
              </div>
              <div className="space-y-1 pt-2 font-mono text-xs border-t border-[#0B0B0B]/10">
                <div className="flex justify-between">
                  <span className="text-[#6C6659]">Difficulty:</span>
                  <strong className="text-[#0B0B0B]">{plan?.difficulty || 'Moderate'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6659]">Support:</span>
                  <strong className="text-[#2A5BFF] text-[11px] truncate max-w-[140px]">
                    {plan?.feasibility || 'DIY / Local'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Intelligence & AI Guidance Advisory */}
          <div className="assessment-card assessment-bracket p-6 sm:p-7 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#0B0B0B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center shadow-[2px_2px_0px_#0B0B0B]">
                  <Bot className="w-4 h-4 text-[#0B0B0B]" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-black uppercase text-[#0B0B0B] tracking-tight">
                    DECISION INTELLIGENCE ADVISORY
                  </h3>
                  <span className="text-[11px] font-mono text-[#6C6659]">
                    Contextual diagnosis for {data.itemName} ({data.category})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLoadingAi && (
                  <span className="px-2.5 py-1 bg-[#F4EFE2] border border-[#0B0B0B] text-[10.5px] font-mono font-bold text-[#D97706] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>ANALYZING...</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => fetchAiGuidance(true)}
                  disabled={isLoadingAi}
                  className="px-2.5 py-1 bg-[#FFFDF5] hover:bg-[#FFE600] border border-[#0B0B0B] text-[10.5px] font-mono font-bold text-[#0B0B0B] flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors shadow-[1px_1px_0px_#0B0B0B]"
                  title="Refresh guidance"
                >
                  <RotateCw className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Banner with Retry */}
            {aiError && (
              <div className="p-3 bg-[#FFF5F5] border-2 border-[#DC2626] font-mono text-xs flex items-center justify-between gap-2 text-[#DC2626]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>AI service notice: {aiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchAiGuidance(true)}
                  className="underline font-bold uppercase text-[10px] cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Content Display */}
            {aiGuidance && (
              <div className="space-y-3.5">
                {/* Summary Verdict */}
                <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B]">
                  <span className="font-mono text-[10px] font-bold text-[#6C6659] uppercase block mb-1">
                    SYNTHESIZED DIAGNOSTIC VERDICT:
                  </span>
                  <p className="font-sans text-xs text-[#262422] leading-relaxed">
                    {aiGuidance.summary_verdict}
                  </p>
                </div>

                {/* Practical Technical Tips */}
                {aiGuidance.practical_steps && aiGuidance.practical_steps.length > 0 && (
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block mb-1.5 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#2A5BFF]" />
                      Category Workshop Recommendations:
                    </span>
                    <ul className="space-y-1.5 font-sans text-xs text-[#262422] bg-[#FFFDF5] p-3 border border-[#0B0B0B]">
                      {aiGuidance.practical_steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-[#2A5BFF] text-[11px] mt-0.5">{sIdx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety Precautions */}
                {aiGuidance.safety_cautions && aiGuidance.safety_cautions.length > 0 && (
                  <div className="p-3 bg-[#FFFBEB] border-2 border-[#D97706] font-mono text-xs text-[#B45309]">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span>SAFETY & HANDLING PRECAUTIONS:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] list-disc list-inside">
                      {aiGuidance.safety_cautions.map((caution, cIdx) => (
                        <li key={cIdx}>{caution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost & Carbon Truth */}
                <div className="p-2.5 bg-[#FFFDF5] border border-[#0B0B0B] font-mono text-xs text-[#0B0B0B] flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#10B25A] flex-none" />
                  <span className="text-[11px] leading-snug">{aiGuidance.cost_carbon_insight}</span>
                </div>

                {/* Data Gaps Honest Acknowledgment */}
                {evaluatedTree.overallDataLimitations.length > 0 && (
                  <div className="pt-2 border-t border-[#0B0B0B]/10 font-mono text-[10px] text-[#6C6659]">
                    <span className="font-bold">Honest Transparency Notice: </span>
                    {evaluatedTree.overallDataLimitations.join(' ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step-by-Step Interactive Checklist */}
          <div className="assessment-card assessment-bracket p-6 sm:p-8 bg-[#FFFDF5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b-2 border-[#0B0B0B]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-4 h-4 text-[#0B0B0B]" />
                  <h2 className="text-xl font-black font-display text-[#0B0B0B]">
                    Implementation Steps
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#6C6659]">
                  Check off each step as you complete it. Progress automatically syncs to your saved assessment.
                </p>
              </div>

              {/* Progress Counter & Visual Bar */}
              <div className="flex items-center gap-3">
                <div className="w-36 bg-[#E0D9C8] h-3 border border-[#0B0B0B] overflow-hidden">
                  <div
                    className="bg-[#10B25A] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#0B0B0B] whitespace-nowrap">
                  {completedCount} / {totalCount} ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Ordered Checklist Items */}
            <div className="pt-6 space-y-3">
              {plan?.recommendedSteps?.map((step, idx) => {
                const isChecked = Boolean(currentBranchSteps[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 border-2 transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#EBF7EE] border-[#10B25A] shadow-[2px_2px_0px_#10B25A]'
                        : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] shadow-[2px_2px_0px_#0B0B0B]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Toggle step ${idx + 1}`}
                      className="mt-0.5 shrink-0 text-[#0B0B0B] focus:outline-none cursor-pointer"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-[#10B25A] fill-[#10B25A]/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#6C6659]" />
                      )}
                    </button>

                    <div className="flex-1">
                      <span
                        className={`font-mono text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
                          isChecked ? 'text-[#10B25A]' : 'text-[#6C6659]'
                        }`}
                      >
                        STEP 0{idx + 1}
                      </span>
                      <p
                        className={`font-sans text-xs sm:text-sm leading-relaxed ${
                          isChecked ? 'line-through text-[#6C6659]' : 'text-[#0B0B0B] font-medium'
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Change Outcome Switcher */}
          <div className="assessment-card p-6 bg-[#F4EFE2] border-2 border-[#0B0B0B]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659] block">
                  COMPARE ALTERNATIVE OUTCOMES
                </span>
                <h3 className="font-display font-black text-lg text-[#0B0B0B]">
                  Switch Circular Strategy
                </h3>
              </div>
              <Link
                to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
                className="text-xs font-mono font-bold text-[#2A5BFF] hover:underline flex items-center gap-1"
              >
                <span>View Interactive Graph</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['repair', 'reuse', 'repurpose', 'replace', 'recycle'] as OutcomeType[]).map((outcomeKey) => {
                const isCurrent = activeOutcome === outcomeKey;
                const sector = evaluatedTree.outcomes[outcomeKey];
                return (
                  <button
                    key={outcomeKey}
                    type="button"
                    onClick={() => handleSelectOutcome(outcomeKey)}
                    className={`p-2.5 text-center border-2 font-mono text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0B0B0B] text-[#FFE600] border-[#0B0B0B] font-black shadow-[2px_2px_0px_#0B0B0B]'
                        : 'bg-[#FFFDF5] text-[#0B0B0B] border-[#0B0B0B] hover:bg-[#FFE600] font-bold'
                    }`}
                  >
                    <span className="block capitalize">{outcomeKey}</span>
                    <span className="text-[10px] opacity-75 font-normal block">
                      {sector?.fitPercentage}% fit
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation & Finalize Toolbar */}
          <div className="assessment-card p-6 bg-[#FFFDF5] flex flex-wrap items-center justify-between gap-4">
            {/* Return to Graph Button */}
            <Link
              to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
              className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-2 px-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Decision Matrix</span>
            </Link>

            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <button
                type="button"
                onClick={handleAssessAnother}
                className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                title="Evaluate another item"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assess Another Item</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                title="Print Workshop Action Plan"
              >
                <Printer className="w-4 h-4" />
                <span>Print Plan</span>
              </button>

              <button
                type="button"
                onClick={handleFinalizeAndExit}
                disabled={isFinalizing}
                className="assessment-nav-btn text-xs py-2 px-5 flex items-center gap-1.5 shadow-[3px_3px_0px_#0B0B0B] cursor-pointer"
              >
                {isFinalizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Decision & Exit to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center font-mono text-xs text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5]">
          <span>R3VIVE Smart Action Plan Engine • Verified Circular Execution • Persistent Diagnostics</span>
        </footer>
      </div>
    </div>
  );
};
