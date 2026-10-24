import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardFooter: React.FC = () => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      targetEl.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <footer className="mt-16 py-8 border-t-2 border-[#0B0B0B] bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#FFE600] border border-[#0B0B0B] shadow-[1px_1px_0px_#0B0B0B] flex items-center justify-center font-bold text-xs">
            R3
          </div>
          <span className="font-bold text-[#0B0B0B]">R3VIVE</span>
          <span className="text-[#6C6659]">© {new Date().getFullYear()} — Circular Decision Intelligence</span>
        </div>

        <div className="flex items-center gap-4 text-[#6C6659]">
          <Link to="/" className="hover:text-[#0B0B0B] underline transition-colors">
            Homepage
          </Link>
          <span>•</span>
          <a
            href="#decisions"
            onClick={(e) => handleSmoothScroll(e, 'decisions')}
            className="hover:text-[#0B0B0B] transition-colors"
          >
            My Decisions
          </a>
          <span>•</span>
          <a
            href="#action-plans"
            onClick={(e) => handleSmoothScroll(e, 'action-plans')}
            className="hover:text-[#0B0B0B] transition-colors"
          >
            Action Plans
          </a>
          <span>•</span>
          <a
            href="#pathways"
            onClick={(e) => handleSmoothScroll(e, 'pathways')}
            className="hover:text-[#0B0B0B] transition-colors"
          >
            5 Outcomes
          </a>
        </div>

      </div>
    </footer>
  );
};
