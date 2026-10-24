import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

interface WelcomeSectionProps {
  userDisplayName: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userDisplayName }) => {
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
        <p className="font-sans text-base sm:text-lg text-[#262422] max-w-2xl leading-relaxed mb-8">
          Before discarding an item or rushing to replace it, evaluate its condition and explore five
          practical pathways: <strong>repair</strong>, <strong>reuse</strong>, <strong>repurpose</strong>,{' '}
          <strong>replace</strong>, or <strong>recycle</strong>. Get honest trade-offs, break-even
          comparisons, and a realistic plan to move forward.
        </p>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t-2 border-[#0B0B0B]/15">
          {/* Primary Action Button */}
          <Link
            to="/assess"
            className="retro-btn text-sm sm:text-base py-3.5 px-6 font-mono font-black flex items-center gap-2 group shadow-[4px_4px_0px_#0B0B0B] hover:shadow-[5px_5px_0px_#0B0B0B]"
          >
            <Sparkles className="w-4 h-4 text-[#0B0B0B]" />
            <span>Assess an Item</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary Action */}
          <Link
            to="/"
            className="retro-btn retro-btn-secondary text-xs sm:text-sm py-3 px-5 font-mono font-bold flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#2A5BFF]" />
            <span>Explore Homepage Simulator</span>
          </Link>
        </div>

      </div>
    </section>
  );
};
