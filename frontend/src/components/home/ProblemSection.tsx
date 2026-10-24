import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFDF5] border-y-2 border-[#0B0B0B]">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b-2 border-[#0B0B0B]">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0B0B0B]">
              Why Do We Discard Things That Can Live?
            </h2>
          </div>
          <p className="text-sm font-mono text-[#6C6659] max-w-md mt-4 md:mt-0">
            The modern economy is engineered for rapid replacement. R3VIVE restores transparency to the decision before an item hits the curb.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Dilemma 01 */}
          <div className="retro-box p-6 bg-[#F4EFE2] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black font-display mb-3">The "Replace Reflex"</h3>
              <p className="text-sm text-[#262422] leading-relaxed mb-4">
                When a microwave button jams or a vacuum loses suction, one-click ordering makes buying a cheap replacement faster than diagnosing the issue. The result is compounding waste and declining build quality in our homes.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#0B0B0B] font-mono text-xs text-[#0B0B0B]">
              <strong className="text-[#FF3344]">The R3VIVE Solution:</strong> An intuitive triage process clarifies whether the fix takes 10 minutes or requires skilled help.
            </div>
          </div>

          {/* Dilemma 02 */}
          <div className="retro-box p-6 bg-[#F4EFE2] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black font-display mb-3">The Information Vacuum</h3>
              <p className="text-sm text-[#262422] leading-relaxed mb-4">
                Repair quotes are arbitrary and parts diagrams can be difficult to navigate. Without clear break-even metrics, it is hard to know whether a repair makes financial sense.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#0B0B0B] font-mono text-xs text-[#0B0B0B]">
              <strong className="text-[#2A5BFF]">The R3VIVE Solution:</strong> Transparent cost comparisons separate verified estimates from guesswork.
            </div>
          </div>

          {/* Dilemma 03 */}
          <div className="retro-box p-6 bg-[#F4EFE2] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black font-display mb-3">The Binary Trap</h3>
              <p className="text-sm text-[#262422] leading-relaxed mb-4">
                People often assume an item either works perfectly or belongs in the trash. That mindset overlooks repurposing components, redeploying for secondary duties, or regulated recycling.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#0B0B0B] font-mono text-xs text-[#0B0B0B]">
              <strong className="text-[#10B25A]">The R3VIVE Solution:</strong> A five-outcome spectrum creates practical pathways for every physical good.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
