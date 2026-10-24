import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

interface DashboardHeaderProps {
  userDisplayName?: string;
  userEmail?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onSignOut,
  isSigningOut = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-2 md:grid-cols-3 items-center">
        
        {/* Brand & Tagline - Column 1 (Left-aligned) */}
        <div className="justify-self-start flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-xl group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              R3
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter font-display leading-none text-[#0B0B0B]">
                R3VIVE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#6C6659] uppercase font-bold mt-0.5">
                Rethink • Repair • Reimagine
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Nav Links - Column 2 (Genuinely Centered relative to container/viewport) */}
        <nav className="hidden md:flex justify-self-center items-center gap-6 lg:gap-8 font-mono text-xs font-bold">
          <a
            href="#decisions"
            onClick={(e) => handleSmoothScroll(e, 'decisions')}
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            My Decisions
          </a>
          <a
            href="#action-plans"
            onClick={(e) => handleSmoothScroll(e, 'action-plans')}
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            Action Plans
          </a>
          <a
            href="#pathways"
            onClick={(e) => handleSmoothScroll(e, 'pathways')}
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            5 Outcomes
          </a>
        </nav>

        {/* Right Actions & Account Controls - Column 3 (Right-aligned) */}
        <div className="justify-self-end flex items-center gap-3">
          {/* Logout Button */}
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="hidden sm:flex retro-btn retro-btn-secondary text-xs py-2 px-3.5 items-center gap-1.5 font-bold"
            title="Sign out of this session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 border-2 border-[#0B0B0B] bg-[#FFFDF5] shadow-[2px_2px_0px_#0B0B0B]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#0B0B0B] bg-[#FFFDF5] p-4 space-y-4">
          <div className="flex flex-col space-y-2 font-mono text-xs font-bold">
            <a
              href="#decisions"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleSmoothScroll(e, 'decisions');
              }}
              className="p-2 hover:bg-[#F4EFE2] border border-transparent hover:border-[#0B0B0B]"
            >
              My Decisions
            </a>
            <a
              href="#action-plans"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleSmoothScroll(e, 'action-plans');
              }}
              className="p-2 hover:bg-[#F4EFE2] border border-transparent hover:border-[#0B0B0B]"
            >
              Action Plans
            </a>
            <a
              href="#pathways"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleSmoothScroll(e, 'pathways');
              }}
              className="p-2 hover:bg-[#F4EFE2] border border-transparent hover:border-[#0B0B0B]"
            >
              5 Circular Outcomes
            </a>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSignOut();
            }}
            disabled={isSigningOut}
            className="retro-btn w-full text-xs py-2.5 px-3 flex items-center justify-center gap-2 font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
