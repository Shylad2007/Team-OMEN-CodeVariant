import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CentralProductNode } from './CentralProductNode';
import { OutcomeSectorNode } from './OutcomeSectorNode';
import { CircularBranchNode } from './CircularBranchNode';
import { buildCircularGraphElements } from './radialLayout';
import { CircularNodeInspector } from './CircularNodeInspector';
import type { EvaluatedCircularTree } from './circularTreeTypes';
import { Maximize2, Target, Wrench, RefreshCw, Sparkles, ArrowUpRight, Trash2, FileText } from 'lucide-react';

interface CircularDecisionCanvasProps {
  tree: EvaluatedCircularTree;
  onSelectActiveBranch: (branchId: string) => void;
  activeBranchId: string | null;
  onContinueToActionPlan?: () => void;
}

export const CircularDecisionCanvas: React.FC<CircularDecisionCanvasProps> = ({
  tree,
  onSelectActiveBranch,
  activeBranchId,
  onContinueToActionPlan,
}) => {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);
  // Default to null so the full, unclipped circular graph is displayed cleanly on initial load
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      centralProduct: CentralProductNode,
      outcomeSector: OutcomeSectorNode,
      circularBranch: CircularBranchNode,
    }),
    []
  );

  const handleNodeClick = (nodeId: string) => {
    setInspectedNodeId(nodeId);
    if (nodeId.startsWith('outcome_')) {
      const outcomeType = nodeId.replace('outcome_', '') as keyof typeof tree.outcomes;
      const sector = tree.outcomes[outcomeType];
      if (sector && sector.subBranches.length > 0) {
        onSelectActiveBranch(sector.subBranches[0].id);
      }
    } else if (nodeId !== 'product_center') {
      onSelectActiveBranch(nodeId);
    }
  };

  const handleSelectBranch = (bId: string) => {
    onSelectActiveBranch(bId);
    setInspectedNodeId(bId);
  };

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      buildCircularGraphElements(tree, activeBranchId, {
        onNodeClick: handleNodeClick,
        onSelectBranch: handleSelectBranch,
      }),
    [tree, activeBranchId, onSelectActiveBranch]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize on state changes
  useEffect(() => {
    const { nodes: uNodes, edges: uEdges } = buildCircularGraphElements(tree, activeBranchId, {
      onNodeClick: handleNodeClick,
      onSelectBranch: handleSelectBranch,
    });
    setNodes(uNodes);
    setEdges(uEdges);
  }, [tree, activeBranchId, onSelectActiveBranch, setNodes, setEdges]);

  // Ensure container has valid measurable dimensions before mounting React Flow
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkDimensions = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerReady(true);
      }
    };

    checkDimensions();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerReady(true);
        }
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Ensure canvas fits properly on window / monitor resize
  useEffect(() => {
    const handleResize = () => {
      reactFlowInstance.current?.fitView({ padding: 0.1 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Center / Sector pan helpers
  const handleFitOverview = () => {
    reactFlowInstance.current?.fitView({ padding: 0.1, duration: 350 });
  };

  const handleFocusNode = (nodeId: string, zoom = 1.0) => {
    const foundNode = nodes.find((n) => n.id === nodeId);
    if (foundNode && reactFlowInstance.current) {
      const halfW = nodeId === 'product_center' ? 110 : (nodeId.startsWith('outcome_') ? 110 : 102.5);
      const halfH = nodeId === 'product_center' ? 50 : (nodeId.startsWith('outcome_') ? 48 : 46);
      reactFlowInstance.current.setCenter(
        foundNode.position.x + halfW,
        foundNode.position.y + halfH,
        { zoom, duration: 400 }
      );
    }
  };

  return (
    <div className="relative w-full flex-1 h-full min-h-[480px] lg:min-h-0 border-3 border-[#0B0B0B] bg-[#F4EFE2] shadow-[4px_4px_0px_#0B0B0B] overflow-hidden flex flex-col">
      {/* Top Floating Radial Navigation Bar */}
      <div className="p-1.5 px-3 bg-[#FFFDF5] border-b-2 border-[#0B0B0B] flex flex-wrap items-center justify-between gap-1.5 z-20 font-mono text-xs shadow-sm flex-none">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-[#0B0B0B] text-[11px] tracking-wide uppercase flex items-center gap-1">
            <span className="w-2 h-2 bg-[#FFE600] border border-[#0B0B0B] inline-block" />
            CIRCULAR MATRIX
          </span>
          <span className="text-[#6C6659] text-[9.5px] hidden md:inline">
            (Radial 5-Outcome Engine)
          </span>
        </div>

        {/* Radial Quick-Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => handleFocusNode('product_center', 1.1)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
            title="Focus central product"
          >
            <Target className="w-3 h-3 text-[#0B0B0B]" />
            <span>Product</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusNode('outcome_repair', 1.05)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
          >
            <Wrench className="w-3 h-3" />
            <span>Repair</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusNode('outcome_reuse', 1.05)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reuse</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusNode('outcome_repurpose', 1.05)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Repurpose</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusNode('outcome_replace', 1.05)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusNode('outcome_recycle', 1.05)}
            className="px-1.5 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B] hover:bg-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Recycle</span>
          </button>

          <button
            type="button"
            onClick={handleFitOverview}
            className="px-1.5 py-0.5 bg-[#F4EFE2] border border-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600] text-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1 ml-0.5"
            title="Reset overview"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (inspectedNodeId) {
                setInspectedNodeId(null);
              } else {
                setInspectedNodeId(activeBranchId || `outcome_${tree.recommendedOutcome}`);
              }
            }}
            className={`px-2 py-0.5 border border-[#0B0B0B] text-[9.5px] font-bold flex items-center gap-1 transition-colors ml-1 ${
              inspectedNodeId ? 'bg-[#FFE600] text-[#0B0B0B]' : 'bg-[#FFFDF5] text-[#0B0B0B] hover:bg-[#FFE600]'
            }`}
            title="Toggle rationale details panel"
          >
            <FileText className="w-3 h-3 text-[#0B0B0B]" />
            <span>{inspectedNodeId ? 'Hide Details' : 'Node Details'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 w-full relative min-h-[400px] lg:min-h-0"
        style={{ width: '100%', height: '100%' }}
      >
        {!containerReady ? (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[#6C6659] bg-[#F4EFE2]">
            <span>INITIALIZING CIRCULAR MATRIX...</span>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onInit={(instance) => {
                reactFlowInstance.current = instance;
                setTimeout(() => {
                  instance.fitView({ padding: 0.1 });
                }, 60);
              }}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              minZoom={0.2}
              maxZoom={2.0}
              proOptions={{ hideAttribution: true }}
              className="bg-[#F4EFE2]"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Retro Dots Pattern */}
              <Background
                variant={BackgroundVariant.Dots}
                gap={26}
                size={1.4}
                color="#0B0B0B"
                className="opacity-15"
              />

              <Controls
                showInteractive={false}
                className="!bg-[#FFFDF5] !border-2 !border-[#0B0B0B] !shadow-[3px_3px_0px_#0B0B0B] !rounded-none !m-3"
              />
            </ReactFlow>
          </div>
        )}

        {/* Floating Node Inspector Drawer */}
        {inspectedNodeId && (
          <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 z-30 flex flex-col justify-end sm:justify-start pointer-events-none max-w-[calc(100%-1rem)] sm:max-w-sm w-full">
            <div className="pointer-events-auto max-h-full overflow-y-auto">
              <CircularNodeInspector
                nodeId={inspectedNodeId}
                tree={tree}
                activeBranchId={activeBranchId}
                onClose={() => setInspectedNodeId(null)}
                onSelectBranch={(bId) => {
                  onSelectActiveBranch(bId);
                  setInspectedNodeId(bId);
                }}
                onContinueToActionPlan={onContinueToActionPlan}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Strip */}
      <div className="px-3 py-1.5 bg-[#FFFDF5] border-t-2 border-[#0B0B0B] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#0B0B0B] z-20 flex-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 bg-[#FFE600] border border-[#0B0B0B] inline-block" />
            ★ Primary: {tree.recommendedOutcome.toUpperCase()}
          </span>
          <span className="text-[#6C6659] hidden sm:inline">
            Click any node on the circular matrix to inspect diagnostic rationale and implementation checklists.
          </span>
        </div>

        <span className="font-bold text-[#2A5BFF]">
          {activeBranchId ? 'ACTIVE PATH HIGHLIGHTED' : 'SELECT SUB-BRANCH TO PIN'}
        </span>
      </div>
    </div>
  );
};
