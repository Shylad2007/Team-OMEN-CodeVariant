import React from 'react';
import { GitFork, CheckCircle2 } from 'lucide-react';
import type { AssessmentData } from './types';
import { ADAPTIVE_QUESTIONS } from './questions';

interface StepAdaptiveQuestionsProps {
  data: AssessmentData;
  onChange: (updates: Partial<AssessmentData>) => void;
  errors: Record<string, string>;
}

export const StepAdaptiveQuestions: React.FC<StepAdaptiveQuestionsProps> = ({
  data,
  onChange,
  errors,
}) => {
  // Filter questions tailored to current category
  const relevantQuestions = ADAPTIVE_QUESTIONS.filter(
    (q) => q.categoryId === data.category || (data.category === 'other' && q.categoryId === 'other')
  );

  const questionsToRender = relevantQuestions.length > 0 ? relevantQuestions : ADAPTIVE_QUESTIONS.slice(0, 2);

  const handleSelectOption = (questionId: string, optionValue: string) => {
    const updated = {
      ...data.adaptiveAnswers,
      [questionId]: optionValue,
    };
    onChange({ adaptiveAnswers: updated });
  };

  return (
    <div className="space-y-8">
      {/* Stage Explainer Banner */}
      <div className="p-4 bg-[#F4EFE2] border-2 border-[#0B0B0B] font-mono text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-[#0B0B0B]">
          <GitFork className="w-4 h-4 text-[#2A5BFF]" />
          <span>STAGE 4 GOAL: CATEGORY-SPECIFIC ADAPTIVE DIAGNOSTICS</span>
        </div>
        <p className="text-[#544E43] font-sans text-xs leading-relaxed">
          Based on your item category and condition grade, these targeted follow-up questions evaluate modularity, component failure points, and feasibility of repair or reuse.
        </p>
      </div>

      {/* Adaptive Questions List */}
      <div className="space-y-8">
        {questionsToRender.map((question, qIndex) => {
          const selectedValue = data.adaptiveAnswers[question.id];
          const hasError = Boolean(errors[question.id]);

          return (
            <div
              key={question.id}
              className={`p-5 sm:p-6 border-2 transition-all ${
                hasError
                  ? 'border-[#FF3344] bg-[#FFF6F6]'
                  : selectedValue
                  ? 'border-[#0B0B0B] bg-[#FFFDF5] shadow-[4px_4px_0px_#0B0B0B]'
                  : 'border-[#0B0B0B] bg-[#FFFDF5] shadow-[2px_2px_0px_#0B0B0B]'
              }`}
            >
              {/* Question Number & Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B]">
                  QUESTION 0{qIndex + 1}
                </span>
                {selectedValue && (
                  <span className="font-mono text-[10px] font-bold text-[#10B25A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ANSWER RECORDED
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black font-display text-[#0B0B0B] mb-1">
                {question.title}
              </h3>
              <p className="text-xs text-[#262422] font-mono font-bold mb-2">
                {question.subtitle}
              </p>

              {/* Rationale pill */}
              <p className="text-xs font-sans text-[#544E43] italic mb-4 p-2.5 bg-[#F4EFE2] border-l-3 border-[#2A5BFF]">
                <strong>Why we ask:</strong> {question.explanation}
              </p>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {question.options.map((option) => {
                  const isSelected = selectedValue === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectOption(question.id, option.value)}
                      className={`
                        w-full p-3.5 border-2 text-left transition-all flex items-start gap-3
                        ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5 font-bold' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2]'}
                      `}
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-[#0B0B0B] mt-0.5 flex items-center justify-center shrink-0 bg-[#FFFDF5]">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#0B0B0B]" />}
                      </div>

                      <div className="flex-1">
                        <span className="font-mono text-xs text-[#0B0B0B] block leading-snug">
                          {option.label}
                        </span>
                        {option.hint && (
                          <span className="text-[11px] text-[#6C6659] font-sans block mt-0.5">
                            {option.hint}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasError && (
                <p className="auth-error-msg mt-2" role="alert">
                  Please select an option for this branch before continuing.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
