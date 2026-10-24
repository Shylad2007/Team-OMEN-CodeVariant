import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, AlertTriangle, Workflow } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { evaluateCircularDecisionTree } from '../../components/assessment/circular/circularTreeData';
import { CircularDecisionCanvas } from '../../components/assessment/circular/CircularDecisionCanvas';
import {
  CanvasProtocolProvider,
  DraggableCard,
  ActionZone,
  CanvasHUD,
  useCanvasProtocol,
} from '../../components/canvas';
import './Assessment.css';

/**
 * Inner body of DecisionTreePage utilizing Canvas Protocol
 */
const DecisionTreeCanvasBody: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlAssessmentId = searchParams.get('id');

  const {
    data,
    resetData,
    isItemAssessed,
    assessmentId,
    selectedBranchId: contextBranchId,
    saveAssessment,
    loadAssessment,
  } = useAssessment();

  const { setStatusMessage } = useCanvasProtocol();
  const [actionError, setActionError] = useState<string | null>(null);

  // If URL has id, load that assessment on mount
  useEffect(() => {
    if (urlAssessmentId && urlAssessmentId !== assessmentId) {
      loadAssessment(urlAssessmentId);
    }
  }, [urlAssessmentId, assessmentId, loadAssessment]);

  // Evaluate circular decision tree dynamically from assessment inputs
  const evaluatedTree = useMemo(() => evaluateCircularDecisionTree(data), [data]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    contextBranchId || evaluatedTree.activeBranchId
  );

  // Sync active branch if evaluatedTree or context changes
  useEffect(() => {
    if (contextBranchId) {
      setActiveBranchId(contextBranchId);
    } else if (evaluatedTree.activeBranchId && !activeBranchId) {
      setActiveBranchId(evaluatedTree.activeBranchId);
    }
  }, [contextBranchId, evaluatedTree.activeBranchId, activeBranchId]);

  const activeSector = useMemo(() => {
    const sectors = Object.values(evaluatedTree.outcomes);
    return (
      sectors.find((sector) => sector.subBranches.some((b) => b.id === activeBranchId)) ||
      evaluatedTree.outcomes[evaluatedTree.recommendedOutcome]
    );
  }, [evaluatedTree, activeBranchId]);

  const isUserDiverging = activeSector.outcomeType !== evaluatedTree.recommendedOutcome;

  // Auto-save completion and selected outcome on initial load
  useEffect(() => {
    if (isItemAssessed && evaluatedTree) {
      saveAssessment({
        isCompleted: true,
        currentStep: 5,
        recommendedOutcome: evaluatedTree.recommendedOutcome,
        selectedOutcome: evaluatedTree.recommendedOutcome,
        selectedBranchId: activeBranchId || evaluatedTree.activeBranchId,
      });
    }
  }, [isItemAssessed]);

  const handleSelectBranch = (bId: string) => {
    setActiveBranchId(bId);
    const sectors = Object.values(evaluatedTree.outcomes);
    const matchingSector = sectors.find((sector) =>
      sector.subBranches.some((b) => b.id === bId)
    );
    saveAssessment({
      isCompleted: true,
      currentStep: 5,
      selectedBranchId: bId,
      selectedOutcome: matchingSector?.outcomeType || evaluatedTree.recommendedOutcome,
      recommendedOutcome: evaluatedTree.recommendedOutcome,
    });
    setStatusMessage(`Active path pinned to ${matchingSector?.outcomeType.toUpperCase() || 'RECOMMENDED'}`);
  };

  const handleContinueToActionPlan = async () => {
    setActionError(null);

    try {
      const sectors = Object.values(evaluatedTree.outcomes);
      const matchingSector = sectors.find((sector) =>
        sector.subBranches.some((b) => b.id === activeBranchId)
      );
      const outcomeToSave = matchingSector?.outcomeType || evaluatedTree.recommendedOutcome;
      const branchToSave = activeBranchId || evaluatedTree.activeBranchId;

      const savedId = await saveAssessment({
        isCompleted: true,
        currentStep: 5,
        selectedOutcome: outcomeToSave,
        recommendedOutcome: evaluatedTree.recommendedOutcome,
        selectedBranchId: branchToSave,
      });

      setStatusMessage('Decision committed. Transitioning to Action Plan Roadmap...');
      const targetId = savedId || assessmentId || urlAssessmentId;
      navigate(`/assess/action-plan${targetId ? `?id=${targetId}` : ''}`);
      return true;
    } catch (err: any) {
      console.error('Failed to persist assessment before action plan:', err);
      setActionError(err.message || 'Failed to save assessment to cloud. Please try again.');
      setStatusMessage('Failed to persist decision to cloud storage.');
      return false;
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this item and start a fresh assessment? Current answers will be cleared.')) {
      resetData();
      navigate('/assess');
    }
  };

  // If accessed directly without item details, prompt user to fill out the form
  if (!isItemAssessed) {
    return (
      <div className="min-h-screen bg-[#F4EFE2] text-[#0B0B0B] flex flex-col justify-center items-center p-6 retro-grid-pattern">
        <div className="max-w-md w-full bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] p-6 sm:p-8 space-y-5 text-center">
          <div className="w-12 h-12 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0B0B0B]">
            <AlertTriangle className="w-6 h-6 text-[#0B0B0B]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-xl text-[#0B0B0B]">
              Item Assessment Incomplete
            </h2>
            <p className="font-sans text-xs text-[#544E43] leading-relaxed">
              The Circular Decision Tree requires verified item identification, condition evaluation, and circumstances to generate reliable circular pathways.
            </p>
          </div>

          <Link
            to="/assess"
            className="assessment-nav-btn w-full justify-center text-sm py-2.5"
          >
            <span>Complete Assessment Form →</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col flex-1 bg-[#F4EFE2] text-[#0B0B0B] retro-grid-pattern overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              R3
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter font-display leading-none text-[#0B0B0B]">
                R3VIVE
              </span>
              <span className="text-[8.5px] font-mono tracking-widest text-[#6C6659] uppercase font-bold">
                Circular Decision Engine
              </span>
            </div>
          </Link>

          {/* Item Quick Tag */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs">
            <span className="text-[#6C6659]">EVALUATING:</span>
            <span className="font-bold text-[#0B0B0B] px-2 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] truncate max-w-[200px]">
              {data.itemName}
            </span>
            <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-black uppercase text-[10px]">
              {data.category}
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#6C6659] hover:text-[#0B0B0B] p-1.5 transition-colors"
              title="Reset assessment"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <Link
              to={`/assess${assessmentId ? `?id=${assessmentId}` : ''}`}
              className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Item</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Expansive Circular Graph Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-6 py-3 flex flex-col min-h-0">
        {/* Save Error Alert Banner */}
        {actionError && (
          <div className="mb-2 p-2 px-3 bg-[#FFF5F5] border-2 border-[#DC2626] font-mono text-xs flex items-center justify-between gap-2 shadow-[2px_2px_0px_#DC2626] flex-none">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 flex-none" />
              <strong>SAVE ERROR:</strong>
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={handleContinueToActionPlan}
              className="px-2.5 py-0.5 bg-[#DC2626] text-white hover:bg-[#0B0B0B] font-bold text-[10px] uppercase border border-[#0B0B0B]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Canvas Protocol Decision Dock (Replaces the prohibited primary button) */}
        <div className="mb-3 p-3 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] flex-none">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* Draggable Active Decision Token */}
            <div className="md:col-span-5 flex flex-col">
              <DraggableCard
                payload={{
                  type: 'decision_node_token',
                  id: `node-${activeSector.outcomeType}`,
                  title: `${activeSector.outcomeType.toUpperCase()} PATHWAY`,
                  subtitle: `Fit: ${activeSector.fitPercentage}% • ${data.itemName || 'Item'}`,
                  badge: isUserDiverging ? 'USER PINNED' : 'RECOMMENDED',
                  badgeColor: isUserDiverging ? 'bg-[#FFE600] text-[#0B0B0B]' : 'bg-[#10B25A] text-white',
                  data: {
                    outcome: activeSector.outcomeType,
                    branchId: activeBranchId,
                    assessmentId,
                  },
                }}
                className="h-full"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 bg-[#10B25A] border border-[#0B0B0B] shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-black text-[#0B0B0B] uppercase truncate">
                      DECISION TOKEN: {activeSector.outcomeType}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-black shrink-0">
                    {activeSector.fitPercentage}% FIT
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[#544E43] mt-1.5 truncate">
                  {data.itemName ? `Item: ${data.itemName}` : 'Assessed item parameters'}
                </p>
              </DraggableCard>
            </div>

            {/* Target Action Zone: Deploy Action Plan */}
            <div className="md:col-span-7 flex flex-col">
              <ActionZone
                id="deploy-action-plan-zone"
                label="Deploy Action Plan Roadmap"
                hint="Drop active decision token here to commit pathway & unlock verified checklist"
                accepts={['decision_node_token', 'review_verdict_token', 'intake_capsule']}
                icon={<Workflow className="w-5 h-5 text-[#2A5BFF]" />}
                activeColor="bg-[#2A5BFF]/10"
                onDrop={handleContinueToActionPlan}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Dedicated Circular Canvas */}
        <div className="flex-1 w-full h-[620px] lg:h-[calc(100vh-230px)] min-h-[520px] flex flex-col">
          <CircularDecisionCanvas
            tree={evaluatedTree}
            activeBranchId={activeBranchId}
            onSelectActiveBranch={handleSelectBranch}
            onContinueToActionPlan={handleContinueToActionPlan}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 text-center font-mono text-[10px] text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5] flex-none">
        <span>R3VIVE Radial Decision Engine • Multi-Criteria Circular Navigation</span>
      </footer>

      {/* Floating Canvas HUD */}
      <CanvasHUD />
    </div>
  );
};

export const DecisionTreePage: React.FC = () => {
  return (
    <CanvasProtocolProvider>
      <DecisionTreeCanvasBody />
    </CanvasProtocolProvider>
  );
};
