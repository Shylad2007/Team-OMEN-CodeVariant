export type CanvasPayloadType =
  | 'new_assessment_token'
  | 'assessment_summary_card'
  | 'intake_capsule'
  | 'review_verdict_token'
  | 'decision_node_token'
  | 'checklist_step_token'
  | 'action_plan_token';

export interface CanvasPayload<T = any> {
  type: CanvasPayloadType;
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  data?: T;
}

export type ActionZoneStatus =
  | 'idle'
  | 'candidate'
  | 'hovered'
  | 'processing'
  | 'success'
  | 'error';

export interface ActionZoneRegistration {
  id: string;
  accepts: CanvasPayloadType[];
  label: string;
  hint?: string;
  icon?: string;
  onDrop: (payload: CanvasPayload) => Promise<boolean | void> | boolean | void;
  validate?: (payload: CanvasPayload) => { valid: boolean; reason?: string };
}
