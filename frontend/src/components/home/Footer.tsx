import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFDF5] border-t-2 border-[#0B0B0B] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b-2 border-[#0B0B0B]">
          
          {/* Col 1: Wordmark & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] flex items-center justify-center font-mono font-black text-sm">
                R3
              </div>
              <span className="font-black text-xl font-display tracking-tight">R3VIVE</span>
            </div>
            <p className="font-mono text-xs font-bold text-[#6C6659] mb-4">
              Rethink. Repair. Reimagine.
            </p>
            <p className="text-xs text-[#262422] max-w-sm leading-relaxed">
              A purpose-built decision platform helping people make practical, informed choices about damaged, unwanted, or ageing items.
            </p>
          </div>

          {/* Col 2: The 5 Outcomes */}
          <div>
            <h5 className="font-mono text-xs font-black uppercase text-[#0B0B0B] mb-3">
              Outcomes
            </h5>
            <ul className="font-mono text-xs space-y-2 text-[#6C6659]">
              <li><a href="#outcomes" className="hover:text-[#0B0B0B] hover:underline">Repair</a></li>
              <li><a href="#outcomes" className="hover:text-[#0B0B0B] hover:underline">Reuse</a></li>
              <li><a href="#outcomes" className="hover:text-[#0B0B0B] hover:underline">Repurpose</a></li>
              <li><a href="#outcomes" className="hover:text-[#0B0B0B] hover:underline">Replace</a></li>
              <li><a href="#outcomes" className="hover:text-[#0B0B0B] hover:underline">Recycle or Discard</a></li>
            </ul>
          </div>

          {/* Col 3: Navigation Links */}
          <div>
            <h5 className="font-mono text-xs font-black uppercase text-[#0B0B0B] mb-3">
              Explore
            </h5>
            <ul className="font-mono text-xs space-y-2 text-[#6C6659]">
              <li><a href="#simulator" className="hover:text-[#0B0B0B] hover:underline">Diagnostic Simulator</a></li>
              <li><a href="#journey" className="hover:text-[#0B0B0B] hover:underline">How It Works</a></li>
              <li><a href="#comparator" className="hover:text-[#0B0B0B] hover:underline">Break-Even Calculator</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#6C6659]">
          <div>
            © {new Date().getFullYear()} R3VIVE. Rethink. Repair. Reimagine.
          </div>
          <div>
            All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
