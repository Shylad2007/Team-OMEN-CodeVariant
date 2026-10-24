import React from 'react';
import { 
  Compass, 
  Layers, 
  Sparkles, 
  Cpu, 
  Sliders, 
  Wrench, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    icon: <Compass className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Identify item model, age, symptoms, and expectations.'
  },
  {
    num: '02',
    title: 'Assess',
    icon: <Layers className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Answer targeted questions tailored to your item condition.'
  },
  {
    num: '03',
    title: 'Explore',
    icon: <Sparkles className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Weigh viability across repair, reuse, repurpose, replace, and recycle.'
  },
  {
    num: '04',
    title: 'Decide',
    icon: <Cpu className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Receive a personalized recommendation with clear reasoning.'
  },
  {
    num: '05',
    title: 'Compare',
    icon: <Sliders className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Compare repair versus replacement costs, effort, and longevity.'
  },
  {
    num: '06',
    title: 'Act',
    icon: <Wrench className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Follow practical step-by-step guidance and safety notes.'
  },
  {
    num: '07',
    title: 'Track',
    icon: <CheckCircle2 className="w-4 h-4 text-[#0B0B0B]" />,
    desc: 'Save your decision, track your progress, and revisit anytime.'
  }
];

export const JourneySection: React.FC = () => {
  return (
    <section id="journey" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFDF5] border-y-2 border-[#0B0B0B] retro-dot-pattern">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black font-display text-[#0B0B0B]">
            From Broken Item to Concrete Action
          </h2>
          <p className="text-sm font-mono text-[#6C6659] mt-3">
            R3VIVE guides you through a clear, reversible 7-step process from initial assessment to action.
          </p>
        </div>

        {/* Stepper Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {STEPS.map((step) => (
            <div 
              key={step.num}
              className="retro-box p-4 bg-[#FFFDF5] flex flex-col justify-between hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#0B0B0B] pb-2">
                  <span className="font-mono text-xs font-black bg-[#FFE600] px-1.5 py-0.5 border border-[#0B0B0B]">
                    {step.num}
                  </span>
                  {step.icon}
                </div>
                <h4 className="font-display font-black text-lg mb-2 text-[#0B0B0B]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#262422] leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reversibility Note */}
        <div className="mt-10 p-4 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center gap-3 font-mono text-xs">
          <RotateCcw className="w-4 h-4 text-[#2A5BFF] shrink-0" />
          <span><strong>Reversible progression:</strong> You can revisit previous steps, adjust your answers, and recalculate outcomes at any point.</span>
        </div>

      </div>
    </section>
  );
};
