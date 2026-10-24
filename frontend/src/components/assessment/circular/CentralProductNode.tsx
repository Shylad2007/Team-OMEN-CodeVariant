import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Package, Sparkles } from 'lucide-react';
import type { CentralNodeData } from './radialLayout';

interface CentralProductNodeProps {
  data: CentralNodeData;
}

export const CentralProductNode: React.FC<CentralProductNodeProps> = ({ data }) => {
  const { product, recommendedOutcome, onNodeClick } = data;

  return (
    <div
      onClick={() => onNodeClick && onNodeClick('product_center')}
      className="w-[230px] p-2.5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] font-sans text-left relative cursor-pointer group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
    >
      {/* Handles around center perimeter for omnidirectional radial edges */}
      <Handle type="source" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="source" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-1 pb-1 mb-1.5 border-b border-[#0B0B0B]/20">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-[#FFE600] border border-[#0B0B0B] flex items-center justify-center">
            <Package className="w-2.5 h-2.5 text-[#0B0B0B]" />
          </div>
          <span className="font-mono text-[9px] font-black tracking-wider text-[#0B0B0B] uppercase">
            ASSESSED ITEM
          </span>
        </div>
        <span className="font-mono text-[8px] font-bold px-1 py-0.2 bg-[#0B0B0B] text-[#FFE600]">
          CENTER
        </span>
      </div>

      {/* Product Name & Brand */}
      <div className="mb-1.5">
        <h3 className="font-display font-black text-xs text-[#0B0B0B] leading-tight truncate" title={product.name}>
          {product.name}
        </h3>
        {product.brandModel && (
          <span className="font-mono text-[9px] text-[#6C6659] block truncate">
            {product.brandModel}
          </span>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex items-center gap-1 font-mono text-[8.5px] mb-1.5">
        <span className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B] font-bold uppercase truncate max-w-[85px]">
          {product.category}
        </span>
        {product.condition && (
          <span className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] text-[#544E43] font-medium truncate max-w-[115px]">
            {product.condition.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Recommended Pathway Preview */}
      <div className="p-1 px-1.5 bg-[#FFE600]/30 border border-[#0B0B0B] font-mono text-[9px] text-[#0B0B0B] flex items-center justify-between">
        <span className="flex items-center gap-1 font-bold">
          <Sparkles className="w-2.5 h-2.5 text-[#2A5BFF]" />
          Top Verdict:
        </span>
        <strong className="uppercase font-black text-[#0B0B0B]">
          {recommendedOutcome}
        </strong>
      </div>
    </div>
  );
};
