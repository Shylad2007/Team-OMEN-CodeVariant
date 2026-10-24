import React from 'react';
import { Tv, Coffee, Shirt, Armchair, Wrench, Package, HelpCircle } from 'lucide-react';
import type { AssessmentData } from './types';
import { CATEGORIES } from './questions';

interface StepItemIdentityProps {
  data: AssessmentData;
  onChange: (updates: Partial<AssessmentData>) => void;
  errors: Record<string, string>;
}

export const StepItemIdentity: React.FC<StepItemIdentityProps> = ({
  data,
  onChange,
  errors,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="w-5 h-5" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Armchair':
        return <Armchair className="w-5 h-5" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stage Explainer Banner */}
      <div className="p-4 bg-[#F4EFE2] border-2 border-[#0B0B0B] font-mono text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-[#0B0B0B]">
          <HelpCircle className="w-4 h-4 text-[#2A5BFF]" />
          <span>STAGE 1 GOAL: ITEM IDENTIFICATION</span>
        </div>
        <p className="text-[#544E43] font-sans text-xs leading-relaxed">
          Circular decision pathways vary significantly across material classes. Categorizing your item ensures our diagnostic branches present relevant failure modes (such as battery degradation vs. wood splitting vs. fabric fraying).
        </p>
      </div>

      {/* Item Name Input */}
      <div>
        <label htmlFor="item-name" className="assessment-label">
          <span className="assessment-label-title">
            1. Item Name / Description <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-2 font-sans">
          Give a specific name or brief description of what you are evaluating.
        </p>
        <input
          id="item-name"
          type="text"
          value={data.itemName}
          onChange={(e) => onChange({ itemName: e.target.value })}
          placeholder="e.g. Breville Espresso Machine BES870, Leather Work Boots, 27-inch Monitor"
          className={`auth-input text-base ${errors.itemName ? 'has-error' : ''}`}
        />
        {errors.itemName && (
          <p className="auth-error-msg mt-1.5" role="alert">
            {errors.itemName}
          </p>
        )}
      </div>

      {/* Category Selection Grid */}
      <div>
        <label className="assessment-label mb-1">
          <span className="assessment-label-title">
            2. Primary Category <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-4 font-sans">
          Select the category that best matches your item's material and operational nature.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id })}
                className={`
                  p-4 border-2 text-left transition-all flex items-start gap-3.5
                  ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] shadow-[2px_2px_0px_#0B0B0B]'}
                `}
              >
                <div className={`p-2 border border-[#0B0B0B] ${isSelected ? 'bg-[#FFFDF5]' : 'bg-[#F4EFE2]'}`}>
                  {getCategoryIcon(cat.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-[#0B0B0B]">
                      {cat.label}
                    </span>
                    {isSelected && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-[#0B0B0B] text-[#FFE600]">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-sans text-[#262422] leading-snug mb-1">
                    {cat.description}
                  </p>
                  <p className="font-mono text-[11px] text-[#6C6659] leading-tight">
                    Examples: {cat.examples}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errors.category && (
          <p className="auth-error-msg mt-2" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      {/* Conditional Custom Category if 'other' */}
      {data.category === 'other' && (
        <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
          <label htmlFor="custom-category" className="assessment-label text-xs">
            <span className="assessment-label-title">Specify Item Type / Material</span>
          </label>
          <input
            id="custom-category"
            type="text"
            value={data.customCategory || ''}
            onChange={(e) => onChange({ customCategory: e.target.value })}
            placeholder="e.g., Musical Instrument, Bicycle Component, Luggage"
            className="auth-input text-sm"
          />
        </div>
      )}

      {/* Brand & Model (Optional) */}
      <div className="pt-4 border-t border-[#0B0B0B]/15">
        <label htmlFor="brand-model" className="assessment-label">
          <span className="assessment-label-title">Brand & Model Number</span>
          <span className="assessment-badge-optional">OPTIONAL</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-2 font-sans">
          Helps evaluate OEM spare part availability and documented repairability scores.
        </p>
        <input
          id="brand-model"
          type="text"
          value={data.brandModel || ''}
          onChange={(e) => onChange({ brandModel: e.target.value })}
          placeholder="e.g. Sony WH-1000XM4, DeWalt DCD771, Patagonia Torrentshell"
          className="auth-input text-sm"
        />
      </div>
    </div>
  );
};
