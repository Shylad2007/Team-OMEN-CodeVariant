import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Wrench, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listUserAssessments, type AssessmentSummaryItem } from '../../services/assessmentApi';

export const ActionPlansSection: React.FC = () => {
  const { session } = useAuth();
  const [completedPlans, setCompletedPlans] = useState<AssessmentSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    let isMounted = true;
    setLoading(true);

    listUserAssessments(token)
      .then((items) => {
        if (!isMounted) return;
        const finished = items.filter((item) => item.is_completed || item.current_step >= 5);
        setCompletedPlans(finished);
      })
      .catch(() => {
        if (isMounted) setCompletedPlans([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  return (
    <section id="action-plans" className="mb-12 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 bg-[#10B25A] border border-[#0B0B0B]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
            Execution Roadmaps
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
          Action Plans
        </h2>
      </div>

      {/* Populated Active Plans Grid */}
      {!loading && completedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {completedPlans.map((plan) => {
            const outcome = (plan.selected_outcome || plan.recommended_outcome || 'repair').toUpperCase();
            return (
              <div
                key={plan.id}
                className="dashboard-card bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#0B0B0B]">
                      {outcome}
                    </span>
                    <span className="font-mono text-[10px] text-[#6C6659] uppercase">
                      {plan.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-[#0B0B0B] mb-1 line-clamp-1">
                    {plan.item_name}
                  </h3>

                  <p className="font-mono text-xs text-[#544E43] mb-4">
                    Target: {plan.condition.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-[#0B0B0B] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#15803D] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Roadmap Ready</span>
                  </span>

                  <Link
                    to={`/assess/action-plan?id=${plan.id}`}
                    className="assessment-nav-btn text-xs py-1.5 px-3 shadow-[2px_2px_0px_#0B0B0B] flex items-center gap-1 font-mono font-bold"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Card with Blueprint Preview */
        <div className="dashboard-card dashboard-bracket p-8 sm:p-12 bg-[#FFFDF5]">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            {/* Retro Icon Illustration */}
            <div className="w-16 h-16 bg-[#F4EFE2] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] flex items-center justify-center mb-5">
              <ListChecks className="w-8 h-8 text-[#0B0B0B]" />
            </div>

            {/* Heading */}
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#0B0B0B] mb-2">
              No Active Action Plans
            </h3>

            {/* Description */}
            <p className="font-sans text-sm text-[#544E43] leading-relaxed mb-8 max-w-lg">
              Action plans bridge the gap between deciding and doing. Once you complete an assessment and select a circular path, R3VIVE prepares a dedicated action checklist.
            </p>

            {/* Action Plan Blueprint Preview */}
            <div className="w-full text-left bg-[#F4EFE2] border-2 border-[#0B0B0B] p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0B0B0B]/20">
                <span className="font-mono text-xs font-bold text-[#0B0B0B] flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-[#2A5BFF]" />
                  WHAT AN ACTION PLAN INCLUDES:
                </span>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B]">
                  Sample Blueprint
                </span>
              </div>

              <ul className="space-y-3 font-mono text-xs">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0B0B0B] block">Component & Tools Checklist</strong>
                    <span className="text-[#6C6659] text-[11px] font-sans">
                      Required screwdrivers, replacement seals, soldering equipment, or donor materials with estimated costs.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0B0B0B] block">Ordered Guidance Steps</strong>
                    <span className="text-[#6C6659] text-[11px] font-sans">
                      Disassembly precautions, cleaning routines, testing procedures, or local certified drop-off locations.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B25A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0B0B0B] block">Lifespan & Waste Tracking</strong>
                    <span className="text-[#6C6659] text-[11px] font-sans">
                      Mark progress completed and record extended years of use and diverted e-waste.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Status Note */}
            <p className="font-mono text-xs text-[#6C6659] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>Action plans will unlock automatically following your first completed assessment.</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
