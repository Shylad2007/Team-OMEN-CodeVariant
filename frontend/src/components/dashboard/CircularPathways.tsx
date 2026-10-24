import React from 'react';
import { Wrench, Repeat, Lightbulb, RefreshCw, Trash2 } from 'lucide-react';

export const CircularPathways: React.FC = () => {
  const outcomes = [
    {
      id: 'repair',
      name: 'Repair',
      badgeColor: '#2A5BFF',
      textColor: '#FFFDF5',
      icon: Wrench,
      description: 'Fix broken components, replace wear parts, and restore full working order to extend lifespan.',
      idealFor: 'Failed heating elements, cracked screens, loose solder joints, worn cables.',
    },
    {
      id: 'reuse',
      name: 'Reuse',
      badgeColor: '#10B25A',
      textColor: '#FFFDF5',
      icon: Repeat,
      description: 'Keep the item functioning as intended or pass it along to another user without significant modification.',
      idealFor: 'Outgrown equipment, fully operational electronics, unwanted furniture.',
    },
    {
      id: 'repurpose',
      name: 'Repurpose',
      badgeColor: '#FFE600',
      textColor: '#0B0B0B',
      icon: Lightbulb,
      description: 'Transform an item into something new with an alternate second-life purpose or creative utility.',
      idealFor: 'Old tablets as digital wall clocks, vintage luggage as side tables, chassis into shelving.',
    },
    {
      id: 'replace',
      name: 'Replace',
      badgeColor: '#FF9500',
      textColor: '#0B0B0B',
      icon: RefreshCw,
      description: 'Upgrade responsibly when repair costs exceed fair market value or severe energy inefficiency hurts the environment.',
      idealFor: 'Obsolete appliances with extreme power draw, unrepairable motherboard burnout.',
    },
    {
      id: 'recycle',
      name: 'Recycle',
      badgeColor: '#FF3344',
      textColor: '#FFFDF5',
      icon: Trash2,
      description: 'Channel hazardous materials, heavy metals, and rare earth minerals into certified circular recycling streams.',
      idealFor: 'Swollen lithium batteries, shattered CRT displays, irreparable shredded components.',
    },
  ];

  return (
    <section id="pathways" className="mb-12 scroll-mt-24">
      
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 bg-[#FFE600] border border-[#0B0B0B]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
            Methodology Primer
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
          Five Circular Pathways
        </h2>
        <p className="font-sans text-sm text-[#544E43] mt-1">
          Every assessment balances practicality, repairability scores, and economics across these five outcomes.
        </p>
      </div>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outcomes.map((outcome) => {
          const Icon = outcome.icon;
          return (
            <div
              key={outcome.id}
              className="dashboard-card p-5 bg-[#FFFDF5] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-xs font-black uppercase px-2 py-0.5 border border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]"
                    style={{ backgroundColor: outcome.badgeColor, color: outcome.textColor }}
                  >
                    {outcome.name}
                  </span>
                  <div className="w-7 h-7 bg-[#F4EFE2] border border-[#0B0B0B] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#0B0B0B]" />
                  </div>
                </div>

                <p className="font-sans text-xs text-[#262422] leading-relaxed mb-3">
                  {outcome.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#0B0B0B]/15 font-mono text-[11px]">
                <span className="text-[#6C6659] block font-bold mb-0.5">COMMON CANDIDATES:</span>
                <span className="text-[#0B0B0B]">{outcome.idealFor}</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
