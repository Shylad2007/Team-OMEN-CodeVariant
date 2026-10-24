import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const BreakEvenCalculator: React.FC = () => {
  const [compRepairCost, setCompRepairCost] = useState<number>(45);
  const [compReplaceCost, setCompReplaceCost] = useState<number>(220);
  const [compLifespanYears, setCompLifespanYears] = useState<number>(4);

  const moneySaved = Math.max(0, compReplaceCost - compRepairCost);
  const salvageRatio = Math.round((compRepairCost / Math.max(1, compReplaceCost)) * 100);
  const annualisedRepairCost = (compRepairCost / Math.max(1, compLifespanYears)).toFixed(1);

  return (
    <section id="comparator" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F4EFE2]">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Explanatory Left Column */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0B0B0B] leading-tight mb-4">
              The Calculus of Keeping. <br />
              Repair vs. Replace.
            </h2>
            <p className="text-base text-[#262422] leading-relaxed mb-6 font-medium">
              Most repair decisions fail because people compare an immediate repair quote against an imaginary perfect brand-new replacement.
            </p>
            <p className="text-sm text-[#6C6659] leading-relaxed mb-6">
              R3VIVE factors in remaining expected service life, replacement cost, and parts feasibility to calculate a practical financial comparison.
            </p>

            <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#10B25A] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clearly separates estimates from verified figures</span>
              </div>
              <div className="flex items-center gap-2 text-[#2A5BFF] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transparent cost calculations</span>
              </div>
              <div className="flex items-center gap-2 text-[#0B0B0B] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Annualized cost breakdown</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Card */}
          <div className="lg:col-span-7">
            <div className="retro-box-lg bg-[#FFFDF5] p-6 sm:p-8">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#0B0B0B]">
                <h3 className="font-mono text-sm font-bold text-[#0B0B0B] uppercase">
                  Break-Even Calculator
                </h3>
              </div>

              {/* Slider 1: Repair Cost */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1 font-mono text-xs">
                  <span className="font-bold">Estimated Repair Cost (Parts + Tools):</span>
                  <span className="font-black text-sm bg-[#FFE600] px-2 py-0.5 border border-[#0B0B0B]">
                    {compRepairCost}
                  </span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={compRepairCost}
                  onChange={(e) => setCompRepairCost(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6C6659] mt-0.5">
                  <span>10 (DIY Belt/Fuse)</span>
                  <span>150 (Subsystem)</span>
                  <span>300 (Complex Overhaul)</span>
                </div>
              </div>

              {/* Slider 2: Replacement Cost */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1 font-mono text-xs">
                  <span className="font-bold">Cost of Equivalent New Item:</span>
                  <span className="font-black text-sm bg-white px-2 py-0.5 border border-[#0B0B0B]">
                    {compReplaceCost}
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="800"
                  step="10"
                  value={compReplaceCost}
                  onChange={(e) => setCompReplaceCost(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6C6659] mt-0.5">
                  <span>50 (Entry-Level)</span>
                  <span>400 (Mid-Range)</span>
                  <span>800 (Premium)</span>
                </div>
              </div>

              {/* Slider 3: Expected Added Lifespan */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1 font-mono text-xs">
                  <span className="font-bold">Expected Additional Service Life:</span>
                  <span className="font-black text-sm bg-[#2A5BFF] text-white px-2 py-0.5 border border-[#0B0B0B]">
                    {compLifespanYears} Years
                  </span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={compLifespanYears}
                  onChange={(e) => setCompLifespanYears(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
              </div>

              {/* Computed Result Box */}
              <div className="bg-[#F4EFE2] border-2 border-[#0B0B0B] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                <div className="p-2 bg-white border border-[#0B0B0B]">
                  <div className="text-[10px] text-[#6C6659] uppercase font-bold">Capital Retained</div>
                  <div className="text-xl font-black text-[#10B25A] mt-1">{moneySaved}</div>
                </div>
                <div className="p-2 bg-white border border-[#0B0B0B]">
                  <div className="text-[10px] text-[#6C6659] uppercase font-bold">Repair to Replace Ratio</div>
                  <div className="text-xl font-black text-[#0B0B0B] mt-1">{salvageRatio}%</div>
                </div>
                <div className="p-2 bg-white border border-[#0B0B0B]">
                  <div className="text-[10px] text-[#6C6659] uppercase font-bold">Annualized Cost</div>
                  <div className="text-xl font-black text-[#2A5BFF] mt-1">{annualisedRepairCost}/yr</div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-mono">
                <span className={`font-bold px-2 py-1 border border-[#0B0B0B] ${
                  salvageRatio <= 40 ? 'bg-[#10B25A] text-white' :
                  salvageRatio <= 65 ? 'bg-[#FFE600] text-black' :
                  'bg-[#FF3344] text-white'
                }`}>
                  {salvageRatio <= 40 ? 'Favors repair' :
                   salvageRatio <= 65 ? 'Marginal viability' :
                   'Favors replacement'}
                </span>

                <Link
                  to="/assess"
                  className="font-bold text-[#2A5BFF] hover:text-[#0B0B0B] hover:underline flex items-center gap-1"
                >
                  <span>Evaluate your real item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
