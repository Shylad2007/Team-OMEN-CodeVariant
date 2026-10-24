import React from 'react';

export const TickerMarquee: React.FC = () => {
  return (
    <div className="bg-[#FFE600] border-b-2 border-[#0B0B0B] overflow-hidden py-1.5 font-mono text-xs font-black tracking-wider uppercase">
      <div className="ticker-track flex items-center gap-6 whitespace-nowrap">
        <span>◆ RETHINK. REPAIR. REIMAGINE.</span>
        <span>◆ REPAIR • REUSE • REPURPOSE • REPLACE • RECYCLE</span>
        <span>◆ CLEAR DECISION PATHWAYS</span>
        <span>◆ TRANSPARENT COST COMPARISONS</span>
        <span>◆ ACTIONABLE NEXT STEPS</span>
        <span>◆ RETHINK. REPAIR. REIMAGINE.</span>
        <span>◆ REPAIR • REUSE • REPURPOSE • REPLACE • RECYCLE</span>
        <span>◆ CLEAR DECISION PATHWAYS</span>
        <span>◆ TRANSPARENT COST COMPARISONS</span>
        <span>◆ ACTIONABLE NEXT STEPS</span>
      </div>
    </div>
  );
};
