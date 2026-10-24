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

  return (
    <header className="bg-[#F4EFE2] border-b-2 border-[#0B0B0B] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4">
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

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold">
          <a
            href="#decisions"
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            My Decisions
          </a>
          <a
            href="#action-plans"
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            Action Plans
          </a>
          <a
            href="#pathways"
            className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors py-1 border-b-2 border-transparent hover:border-[#2A5BFF]"
          >
            5 Outcomes
          </a>
        </nav>

        {/* Right Actions & Account Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Logout Button */}
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="retro-btn retro-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold"
            title="Sign out of this session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-[#0B0B0B] bg-[#FFFDF5] shadow-[2px_2px_0px_#0B0B0B]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t-2 border-[#0B0B0B] bg-[#FFFDF5] p-4 space-y-4">
          <div className="flex flex-col space-y-2 font-mono text-xs font-bold">
            <a
              href="#decisions"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-[#F4EFE2] border border-transparent hover:border-[#0B0B0B]"
            >
              My Decisions
            </a>
            <a
              href="#action-plans"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-[#F4EFE2] border border-transparent hover:border-[#0B0B0B]"
            >
              Action Plans
            </a>
            <a
              href="#pathways"
              onClick={() => setMobileMenuOpen(false)}
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
