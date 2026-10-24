import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ClosingCtaProps {
  onScrollToSimulator: () => void;
}

export const ClosingCta: React.FC<ClosingCtaProps> = ({
  onScrollToSimulator,
}) => {
  const { user } = useAuth();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0B0B] text-[#FFFDF5] border-t-2 border-[#0B0B0B]">
      <div className="max-w-5xl mx-auto text-center">
        
        <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight text-white mb-6">
          Every item has a breaking point. <br />
          Most have a <span className="text-[#FFE600] underline decoration-[#FFE600]">turning point</span>.
        </h2>

        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Stop letting broken appliances and tired equipment sit in closets or landfills. Run an assessment, explore viable pathways, and receive a step-by-step action plan today.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={onScrollToSimulator}
            className="retro-btn text-base py-3.5 px-8 font-bold flex items-center gap-2"
          >
            <Zap className="w-5 h-5 text-[#0B0B0B]" />
            Launch Assessment Simulator
          </button>
          {!user ? (
            <Link
              to="/signup"
              className="retro-btn retro-btn-secondary text-base py-3.5 px-7 font-bold"
            >
              Create Free Account
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="retro-btn retro-btn-secondary text-base py-3.5 px-7 font-bold"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

      </div>
    </section>
  );
};
