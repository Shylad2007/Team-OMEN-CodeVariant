import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { Sparkles, Compass, Plus } from 'lucide-react';
import { DraggableCard, ActionZone } from '../canvas';

interface WelcomeSectionProps {
  userDisplayName: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userDisplayName }) => {
  const { startNewAssessment } = useAssessment();
  const navigate = useNavigate();

  const handleLaunchIntake = () => {
    const freshId = startNewAssessment();
    navigate(`/assess?id=${freshId}`);
  };

  return (
    <section className="mb-12">
      <div className="dashboard-card dashboard-bracket p-6 sm:p-10 bg-[#FFFDF5]">
        
        {/* Top Tag & Greeting */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="dashboard-badge">
            Circular Workspace
          </span>
          <span className="font-mono text-xs font-bold text-[#6C6659]">
            Welcome back, {userDisplayName}
          </span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="text-3xl sm:text-5xl font-black font-display text-[#0B0B0B] tracking-tight leading-[1.08] mb-4">
          Give your things <br className="hidden sm:inline" />
          <span className="inline-block bg-[#FFE600] px-2 py-0.5 border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] mt-1 sm:mt-0">
            a second life.
          </span>
        </h1>

        {/* Introduction */}
        <p className="font-sans text-base sm:text-lg text-[#262422] max-w-2xl leading-relaxed mb-6">
          Before discarding an item or rushing to replace it, evaluate its condition and explore five
          practical pathways: <strong>repair</strong>, <strong>reuse</strong>, <strong>repurpose</strong>,{' '}
          <strong>replace</strong>, or <strong>recycle</strong>. Get honest trade-offs, break-even
          comparisons, and a realistic plan to move forward.
        </p>

        {/* Action Deck */}
        <div className="pt-6 border-t-2 border-[#0B0B0B]/15">
          <div className="mb-2 font-mono text-[10.5px] font-bold text-[#6C6659] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FFE600] border border-[#0B0B0B] inline-block" />
            <span>Drag the intake card to begin (or press Space + Enter)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-4">
            {/* Draggable Intake Token */}
            <DraggableCard
              payload={{
                type: 'new_assessment_token',
                id: 'new_intake_token',
                title: 'Item Intake Token',
                subtitle: 'Diagnostic evaluation capsule',
                badge: 'TOKEN',
                badgeColor: 'bg-[#FFE600] text-[#0B0B0B]',
              }}
              onCardClick={handleLaunchIntake}
              className="h-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center font-black shadow-[2px_2px_0px_#0B0B0B] shrink-0">
                  <Plus className="w-5 h-5 text-[#0B0B0B]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm sm:text-base text-[#0B0B0B] leading-tight">
                    Item Intake Payload Card
                  </h4>
                  <p className="font-mono text-xs text-[#6C6659] mt-0.5">
                    Click to grab or drag directly into initialization zone →
                  </p>
                </div>
              </div>
            </DraggableCard>

            {/* Action Zone: Initialize Intake */}
            <ActionZone
              id="zone_initialize_intake"
              accepts={['new_assessment_token']}
              label="Initialize Item Assessment"
              hint="Drop Intake Payload here to generate new unique ID and open questionnaire"
              icon={<Sparkles className="w-4 h-4 text-[#0B0B0B]" />}
              activeColor="bg-[#FFE600]"
              onDrop={handleLaunchIntake}
              className="border-2 border-dashed border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]"
            />
          </div>

          {/* Secondary Permitted Navigation */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/"
              className="font-mono text-xs font-bold text-[#2A5BFF] hover:underline flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#2A5BFF]" />
              <span>Explore Homepage Simulator →</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
