import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HomeNavbarProps {
  onScrollToSimulator: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  onScrollToSimulator,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#F4EFE2] border-b-2 border-[#0B0B0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Tagline */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-xl group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              R3
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter font-display leading-none">
                R3VIVE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#6C6659] uppercase font-bold mt-0.5">
                Rethink • Repair • Reimagine
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 font-mono text-sm font-semibold">
          <a href="#simulator" className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors">
            Simulator
          </a>
          <a href="#outcomes" className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors">
            Five Outcomes
          </a>
          <a href="#journey" className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors">
            How It Works
          </a>
          <a href="#comparator" className="text-[#0B0B0B] hover:text-[#2A5BFF] transition-colors">
            Break-Even Calculator
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {!user && (
            <Link 
              to="/login"
              className="retro-btn retro-btn-secondary text-xs py-2 px-3.5 font-mono font-bold"
            >
              Sign In
            </Link>
          )}

          <button 
            onClick={onScrollToSimulator}
            className="retro-btn text-xs py-2 px-4 flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Start Assessment
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 border-2 border-[#0B0B0B] bg-[#FFFDF5] shadow-[2px_2px_0px_#0B0B0B]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDF5] border-t-2 border-[#0B0B0B] p-4 flex flex-col gap-3 font-mono text-sm">
          <a 
            href="#simulator" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border border-[#0B0B0B] bg-[#F4EFE2] font-semibold"
          >
            Diagnostic Simulator
          </a>
          <a 
            href="#outcomes" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border border-[#0B0B0B] bg-[#F4EFE2] font-semibold"
          >
            The 5 Outcomes
          </a>
          <a 
            href="#journey" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border border-[#0B0B0B] bg-[#F4EFE2] font-semibold"
          >
            How It Works
          </a>
          <a 
            href="#comparator" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border border-[#0B0B0B] bg-[#F4EFE2] font-semibold"
          >
            Break-Even Calculator
          </a>

          <div className="flex gap-2 pt-2">
            {!user ? (
              <>
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="retro-btn retro-btn-secondary text-xs py-2 flex-1 text-center font-bold"
                >
                  Sign In
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onScrollToSimulator();
                  }}
                  className="retro-btn text-xs py-2 flex-1 font-bold"
                >
                  Assess Item
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onScrollToSimulator();
                }}
                className="retro-btn text-xs py-2 w-full font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Start Assessment
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
