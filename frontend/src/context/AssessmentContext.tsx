import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AssessmentData } from '../components/assessment/types';
import { useAuth } from './AuthContext';
import {
  createAssessment,
  updateAssessment,
  getAssessment,
  deleteAssessment,
  fromDatabaseRecord,
  toDatabasePayload,
} from '../services/assessmentApi';

const INITIAL_DATA: AssessmentData = {
  itemName: '',
  category: null,
  customCategory: '',
  brandModel: '',

  age: null,
  condition: null,
  reportedFault: '',

  repairCost: null,
  repairCostUnknown: false,
  replacementCost: null,
  replacementCostUnknown: false,
  expectedLifespanYears: null,
  expectedLifespanUnknown: false,
  budgetConstraint: null,
  urgency: null,
  primaryPriority: null,

  adaptiveAnswers: {},
};

const STORAGE_KEY = 'r3vive_assessment_state';
const STORAGE_ID_KEY = 'r3vive_assessment_active_id';
const STORAGE_OUTCOME_KEY = 'r3vive_assessment_outcome';
const STORAGE_BRANCH_KEY = 'r3vive_assessment_branch';
const STORAGE_CHECKLIST_KEY = 'r3vive_assessment_checklist';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SaveAssessmentOptions = Partial<AssessmentData> & {
  userId?: string;
  currentStep?: number;
  isCompleted?: boolean;
  recommendedOutcome?: string | null;
  selectedOutcome?: string | null;
  selectedBranchId?: string | null;
  checklistProgress?: Record<string, Record<number, boolean>>;
};

interface AssessmentContextType {
  data: AssessmentData;
  assessmentId: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  currentStep: number;
  selectedOutcome: string | null;
  selectedBranchId: string | null;
  recommendedOutcome: string | null;
  isCompleted: boolean;
  checklistProgress: Record<string, Record<number, boolean>>;
  setCurrentStep: (step: number) => void;
  setSelectedOutcome: (outcome: string | null) => void;
  setSelectedBranchId: (branchId: string | null) => void;
  setChecklistProgress: React.Dispatch<React.SetStateAction<Record<string, Record<number, boolean>>>>;
  updateData: (updates: Partial<AssessmentData>) => void;
  resetData: () => void;
  saveAssessment: (
    overrides?: SaveAssessmentOptions,
    workflowState?: {
      currentStep?: number;
      isCompleted?: boolean;
      recommendedOutcome?: string | null;
      selectedOutcome?: string | null;
      selectedBranchId?: string | null;
      checklistProgress?: Record<string, Record<number, boolean>>;
    }
  ) => Promise<string | null>;
  loadAssessment: (id: string) => Promise<boolean>;
  deleteAssessmentRecord: (id: string) => Promise<boolean>;
  isItemAssessed: boolean;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user } = useAuth();

  const [data, setData] = useState<AssessmentData>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_DATA;
  });

  const [assessmentId, setAssessmentId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_ID_KEY) || null;
    } catch {
      return null;
    }
  });

  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_OUTCOME_KEY) || null;
    } catch {
      return null;
    }
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_BRANCH_KEY) || null;
    } catch {
      return null;
    }
  });

  const [checklistProgress, setChecklistProgress] = useState<Record<string, Record<number, boolean>>>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_CHECKLIST_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [recommendedOutcome, setRecommendedOutcome] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (assessmentId) {
        sessionStorage.setItem(STORAGE_ID_KEY, assessmentId);
      } else {
        sessionStorage.removeItem(STORAGE_ID_KEY);
      }
      if (selectedOutcome) {
        sessionStorage.setItem(STORAGE_OUTCOME_KEY, selectedOutcome);
      } else {
        sessionStorage.removeItem(STORAGE_OUTCOME_KEY);
      }
      if (selectedBranchId) {
        sessionStorage.setItem(STORAGE_BRANCH_KEY, selectedBranchId);
      } else {
        sessionStorage.removeItem(STORAGE_BRANCH_KEY);
      }
      sessionStorage.setItem(STORAGE_CHECKLIST_KEY, JSON.stringify(checklistProgress));
    } catch {
      // Ignore storage errors
    }
  }, [data, assessmentId, selectedOutcome, selectedBranchId, checklistProgress]);

  const updateData = (updates: Partial<AssessmentData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setSaveStatus('idle');
  };

  const resetData = () => {
    setData(INITIAL_DATA);
    setAssessmentId(null);
    setCurrentStep(1);
    setSelectedOutcome(null);
    setSelectedBranchId(null);
    setRecommendedOutcome(null);
    setIsCompleted(false);
    setChecklistProgress({});
    setSaveStatus('idle');
    setSaveError(null);
    setLastSavedAt(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_ID_KEY);
      sessionStorage.removeItem(STORAGE_OUTCOME_KEY);
      sessionStorage.removeItem(STORAGE_BRANCH_KEY);
      sessionStorage.removeItem(STORAGE_CHECKLIST_KEY);
    } catch {
      // ignore
    }
  };

  const isItemAssessed = Boolean(data.itemName.trim() && data.category && data.condition);

  // Save or Update Assessment
  const saveAssessment = useCallback(
    async (
      overrides?: SaveAssessmentOptions,
      workflowState?: {
        currentStep?: number;
        isCompleted?: boolean;
        recommendedOutcome?: string | null;
        selectedOutcome?: string | null;
        selectedBranchId?: string | null;
        checklistProgress?: Record<string, Record<number, boolean>>;
      }
    ): Promise<string | null> => {
      const currentToken = session?.access_token;
      if (!currentToken || !user) {
        // Unauthenticated users only save to local session
        return null;
      }

      // Extract workflow parameters from either overrides or workflowState
      const resolvedStep = workflowState?.currentStep ?? overrides?.currentStep ?? currentStep;
      const resolvedCompleted = workflowState?.isCompleted ?? overrides?.isCompleted ?? isCompleted;
      const resolvedRecommended = workflowState?.recommendedOutcome ?? overrides?.recommendedOutcome ?? recommendedOutcome;
      const resolvedSelectedOutcome = workflowState?.selectedOutcome ?? overrides?.selectedOutcome ?? selectedOutcome;
      const resolvedBranchId = workflowState?.selectedBranchId ?? overrides?.selectedBranchId ?? selectedBranchId;
      const resolvedChecklist = workflowState?.checklistProgress ?? overrides?.checklistProgress ?? checklistProgress;

      const mergedData = { ...data, ...overrides };
      if (!mergedData.itemName.trim() || !mergedData.category || !mergedData.condition) {
        // Incomplete item cannot be saved to database yet
        return null;
      }

      setSaveStatus('saving');
      setSaveError(null);

      // Keep local state in sync
      if (resolvedSelectedOutcome !== undefined) setSelectedOutcome(resolvedSelectedOutcome);
      if (resolvedBranchId !== undefined) setSelectedBranchId(resolvedBranchId);
      if (resolvedRecommended !== undefined) setRecommendedOutcome(resolvedRecommended);
      if (resolvedCompleted !== undefined) setIsCompleted(resolvedCompleted);
      if (resolvedStep !== undefined) setCurrentStep(resolvedStep);
      if (resolvedChecklist !== undefined) setChecklistProgress(resolvedChecklist);

      try {
        if (assessmentId) {
          // Update existing assessment record (never duplicates)
          const updatePayload = toDatabasePayload(mergedData, {
            id: assessmentId,
            userId: user.id,
            currentStep: resolvedStep,
            isCompleted: resolvedCompleted,
            recommendedOutcome: resolvedRecommended,
            selectedOutcome: resolvedSelectedOutcome,
            selectedBranchId: resolvedBranchId,
            checklistProgress: resolvedChecklist,
          });

          await updateAssessment(assessmentId, updatePayload, currentToken);
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          return assessmentId;
        } else {
          // Create new assessment record
          const created = await createAssessment(mergedData, currentToken, {
            userId: user.id,
            currentStep: resolvedStep,
            isCompleted: resolvedCompleted,
            recommendedOutcome: resolvedRecommended,
            selectedOutcome: resolvedSelectedOutcome,
            selectedBranchId: resolvedBranchId,
            checklistProgress: resolvedChecklist,
          });

          setAssessmentId(created.id);
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          return created.id;
        }
      } catch (err: any) {
        console.error('Failed to save assessment to Supabase:', err);
        setSaveStatus('error');
        const errMsg = err.message || 'Failed to save record to cloud';
        setSaveError(errMsg);
        throw new Error(errMsg);
      }
    },
    [session, user, data, assessmentId, currentStep, isCompleted, recommendedOutcome, selectedOutcome, selectedBranchId, checklistProgress]
  );

  // Load Assessment by ID (resuming after refresh or from dashboard)
  const loadAssessment = useCallback(
    async (id: string): Promise<boolean> => {
      const currentToken = session?.access_token;
      if (!currentToken) return false;

      setSaveStatus('saving');
      try {
        const record = await getAssessment(id, currentToken);
        const {
          data: loadedData,
          currentStep: loadedStep,
          isCompleted: loadedCompleted,
          recommendedOutcome: loadedRecOutcome,
          selectedOutcome: loadedSelOutcome,
          selectedBranchId: loadedBranchId,
          checklistProgress: loadedChecklist,
        } = fromDatabaseRecord(record);

        setData(loadedData);
        setAssessmentId(record.id);
        setCurrentStep(loadedStep);
        setIsCompleted(loadedCompleted);
        setRecommendedOutcome(loadedRecOutcome);
        setSelectedOutcome(loadedSelOutcome);
        setSelectedBranchId(loadedBranchId);
        if (loadedChecklist) {
          setChecklistProgress(loadedChecklist);
        }
        setSaveStatus('saved');
        setLastSavedAt(new Date(record.updated_at));
        return true;
      } catch (err: any) {
        console.error('Failed to load assessment:', err);
        setSaveStatus('error');
        setSaveError(err.message || 'Unable to retrieve assessment');
        return false;
      }
    },
    [session]
  );

  // Delete an Assessment
  const deleteAssessmentRecord = useCallback(
    async (id: string): Promise<boolean> => {
      const currentToken = session?.access_token;
      if (!currentToken) return false;

      try {
        await deleteAssessment(id, currentToken);
        if (assessmentId === id) {
          resetData();
        }
        return true;
      } catch (err) {
        console.error('Failed to delete assessment:', err);
        return false;
      }
    },
    [session, assessmentId]
  );

  return (
    <AssessmentContext.Provider
      value={{
        data,
        assessmentId,
        saveStatus,
        saveError,
        lastSavedAt,
        currentStep,
        selectedOutcome,
        selectedBranchId,
        recommendedOutcome,
        isCompleted,
        checklistProgress,
        setCurrentStep,
        setSelectedOutcome,
        setSelectedBranchId,
        setChecklistProgress,
        updateData,
        resetData,
        saveAssessment,
        loadAssessment,
        deleteAssessmentRecord,
        isItemAssessed,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
