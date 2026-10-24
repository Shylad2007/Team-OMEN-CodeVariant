import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { EvaluatedCircularTree, OutcomeType, OutcomeSubBranch } from './circularTreeTypes';

export interface CentralNodeData extends Record<string, unknown> {
  product: EvaluatedCircularTree['product'];
  recommendedOutcome: OutcomeType;
  onNodeClick?: (nodeId: string) => void;
}

export interface OutcomeNodeData extends Record<string, unknown> {
  outcomeType: OutcomeType;
  title: string;
  iconName: string;
  bannerBg: string;
  borderColor: string;
  viability: string;
  fitPercentage: number;
  summary: string;
  isRecommended: boolean;
  onNodeClick?: (nodeId: string) => void;
}

export interface BranchNodeData extends Record<string, unknown> {
  branch: OutcomeSubBranch;
  outcomeType: OutcomeType;
  isActive: boolean;
  onNodeClick?: (nodeId: string) => void;
  onSelectBranch?: (branchId: string) => void;
}

export function buildCircularGraphElements(
  evaluatedTree: EvaluatedCircularTree,
  activeBranchId: string | null,
  callbacks?: {
    onNodeClick?: (nodeId: string) => void;
    onSelectBranch?: (branchId: string) => void;
  }
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 1. Central Product Node (centered around 0, 0)
  nodes.push({
    id: 'product_center',
    type: 'centralProduct',
    position: { x: -115, y: -50 },
    data: {
      product: evaluatedTree.product,
      recommendedOutcome: evaluatedTree.recommendedOutcome,
      onNodeClick: callbacks?.onNodeClick,
    } as CentralNodeData,
  });

  // Radii metrics - compact circular structure
  const R_OUTCOMES = 300; // Radius to 5 Outcomes
  const R_BRANCHES = 530; // Radius to Sub-Branches

  const outcomesList = Object.values(evaluatedTree.outcomes);

  outcomesList.forEach((sector) => {
    const outcomeId = `outcome_${sector.outcomeType}`;
    const rad = (sector.angleDegrees * Math.PI) / 180;
    const isRecommended = sector.outcomeType === evaluatedTree.recommendedOutcome;

    // Outcome coordinates
    const ox = R_OUTCOMES * Math.cos(rad);
    const oy = R_OUTCOMES * Math.sin(rad);

    nodes.push({
      id: outcomeId,
      type: 'outcomeSector',
      position: { x: ox - 110, y: oy - 48 },
      data: {
        outcomeType: sector.outcomeType,
        title: sector.title,
        iconName: sector.iconName,
        bannerBg: sector.bannerBg,
        borderColor: sector.borderColor,
        viability: sector.viability,
        fitPercentage: sector.fitPercentage,
        summary: sector.summary,
        isRecommended,
        onNodeClick: callbacks?.onNodeClick,
      } as OutcomeNodeData,
    });

    // Determine facing source and target handles based on sector angle
    let centerSourceHandle = 'top';
    let outcomeTargetHandle = 'bottom';
    let outcomeSourceHandle = 'src_top';
    let branchTargetHandle = 'bottom';

    if (sector.outcomeType === 'repair') {
      centerSourceHandle = 'top';
      outcomeTargetHandle = 'bottom';
      outcomeSourceHandle = 'src_top';
      branchTargetHandle = 'bottom';
    } else if (sector.outcomeType === 'reuse') {
      centerSourceHandle = 'right';
      outcomeTargetHandle = 'left';
      outcomeSourceHandle = 'src_right';
      branchTargetHandle = 'left';
    } else if (sector.outcomeType === 'repurpose') {
      centerSourceHandle = 'bottom';
      outcomeTargetHandle = 'top';
      outcomeSourceHandle = 'src_bottom';
      branchTargetHandle = 'top';
    } else if (sector.outcomeType === 'replace') {
      centerSourceHandle = 'bottom';
      outcomeTargetHandle = 'top';
      outcomeSourceHandle = 'src_bottom';
      branchTargetHandle = 'top';
    } else if (sector.outcomeType === 'recycle') {
      centerSourceHandle = 'left';
      outcomeTargetHandle = 'right';
      outcomeSourceHandle = 'src_left';
      branchTargetHandle = 'right';
    }

    // Edge from Center -> Outcome
    const edgeId = `edge_center_to_${sector.outcomeType}`;
    edges.push({
      id: edgeId,
      source: 'product_center',
      sourceHandle: centerSourceHandle,
      target: outcomeId,
      targetHandle: outcomeTargetHandle,
      type: 'straight',
      animated: isRecommended,
      label: isRecommended ? '★ BEST FIT' : `${sector.fitPercentage}% FIT`,
      labelStyle: {
        fontSize: '9px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: isRecommended ? 800 : 700,
        fill: isRecommended ? '#0B0B0B' : '#544E43',
      },
      labelBgStyle: {
        fill: isRecommended ? '#FFE600' : '#FFFDF5',
        stroke: '#0B0B0B',
        strokeWidth: isRecommended ? 1.5 : 1,
        rx: 2,
        ry: 2,
      },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: isRecommended ? '#0B0B0B' : '#8C8474',
        strokeWidth: isRecommended ? 3 : 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isRecommended ? '#0B0B0B' : '#8C8474',
        width: isRecommended ? 14 : 11,
        height: isRecommended ? 14 : 11,
      },
    });

    // Sub-Branches radiating outward in this sector
    const branches = sector.subBranches;
    const branchCount = branches.length;
    const angularSpread = 26; // +/- 13 degrees from sector angle

    branches.forEach((branch, bIdx) => {
      const branchId = branch.id;
      const offsetAngle = branchCount > 1 ? (bIdx === 0 ? -angularSpread / 2 : angularSpread / 2) : 0;
      const bRad = ((sector.angleDegrees + offsetAngle) * Math.PI) / 180;

      const bx = R_BRANCHES * Math.cos(bRad);
      const by = R_BRANCHES * Math.sin(bRad);
      const isActive = activeBranchId === branchId;

      nodes.push({
        id: branchId,
        type: 'circularBranch',
        position: { x: bx - 105, y: by - 46 },
        data: {
          branch,
          outcomeType: sector.outcomeType,
          isActive,
          onNodeClick: callbacks?.onNodeClick,
          onSelectBranch: callbacks?.onSelectBranch,
        } as BranchNodeData,
      });

      // Edge from Outcome -> Sub-Branch
      const branchEdgeId = `edge_${outcomeId}_to_${branchId}`;
      edges.push({
        id: branchEdgeId,
        source: outcomeId,
        sourceHandle: outcomeSourceHandle,
        target: branchId,
        targetHandle: branchTargetHandle,
        type: 'smoothstep',
        animated: isActive,
        style: {
          stroke: isActive ? '#0B0B0B' : '#A8A193',
          strokeWidth: isActive ? 2.5 : 1.2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#0B0B0B' : '#A8A193',
          width: isActive ? 13 : 10,
          height: isActive ? 13 : 10,
        },
      });
    });
  });

  return { nodes, edges };
}
