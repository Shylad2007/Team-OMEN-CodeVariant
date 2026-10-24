import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import type { AssessmentData, AssessmentStage } from '../../components/assessment/types';
import { AssessmentStepper } from '../../components/assessment/AssessmentStepper';
import { StepItemIdentity } from '../../components/assessment/StepItemIdentity';
import { StepConditionFault } from '../../components/assessment/StepConditionFault';
import { StepCircumstances } from '../../components/assessment/StepCircumstances';
import { StepAdaptiveQuestions } from '../../components/assessment/StepAdaptiveQuestions';
import { StepReview } from '../../components/assessment/StepReview';
import { ADAPTIVE_QUESTIONS } from '../../components/assessment/questions';
import { useAssessment } from '../../context/AssessmentContext';
import {
  CanvasProtocolProvider,
  DraggableCard,
  ActionZone,
  CanvasHUD,
  useCanvasProtocol,
} from '../../components/canvas';
import './Assessment.css';

/**
 * Inner stepper canvas component that consumes CanvasProtocolContext
 */
const AssessmentCanvasBody: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlAssessmentId = searchParams.get('id');
  const isExplicitNew = searchParams.get('new') === 'true' || urlAssessmentId === 'new';

  const {
    data,
    updateData,
    startNewAssessment,
    assessmentId,
    currentStep,
    saveAssessment,
    loadAssessment,
  } = useAssessment();

  const { setStatusMessage } = useCanvasProtocol();
  const [currentStage, setCurrentStage] = useState<AssessmentStage>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const lastHandledIdRef = useRef<string | null>(null);

  // Ensure every assessment session has a dedicated unique ID and isolated state
  useEffect(() => {
    if (isExplicitNew || !urlAssessmentId) {
      const freshId = startNewAssessment();
      lastHandledIdRef.current = freshId;
      setSearchParams({ id: freshId }, { replace: true });
      setCurrentStage(1);
      return;
    }

    if (urlAssessmentId && urlAssessmentId !== lastHandledIdRef.current) {
      lastHandledIdRef.current = urlAssessmentId;
      if (urlAssessmentId !== assessmentId) {
        loadAssessment(urlAssessmentId);
      }
    }
  }, [urlAssessmentId, isExplicitNew, startNewAssessment, loadAssessment, setSearchParams, assessmentId]);

  // Sync current stage if loaded assessment has a valid step
  useEffect(() => {
    if (currentStep >= 1 && currentStep <= 5 && currentStep !== currentStage) {
      setCurrentStage(currentStep as AssessmentStage);
    }
  }, [currentStep, currentStage]);

  const handleUpdate = (updates: Partial<AssessmentData>) => {
    updateData(updates);
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((k) => delete next[k]);
      return next;
    });
  };

  const validateStage = (stage: AssessmentStage): boolean => {
    const newErrors: Record<string, string> = {};

    if (stage === 1) {
      if (!data.itemName.trim()) {
        newErrors.itemName = 'Please enter an item name or description';
      }
      if (!data.category) {
        newErrors.category = 'Please select a primary category for this item';
      }
    }

    if (stage === 2) {
      if (!data.age) {
        newErrors.age = 'Please select an estimated age range';
      }
      if (!data.condition) {
        newErrors.condition = 'Please select an operational condition grade';
      }
      if (!data.reportedFault.trim()) {
        newErrors.reportedFault = 'Please describe the fault, damage, or symptoms';
      }
    }

    if (stage === 3) {
      if (!data.primaryPriority) {
        newErrors.primaryPriority = 'Please select your primary decision priority';
      }
      if (!data.budgetConstraint) {
        newErrors.budgetConstraint = 'Please select your budget flexibility';
      }
      if (!data.urgency) {
        newErrors.urgency = 'Please select your time urgency';
      }
    }

    if (stage === 4) {
      const relevantAdaptive = ADAPTIVE_QUESTIONS.filter(
        (q) => q.categoryId === data.category || (data.category === 'other' && q.categoryId === 'other')
      );
      const questionsToValidate = relevantAdaptive.length > 0 ? relevantAdaptive : ADAPTIVE_QUESTIONS.slice(0, 2);

      questionsToValidate.forEach((q) => {
        if (!data.adaptiveAnswers[q.id]) {
          newErrors[q.id] = 'Answer required for this branch';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const advanceToNextStage = async () => {
    if (!validateStage(currentStage)) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      setStatusMessage(`Validation failed for Stage 0${currentStage}. Please check highlighted fields.`);
      return false;
    }

    if (currentStage < 5) {
      const nextStage = (currentStage + 1) as AssessmentStage;
      setCurrentStage(nextStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await saveAssessment({ currentStep: nextStage, isCompleted: false });
      setStatusMessage(`Successfully advanced to Stage 0${nextStage}`);
      return true;
    }
    return true;
  };

  const launchDecisionMatrix = async () => {
    if (!validateStage(5)) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      setStatusMessage('Validation failed on review stage.');
      return false;
    }

    await saveAssessment({ currentStep: 5, isCompleted: false });
    setStatusMessage('Diagnostic verified. Launching Circular Decision Matrix...');
    const targetId = assessmentId || urlAssessmentId;
    navigate(`/assess/decision-tree${targetId ? `?id=${targetId}` : ''}`);
    return true;
  };

  const handleBack = () => {
    if (currentStage > 1) {
      const prevStage = (currentStage - 1) as AssessmentStage;
      setCurrentStage(prevStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStatusMessage(`Navigated back to Stage 0${prevStage}`);
    }
  };

  const handleNavigateToStage = (stage: AssessmentStage) => {
    if (stage <= currentStage || validateStage(currentStage)) {
      setCurrentStage(stage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      saveAssessment({ currentStep: stage, isCompleted: false });
    }
  };

  const handleReset = () => {
    if (window.confirm('Start a fresh assessment? Current unsubmitted answers will be cleared.')) {
      const freshId = startNewAssessment();
      setSearchParams({ id: freshId }, { replace: true });
      setCurrentStage(1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStatusMessage('Assessment reset to clean Stage 01 state');
    }
  };

  return (
    <div className="assessment-page retro-grid-pattern min-h-screen flex flex-col flex-1">
      {/* Top Header */}
      <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              R3
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter font-display leading-none text-[#0B0B0B]">
                R3VIVE
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#6C6659] uppercase font-bold">
                Item Assessment Diagnostic
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#6C6659] hover:text-[#0B0B0B] transition-colors p-1.5"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <Link
              to="/dashboard"
              className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Stepper Progress Bar (Non-mutating stage inspector) */}
        <AssessmentStepper
          currentStage={currentStage}
          onSelectStage={handleNavigateToStage}
        />

        {/* Step Card Content */}
        <div className="assessment-card assessment-bracket p-6 sm:p-10 bg-[#FFFDF5] mb-8">
          {currentStage === 1 && (
            <StepItemIdentity
              data={data}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStage === 2 && (
            <StepConditionFault
              data={data}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStage === 3 && (
            <StepCircumstances
              data={data}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStage === 4 && (
            <StepAdaptiveQuestions
              data={data}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStage === 5 && (
            <StepReview
              data={data}
              onNavigateToStage={handleNavigateToStage}
              onReset={handleReset}
            />
          )}

          {/* Canvas Protocol Stepper Dock (Replaces standard buttons with Draggable Capsule + Action Zones) */}
          <div className="pt-8 mt-8 border-t-2 border-[#0B0B0B]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FFE600] border border-[#0B0B0B]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B0B]">
                  Assessment Stepper Dock
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#6C6659]">
                Drag Stage Token to Zone or press Space + Enter
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Draggable Active Stage Capsule */}
              <div className="md:col-span-5 flex flex-col">
                <DraggableCard
                  payload={{
                    type: currentStage < 5 ? 'intake_capsule' : 'review_verdict_token',
                    id: `stage-token-0${currentStage}`,
                    title: `Stage 0${currentStage} Diagnostic Capsule`,
                    subtitle: data.itemName ? `Item: ${data.itemName}` : 'Parameters in transit',
                    badge: `STAGE 0${currentStage}/05`,
                    badgeColor: '#FFE600',
                    data: {
                      stage: currentStage,
                      assessmentId,
                      itemName: data.itemName,
                    },
                  }}
                  className="h-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-[#0B0B0B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#0B0B0B] text-[#FFFDF5] font-mono text-[10px] font-black uppercase">
                          {`STAGE 0${currentStage}`}
                        </span>
                        <span className="font-mono text-[10px] text-[#10B25A] font-bold">
                          READY FOR TRANSIT
                        </span>
                      </div>
                      <div className="font-display font-black text-sm text-[#0B0B0B] truncate">
                        {data.itemName || 'Untitled Diagnostic Payload'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#0B0B0B]/20 text-[11px] font-mono text-[#544E43]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A]" />
                    <span>Drag this capsule to advance or synthesize</span>
                  </div>
                </DraggableCard>
              </div>

              {/* Action Zone: Advance or Launch */}
              <div className="md:col-span-7 flex flex-col">
                {currentStage < 5 ? (
                  <ActionZone
                    id={`advance-to-stage-0${currentStage + 1}`}
                    label={`Advance to Stage 0${currentStage + 1}`}
                    hint={`Commit Stage 0${currentStage} diagnostic payload & unlock next questionnaire step`}
                    accepts={['intake_capsule']}
                    icon={<ArrowRight className="w-5 h-5 text-[#2A5BFF]" />}
                    activeColor="bg-[#2A5BFF]/10"
                    onDrop={advanceToNextStage}
                    className="h-full flex-1"
                  />
                ) : (
                  <ActionZone
                    id="launch-decision-matrix-zone"
                    label="Launch Circular Decision Matrix"
                    hint="Evaluate radial pathways (Repair, Reuse, Repurpose, Replace, Recycle) via deterministic engine"
                    accepts={['review_verdict_token', 'intake_capsule']}
                    icon={<Cpu className="w-5 h-5 text-[#10B25A]" />}
                    activeColor="bg-[#10B25A]/10"
                    onDrop={launchDecisionMatrix}
                    className="h-full flex-1"
                  />
                )}
              </div>
            </div>

            {/* Secondary non-mutating navigation / reset bar */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#0B0B0B]/15 text-xs font-mono">
              {currentStage > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 bg-[#FFFDF5] border-2 border-[#0B0B0B] hover:bg-[#F4EFE2] text-[#0B0B0B] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#0B0B0B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Stage</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 bg-[#FFFDF5] border-2 border-[#0B0B0B] hover:bg-[#F4EFE2] text-[#0B0B0B] font-bold flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_#0B0B0B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Dashboard</span>
                </Link>
              )}

              <span className="text-[11px] font-bold text-[#6C6659]">
                Step {currentStage} of 5 Completed
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center font-mono text-xs text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5]">
        <span>R3VIVE Assessment Engine • Verified Deterministic Circular Logic</span>
      </footer>

      {/* Floating Canvas HUD */}
      <CanvasHUD />
    </div>
  );
};

export const Assessment: React.FC = () => {
  return (
    <CanvasProtocolProvider>
      <AssessmentCanvasBody />
    </CanvasProtocolProvider>
  );
};
