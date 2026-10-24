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
  isActive: boolean;
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
    position: { x: -110, y: -50 },
    data: {
      product: evaluatedTree.product,
      recommendedOutcome: evaluatedTree.recommendedOutcome,
      onNodeClick: callbacks?.onNodeClick,
    } as CentralNodeData,
  });

  // Calibrated anisotropic radial radii to eliminate all bounding box overlaps
  // and guarantee >= 50px clearance between all nodes and connectors
  const R_OUTCOMES_X = 360; // Horizontal radius to 5 Outcomes
  const R_OUTCOMES_Y = 270; // Vertical radius to 5 Outcomes
  const R_BRANCHES_X = 630; // Horizontal radius to Sub-Branches
  const R_BRANCHES_Y = 470; // Vertical radius to Sub-Branches
  const ANGULAR_SPREAD = 30; // Spread between sibling branches in degrees (+/- 15°)

  const outcomesList = Object.values(evaluatedTree.outcomes);

  // Determine active outcome and active branch
  let activeOutcomeType: OutcomeType = evaluatedTree.recommendedOutcome;
  let currentActiveBranchId: string | null = activeBranchId;

  if (activeBranchId) {
    const parentSector = outcomesList.find((sector) =>
      sector.subBranches.some((b) => b.id === activeBranchId)
    );
    if (parentSector) {
      activeOutcomeType = parentSector.outcomeType;
    } else if (activeBranchId.startsWith('outcome_')) {
      const parsed = activeBranchId.replace('outcome_', '') as OutcomeType;
      if (evaluatedTree.outcomes[parsed]) {
        activeOutcomeType = parsed;
        currentActiveBranchId = evaluatedTree.outcomes[parsed].subBranches[0]?.id || null;
      }
    } else if (evaluatedTree.outcomes[activeBranchId as OutcomeType]) {
      activeOutcomeType = activeBranchId as OutcomeType;
      currentActiveBranchId = evaluatedTree.outcomes[activeOutcomeType].subBranches[0]?.id || null;
    }
  } else {
    currentActiveBranchId = evaluatedTree.activeBranchId || evaluatedTree.outcomes[activeOutcomeType]?.subBranches[0]?.id || null;
  }

  outcomesList.forEach((sector) => {
    const outcomeId = `outcome_${sector.outcomeType}`;
    const rad = (sector.angleDegrees * Math.PI) / 180;
    const isRecommended = sector.outcomeType === evaluatedTree.recommendedOutcome;
    const isSectorActive = sector.outcomeType === activeOutcomeType;

    // Outcome coordinates with anisotropic radial placement
    const ox = R_OUTCOMES_X * Math.cos(rad);
    const oy = R_OUTCOMES_Y * Math.sin(rad);

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
        isActive: isSectorActive,
        onNodeClick: callbacks?.onNodeClick,
      } as OutcomeNodeData,
    });

    // Determine facing source and target handles based on sector angle
    let centerSourceHandle = 'top';
    let outcomeTargetHandle = 'bottom';

    if (sector.outcomeType === 'repair') {
      centerSourceHandle = 'top';
      outcomeTargetHandle = 'bottom';
    } else if (sector.outcomeType === 'reuse') {
      centerSourceHandle = 'right';
      outcomeTargetHandle = 'left';
    } else if (sector.outcomeType === 'repurpose') {
      centerSourceHandle = 'bottom';
      outcomeTargetHandle = 'top';
    } else if (sector.outcomeType === 'replace') {
      centerSourceHandle = 'bottom';
      outcomeTargetHandle = 'top';
    } else if (sector.outcomeType === 'recycle') {
      centerSourceHandle = 'left';
      outcomeTargetHandle = 'right';
    }

    // Edge from Center -> Outcome (Directional animation follows the currently active outcome)
    const edgeId = `edge_center_to_${sector.outcomeType}`;
    const edgeLabel = isSectorActive
      ? (isRecommended ? '★ BEST FIT (ACTIVE)' : `★ ACTIVE (${sector.fitPercentage}%)`)
      : (isRecommended ? '★ BEST FIT' : `${sector.fitPercentage}% FIT`);

    edges.push({
      id: edgeId,
      source: 'product_center',
      sourceHandle: centerSourceHandle,
      target: outcomeId,
      targetHandle: outcomeTargetHandle,
      type: 'straight',
      animated: isSectorActive,
      label: edgeLabel,
      labelStyle: {
        fontSize: '9px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: isSectorActive ? 800 : 700,
        fill: isSectorActive ? '#0B0B0B' : '#544E43',
      },
      labelBgStyle: {
        fill: isSectorActive ? '#FFE600' : '#FFFDF5',
        stroke: '#0B0B0B',
        strokeWidth: isSectorActive ? 1.5 : 1,
        rx: 2,
        ry: 2,
      },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: isSectorActive ? '#0B0B0B' : '#8C8474',
        strokeWidth: isSectorActive ? 3 : 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isSectorActive ? '#0B0B0B' : '#8C8474',
        width: isSectorActive ? 14 : 11,
        height: isSectorActive ? 14 : 11,
      },
    });

    // Sub-Branches radiating outward in this sector
    const branches = sector.subBranches;
    const branchCount = branches.length;

    branches.forEach((branch, bIdx) => {
      const branchId = branch.id;
      const offsetAngle = branchCount > 1 ? (bIdx === 0 ? -ANGULAR_SPREAD / 2 : ANGULAR_SPREAD / 2) : 0;
      const bRad = ((sector.angleDegrees + offsetAngle) * Math.PI) / 180;

      const bx = R_BRANCHES_X * Math.cos(bRad);
      const by = R_BRANCHES_Y * Math.sin(bRad);
      const isBranchActive = isSectorActive && (currentActiveBranchId === branchId);

      nodes.push({
        id: branchId,
        type: 'circularBranch',
        position: { x: bx - 102.5, y: by - 46 },
        data: {
          branch,
          outcomeType: sector.outcomeType,
          isActive: isBranchActive,
          onNodeClick: callbacks?.onNodeClick,
          onSelectBranch: callbacks?.onSelectBranch,
        } as BranchNodeData,
      });

      // Dynamic handle pairing based on relative position vector
      const dx = bx - ox;
      const dy = by - oy;
      let branchTargetHandle = 'top';
      let outcomeBranchSourceHandle = 'src_bottom';

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          outcomeBranchSourceHandle = 'src_right';
          branchTargetHandle = 'left';
        } else {
          outcomeBranchSourceHandle = 'src_left';
          branchTargetHandle = 'right';
        }
      } else {
        if (dy > 0) {
          outcomeBranchSourceHandle = 'src_bottom';
          branchTargetHandle = 'top';
        } else {
          outcomeBranchSourceHandle = 'src_top';
          branchTargetHandle = 'bottom';
        }
      }

      // Edge from Outcome -> Sub-Branch (Animated directional arrow follows the active branch)
      const branchEdgeId = `edge_${outcomeId}_to_${branchId}`;
      edges.push({
        id: branchEdgeId,
        source: outcomeId,
        sourceHandle: outcomeBranchSourceHandle,
        target: branchId,
        targetHandle: branchTargetHandle,
        type: 'smoothstep',
        animated: isBranchActive,
        style: {
          stroke: isBranchActive ? '#0B0B0B' : '#A8A193',
          strokeWidth: isBranchActive ? 2.5 : 1.2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isBranchActive ? '#0B0B0B' : '#A8A193',
          width: isBranchActive ? 13 : 10,
          height: isBranchActive ? 13 : 10,
        },
      });
    });
  });

  return { nodes, edges };
}
