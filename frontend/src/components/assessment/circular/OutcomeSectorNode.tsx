import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wrench, RefreshCw, Sparkles, ArrowUpRight, Trash2 } from 'lucide-react';
import type { OutcomeNodeData } from './radialLayout';
import type { OutcomeType } from './circularTreeTypes';

interface OutcomeSectorNodeProps {
  data: OutcomeNodeData;
}

export const OutcomeSectorNode: React.FC<OutcomeSectorNodeProps> = ({ data }) => {
  const { outcomeType, title, bannerBg, fitPercentage, summary, isRecommended, onNodeClick } = data;

  const getIcon = (type: OutcomeType) => {
    switch (type) {
      case 'repair':
        return <Wrench className="w-4 h-4 text-[#0B0B0B]" />;
      case 'reuse':
        return <RefreshCw className="w-4 h-4 text-[#0B0B0B]" />;
      case 'repurpose':
        return <Sparkles className="w-4 h-4 text-[#0B0B0B]" />;
      case 'replace':
        return <ArrowUpRight className="w-4 h-4 text-[#0B0B0B]" />;
      case 'recycle':
        return <Trash2 className="w-4 h-4 text-[#0B0B0B]" />;
    }
  };

  const nodeId = `outcome_${outcomeType}`;

  return (
    <div
      onClick={() => onNodeClick && onNodeClick(nodeId)}
      className={`
        w-[220px] bg-[#FFFDF5] border-2 border-[#0B0B0B] font-sans text-left relative cursor-pointer group transition-all
        ${isRecommended ? 'shadow-[4px_4px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5' : 'shadow-[2px_2px_0px_#0B0B0B] hover:shadow-[3px_3px_0px_#0B0B0B]'}
      `}
    >
      {/* Target handles for radial center edge */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />
      <Handle type="target" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-[#FFE600] !border !border-[#0B0B0B] !rounded-none" />

      {/* Outward Source Handles for radial sub-branch edges */}
      <Handle type="source" position={Position.Top} id="src_top" className="!w-2.5 !h-2.5 !bg-[#0B0B0B] !border !border-[#FFE600] !rounded-none" />
      <Handle type="source" position={Position.Bottom} id="src_bottom" className="!w-2.5 !h-2.5 !bg-[#0B0B0B] !border !border-[#FFE600] !rounded-none" />
      <Handle type="source" position={Position.Left} id="src_left" className="!w-2.5 !h-2.5 !bg-[#0B0B0B] !border !border-[#FFE600] !rounded-none" />
      <Handle type="source" position={Position.Right} id="src_right" className="!w-2.5 !h-2.5 !bg-[#0B0B0B] !border !border-[#FFE600] !rounded-none" />

      {/* Banner Header */}
      <div className={`p-1.5 px-2 ${bannerBg} border-b border-[#0B0B0B] flex items-center justify-between text-[#0B0B0B]`}>
        <div className="flex items-center gap-1 font-mono text-[10px] font-black uppercase tracking-wider truncate">
          {getIcon(outcomeType)}
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isRecommended && (
            <span className="font-mono text-[8px] font-black px-1 py-0.2 bg-[#0B0B0B] text-[#FFE600]">
              TOP
            </span>
          )}
          <span className="font-mono text-[9px] font-black px-1 py-0.2 bg-[#FFFDF5] border border-[#0B0B0B]">
            {fitPercentage}%
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 space-y-1">
        <p className="text-[10px] font-sans text-[#262422] line-clamp-2 leading-tight">
          {summary}
        </p>

        <div className="pt-1 border-t border-[#0B0B0B]/15 font-mono text-[8.5px] text-[#6C6659] flex items-center justify-between">
          <span>Inspect Branches</span>
          <span className="text-[#2A5BFF] font-bold">2 Paths →</span>
        </div>
      </div>
    </div>
  );
};
