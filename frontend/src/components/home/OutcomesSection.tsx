import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { OutcomeData } from './types';

const OUTCOMES_DATA: OutcomeData[] = [
  {
    id: 'repair',
    name: 'Repair',
    tagColor: 'terminal-tag-yellow',
    borderColor: 'border-[#FFE600]',
    badge: 'Highest Net Value',
    summary: 'Restore defective components back to manufacturer or superior operational spec.',
    criteria: 'Parts are obtainable, chassis is sound, and total repair expenses stay under 50% of fair replacement cost.',
    examples: 'Recapping audio amplifiers, desoldering mechanical keyboard switches, swapping vacuum belts, replacing phone screens.',
    nextStep: 'Action plan outlines exact screw layouts, safety steps, and verified replacement parts.'
  },
  {
    id: 'reuse',
    name: 'Reuse',
    tagColor: 'terminal-tag-green',
    borderColor: 'border-[#10B25A]',
    badge: 'Zero Capital Cost',
    summary: 'Redeploy the item in a secondary capacity or re-home it through community networks without modification.',
    criteria: 'Item functions safely but no longer meets your primary performance or aesthetic needs.',
    examples: 'Converting an older tablet into a dedicated kitchen recipe reader; passing down student desks; gifting spare audio equipment.',
    nextStep: 'Action plan provides sanitisation checklists, data wiping standards, and local donation intake networks.'
  },
  {
    id: 'repurpose',
    name: 'Repurpose',
    tagColor: 'terminal-tag-blue',
    borderColor: 'border-[#2A5BFF]',
    badge: 'Creative Upcycling',
    summary: 'Dismantle or adapt components for an entirely different function, unlocking latent utility.',
    criteria: 'Primary function is uneconomical to revive, but key sub-assemblies (motors, chassis, power supplies, optics) remain robust.',
    examples: 'Refitting a vintage radio enclosure with Bluetooth speakers; turning broken power tool motors into bench polishers.',
    nextStep: 'Action plan suggests modular schematics, required conversion brackets, and electrical pinouts.'
  },
  {
    id: 'replace',
    name: 'Replace',
    tagColor: 'terminal-tag-red',
    borderColor: 'border-[#FF3344]',
    badge: 'Efficiency Override',
    summary: 'Retire the item in favor of modern hardware when continued operation is unsafe, energy-crippling, or cost-prohibitive.',
    criteria: 'Catastrophic structural failure, obsolete proprietary parts, or modern efficiency standards reduce total lifecycle cost.',
    examples: 'Replacing a 20-year-old inefficient refrigerator or a cracked carbon fiber bicycle frame that cannot be certified safe.',
    nextStep: 'Action plan specifies optimal repairability index criteria and warranty requirements for the replacement.'
  },
  {
    id: 'recycle',
    name: 'Recycle / Discard',
    tagColor: '',
    borderColor: 'border-[#0B0B0B]',
    badge: 'Responsible Recovery',
    summary: 'Safely divert raw minerals, precious metals, and toxic materials into verified recycling loops.',
    criteria: 'No salvageable sub-assemblies remain; item contains hazardous substances requiring regulated processing.',
    examples: 'Swollen lithium-polymer batteries, crushed LCD panels containing mercury vapor backlights, degraded rubberized cords.',
    nextStep: 'Action plan maps verified e-waste recyclers and prints battery terminal insulation instructions.'
  }
];

export const OutcomesSection: React.FC = () => {
  const { user } = useAuth();
  const [activeOutcomeTab, setActiveOutcomeTab] = useState<number>(0);
  const [showDetailedPlan, setShowDetailedPlan] = useState<boolean>(false);
  const current = OUTCOMES_DATA[activeOutcomeTab];

  return (
    <section id="outcomes" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F4EFE2]">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h2 className="text-3xl sm:text-5xl font-black font-display text-[#0B0B0B] tracking-tight">
            One Evaluation. Five Actionable Pathways.
          </h2>
          <p className="text-base text-[#6C6659] max-w-2xl mt-3 font-medium">
            R3VIVE evaluates each item through a multi-variable matrix to recommend one of five definitive outcomes, backed by transparent criteria.
          </p>
        </div>

        {/* Interactive Outcome Tabs & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {OUTCOMES_DATA.map((outcome, idx) => (
              <button
                key={outcome.id}
                onClick={() => {
                  setActiveOutcomeTab(idx);
                  setShowDetailedPlan(false);
                }}
                className={`outcome-tab-btn ${activeOutcomeTab === idx ? 'active' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-60">0{idx + 1}.</span>
                  <span className="font-black text-base">{outcome.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeOutcomeTab === idx ? 'translate-x-1' : ''}`} />
              </button>
            ))}
          </div>

          {/* Active Outcome Inspector Pane */}
          <div className="lg:col-span-8">
            <div className={`retro-box-lg p-6 sm:p-8 bg-[#FFFDF5] border-3 ${current.borderColor}`}>
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b-2 border-[#0B0B0B]">
                <h3 className="text-2xl sm:text-3xl font-black font-display">
                  {current.name}
                </h3>
                <span className={`terminal-tag ${current.tagColor}`}>
                  {current.badge}
                </span>
              </div>

              <p className="text-base font-medium text-[#262422] mb-6 leading-relaxed">
                {current.summary}
              </p>

              <div className="space-y-4 font-mono text-xs mb-8">
                
                <div className="p-3.5 bg-[#F4EFE2] border-2 border-[#0B0B0B]">
                  <span className="font-bold text-[#0B0B0B] block uppercase mb-1">
                    When this outcome fits:
                  </span>
                  <span className="text-[#262422] font-sans text-xs">
                    {current.criteria}
                  </span>
                </div>

                <div className="p-3.5 bg-[#F4EFE2] border-2 border-[#0B0B0B]">
                  <span className="font-bold text-[#0B0B0B] block uppercase mb-1">
                    Real-world examples:
                  </span>
                  <span className="text-[#262422] font-sans text-xs">
                    {current.examples}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
                  <span className="font-bold text-[#2A5BFF] block uppercase mb-1">
                    Action plan overview:
                  </span>
                  <span className="text-[#262422] font-sans text-xs">
                    {current.nextStep}
                  </span>
                </div>

                {showDetailedPlan && (
                  <div className="p-4 bg-[#FFFDF0] border-2 border-[#FFE600] shadow-[2px_2px_0px_#0B0B0B] space-y-2">
                    <span className="font-bold text-[#0B0B0B] block uppercase mb-1">
                      Detailed Action Roadmap:
                    </span>
                    <ul className="space-y-1.5 text-xs font-sans text-[#262422]">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                        <span><strong>Milestone 1:</strong> Pre-disassembly safety check and visual component triage.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                        <span><strong>Milestone 2:</strong> Verified sourcing index for replacement parts and modular schematics.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                        <span><strong>Milestone 3:</strong> Final testing protocol, lifecycle logging, and persistent progress tracking.</span>
                      </li>
                    </ul>
                  </div>
                )}

              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#0B0B0B]">
                <button
                  type="button"
                  onClick={() => setShowDetailedPlan(!showDetailedPlan)}
                  className="retro-btn retro-btn-secondary text-xs py-2 px-4 font-bold"
                >
                  {showDetailedPlan ? 'Hide Details' : 'View Action Roadmap'}
                </button>

                {user ? (
                  <Link
                    to="/dashboard"
                    className="retro-btn text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    <span>Track in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="retro-btn text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    <span>Sign Up to Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
