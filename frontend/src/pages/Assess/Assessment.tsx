import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { AssessmentData, AssessmentStage } from '../../components/assessment/types';
import { AssessmentStepper } from '../../components/assessment/AssessmentStepper';
import { StepItemIdentity } from '../../components/assessment/StepItemIdentity';
import { StepConditionFault } from '../../components/assessment/StepConditionFault';
import { StepCircumstances } from '../../components/assessment/StepCircumstances';
import { StepAdaptiveQuestions } from '../../components/assessment/StepAdaptiveQuestions';
import { StepReview } from '../../components/assessment/StepReview';
import { ADAPTIVE_QUESTIONS } from '../../components/assessment/questions';
import { useAssessment } from '../../context/AssessmentContext';
import './Assessment.css';

export const Assessment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlAssessmentId = searchParams.get('id');

  const {
    data,
    updateData,
    resetData,
    assessmentId,
    saveStatus,
    saveError,
    currentStep,
    saveAssessment,
    loadAssessment,
  } = useAssessment();

  const [currentStage, setCurrentStage] = useState<AssessmentStage>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If URL has id, load that assessment on mount
  useEffect(() => {
    if (urlAssessmentId && urlAssessmentId !== assessmentId) {
      loadAssessment(urlAssessmentId);
    }
  }, [urlAssessmentId, assessmentId, loadAssessment]);

  // Sync current stage if loaded assessment has a valid step
  useEffect(() => {
    if (currentStep >= 1 && currentStep <= 5 && currentStep !== currentStage) {
      setCurrentStage(currentStep as AssessmentStage);
    }
  }, [currentStep]);

  const handleUpdate = (updates: Partial<AssessmentData>) => {
    updateData(updates);
    // Clear relevant error keys
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

  const handleNext = () => {
    if (!validateStage(currentStage)) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (currentStage < 5) {
      const nextStage = (currentStage + 1) as AssessmentStage;
      setCurrentStage(nextStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Save current assessment progress
      saveAssessment({ currentStep: nextStage, isCompleted: false });
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      const prevStage = (currentStage - 1) as AssessmentStage;
      setCurrentStage(prevStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToStage = (stage: AssessmentStage) => {
    // Allow jumping back to earlier stages or forward if validated
    if (stage <= currentStage || validateStage(currentStage)) {
      setCurrentStage(stage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      saveAssessment({ currentStep: stage, isCompleted: false });
    }
  };

  const handleReset = () => {
    if (window.confirm('Start a fresh assessment? Current unsubmitted answers will be cleared.')) {
      resetData();
      setCurrentStage(1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="assessment-page retro-grid-pattern">
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

          <div className="flex items-center gap-3">
            {/* Persistence Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF5] border border-[#0B0B0B] text-[11px] font-mono shadow-[1px_1px_0px_#0B0B0B]">
              {saveStatus === 'saving' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <span className="font-bold text-[#D97706]">SAVING...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#10B25A]" />
                  <span className="font-bold text-[#10B25A]">SAVED</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#E53E3E]" />
                  <span className="font-bold text-[#E53E3E]" title={saveError || 'Save error'}>
                    LOCAL DRAFT
                  </span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#6C6659]" />
                  <span className="text-[#6C6659]">DRAFT</span>
                </>
              )}
            </div>

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
              className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-1.5 px-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Assessment Container (Clean Item Entry Form) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Stepper Progress Bar */}
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

          {/* Form Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-8 mt-8 border-t-2 border-[#0B0B0B]">
            {currentStage > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="assessment-nav-btn assessment-nav-btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Stage</span>
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="assessment-nav-btn assessment-nav-btn-secondary text-xs"
              >
                <span>Cancel & Return</span>
              </Link>
            )}

            {currentStage < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="assessment-nav-btn ml-auto shadow-[4px_4px_0px_#0B0B0B]"
              >
                <span>Continue to Stage 0{currentStage + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to={`/assess/decision-tree${assessmentId ? `?id=${assessmentId}` : ''}`}
                onClick={() => {
                  saveAssessment({ currentStep: 5, isCompleted: false });
                }}
                className="assessment-nav-btn ml-auto shadow-[4px_4px_0px_#0B0B0B] flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Circular Decision Tree →</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center font-mono text-xs text-[#6C6659] border-t-2 border-[#0B0B0B] bg-[#FFFDF5]">
        <span>R3VIVE Assessment Engine • Clean Diagnostic Entry • Verified Circular Evaluation</span>
      </footer>
    </div>
  );
};
