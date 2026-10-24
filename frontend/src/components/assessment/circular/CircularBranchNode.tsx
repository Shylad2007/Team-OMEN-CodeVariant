import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import type { BranchNodeData } from './radialLayout';

interface CircularBranchNodeProps {
  data: BranchNodeData;
}

export const CircularBranchNode: React.FC<CircularBranchNodeProps> = ({ data }) => {
  const { branch, isActive, onNodeClick, onSelectBranch } = data;
  const actionPlan = branch.actionPlan;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(branch.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectBranch) {
      onSelectBranch(branch.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-[210px] p-2 bg-[#FFFDF5] border font-sans text-left relative cursor-pointer transition-all
        ${
          isActive
            ? 'border-[#0B0B0B] ring-2 ring-[#FFE600] shadow-[3px_3px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5'
            : 'border-[#0B0B0B]/70 shadow-[2px_2px_0px_#0B0B0B] hover:border-[#0B0B0B] hover:shadow-[3px_3px_0px_#0B0B0B]'
        }
      `}
    >
      {/* Handles on all sides for radial incoming edge */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Right} id="right" className="!w-2 !h-2 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-mono text-[8.5px] font-bold px-1 py-0.2 bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B] uppercase truncate max-w-[120px]">
          {branch.shortLabel}
        </span>
        <span className="font-mono text-[8.5px] font-bold text-[#10B25A]">
          {actionPlan.confidenceScore}%
        </span>
      </div>

      {/* Title */}
      <h4 className="font-mono text-[10px] font-bold text-[#0B0B0B] leading-tight truncate mb-0.5" title={branch.title}>
        {branch.title}
      </h4>

      {/* Description */}
      <p className="text-[9px] text-[#544E43] font-sans line-clamp-2 leading-tight mb-1.5">
        {branch.description}
      </p>

      {/* Feasibility & Action Button */}
      <div className="pt-1 border-t border-[#0B0B0B]/15 flex items-center justify-between">
        <span className="font-mono text-[8.5px] text-[#2A5BFF] font-semibold flex items-center gap-0.5">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>{actionPlan.feasibility.split(' ')[0]}</span>
        </span>

        <button
          type="button"
          onClick={handleSelect}
          className={`
            px-1.5 py-0.2 font-mono text-[8px] font-bold border transition-colors flex items-center gap-0.5
            ${
              isActive
                ? 'bg-[#0B0B0B] text-[#FFE600] border-[#0B0B0B]'
                : 'bg-[#FFE600] hover:bg-[#F4EFE2] text-[#0B0B0B] border-[#0B0B0B]'
            }
          `}
        >
          <span>{isActive ? 'Active' : 'Select'}</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
