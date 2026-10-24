import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { DiagnosticSimulator } from './DiagnosticSimulator';

export const Hero: React.FC = () => {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-20 overflow-hidden retro-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.05] text-[#0B0B0B] mb-6">
              Don’t default to landfill. <br />
              <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-[#0B0B0B] inline-block shadow-[3px_3px_0px_#0B0B0B] mt-2">
                Rethink. Repair.
              </span> <br />
              Reimagine.
            </h1>

            <p className="text-lg text-[#262422] font-medium leading-relaxed mb-8 max-w-xl">
              Every year, billions of dollars of repairable electronics, tools, and appliances are tossed because deciding what to do is an opaque guessing game. 
              <strong className="text-[#0B0B0B] font-bold"> R3VIVE</strong> replaces the guesswork with an intelligent evaluation pipeline: balance repair viability against true replacement cost, explore 5 distinct outcomes, and follow a concrete action plan.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a 
                href="#simulator"
                className="retro-btn text-sm py-3 px-6 flex items-center gap-2.5 font-bold"
              >
                <Zap className="w-4 h-4" />
                Try Diagnostic Simulator
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="#outcomes" 
                className="retro-btn retro-btn-secondary text-sm py-3 px-5 font-bold"
              >
                Inspect the 5 Outcomes
              </a>
            </div>

            {/* Data Callouts */}
            <div className="pt-6 border-t-2 border-[#0B0B0B] grid grid-cols-3 gap-3 font-mono">
              <div className="p-2.5 bg-[#FFFDF5] border border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
                <div className="text-xl font-black text-[#0B0B0B]">54M t</div>
                <div className="text-[11px] text-[#6C6659] uppercase font-bold leading-tight mt-0.5">Annual Global E-Waste</div>
              </div>
              <div className="p-2.5 bg-[#FFFDF5] border border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
                <div className="text-xl font-black text-[#10B25A]">72%</div>
                <div className="text-[11px] text-[#6C6659] uppercase font-bold leading-tight mt-0.5">Viable With Triage</div>
              </div>
              <div className="p-2.5 bg-[#FFFDF5] border border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]">
                <div className="text-xl font-black text-[#2A5BFF]">5 Pathways</div>
                <div className="text-[11px] text-[#6C6659] uppercase font-bold leading-tight mt-0.5">Beyond Keep / Toss</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Diagnostic Simulator Centerpiece */}
          <div id="simulator" className="lg:col-span-6">
            <DiagnosticSimulator />
          </div>

        </div>

      </div>
    </section>
  );
};
