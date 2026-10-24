import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { CanvasPayload, ActionZoneRegistration } from './canvasTypes';
import { canvasAudio } from './canvasSound';

interface CanvasProtocolContextType {
  activePayload: CanvasPayload | null;
  hoveredZoneId: string | null;
  activeZoneError: { zoneId: string; message: string } | null;
  activeZoneSuccess: { zoneId: string; message: string } | null;
  isDragging: boolean;
  isAudioMuted: boolean;
  toggleAudio: () => void;
  startDrag: (payload: CanvasPayload) => void;
  endDrag: () => void;
  setHoveredZone: (zoneId: string | null) => void;
  registerZone: (zone: ActionZoneRegistration) => void;
  unregisterZone: (zoneId: string) => void;
  executeDrop: (zoneId: string, payload?: CanvasPayload) => Promise<boolean>;
  keyboardSelectPayload: (payload: CanvasPayload | null) => void;
  keyboardSelectedPayload: CanvasPayload | null;
  statusMessage: string;
  setStatusMessage: (msg: string) => void;
}

const CanvasProtocolContext = createContext<CanvasProtocolContextType | null>(null);

export const CanvasProtocolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePayload, setActivePayload] = useState<CanvasPayload | null>(null);
  const [hoveredZoneId, setHoveredZoneIdState] = useState<string | null>(null);
  const [activeZoneError, setActiveZoneError] = useState<{ zoneId: string; message: string } | null>(null);
  const [activeZoneSuccess, setActiveZoneSuccess] = useState<{ zoneId: string; message: string } | null>(null);
  const [keyboardSelectedPayload, setKeyboardSelectedPayload] = useState<CanvasPayload | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Drag any card into an action zone to execute'
  );

  const zonesRef = useRef<Map<string, ActionZoneRegistration>>(new Map());

  const registerZone = useCallback((zone: ActionZoneRegistration) => {
    zonesRef.current.set(zone.id, zone);
  }, []);

  const unregisterZone = useCallback((zoneId: string) => {
    zonesRef.current.delete(zoneId);
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      canvasAudio.setMuted(next);
      return next;
    });
  }, []);

  const startDrag = useCallback((payload: CanvasPayload) => {
    setActivePayload(payload);
    setActiveZoneError(null);
    setActiveZoneSuccess(null);
    canvasAudio.playPickup();
    setStatusMessage(`DRAGGING: ${payload.title.toUpperCase()} — DROP INTO MATCHING ACTION ZONE`);
  }, []);

  const endDrag = useCallback(() => {
    setActivePayload(null);
    setHoveredZoneIdState(null);
    setStatusMessage('Drag any card into an action zone to execute');
  }, []);

  const setHoveredZone = useCallback(
    (zoneId: string | null) => {
      setHoveredZoneIdState(zoneId);
      if (zoneId) {
        canvasAudio.playZoneHover();
        const reg = zonesRef.current.get(zoneId);
        if (reg) {
          setStatusMessage(`Targeting: [ ${reg.label} ] — Release to execute`);
        }
      }
    },
    []
  );

  const keyboardSelectPayload = useCallback((payload: CanvasPayload | null) => {
    setKeyboardSelectedPayload(payload);
    setActivePayload(payload);
    if (payload) {
      canvasAudio.playPickup();
      setStatusMessage(`Keyboard active: ${payload.title} selected — Tab to action zone and press Enter`);
    } else {
      setStatusMessage('Drag any card into an action zone to execute');
    }
  }, []);

  // Global Escape Key Listener to cancel active drag or keyboard selection
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePayload || keyboardSelectedPayload) {
          e.preventDefault();
          setActivePayload(null);
          setKeyboardSelectedPayload(null);
          setHoveredZoneIdState(null);
          setStatusMessage('Drag any card into an action zone to execute');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activePayload, keyboardSelectedPayload]);

  const executeDrop = useCallback(
    async (zoneId: string, explicitPayload?: CanvasPayload): Promise<boolean> => {
      const payloadToUse = explicitPayload || activePayload || keyboardSelectedPayload;
      if (!payloadToUse) return false;

      const registration = zonesRef.current.get(zoneId);
      if (!registration) {
        console.warn(`Action zone "${zoneId}" is not registered.`);
        return false;
      }

      // Check payload compatibility
      if (!registration.accepts.includes(payloadToUse.type)) {
        canvasAudio.playDropError();
        setActiveZoneError({
          zoneId,
          message: `INCOMPATIBLE: ${registration.label} does not accept ${payloadToUse.type.replace(/_/g, ' ')}`,
        });
        setTimeout(() => setActiveZoneError(null), 3000);
        return false;
      }

      // Validate action conditions
      if (registration.validate) {
        const val = registration.validate(payloadToUse);
        if (!val.valid) {
          canvasAudio.playDropError();
          setActiveZoneError({
            zoneId,
            message: val.reason || 'Validation failed for this action zone.',
          });
          setTimeout(() => setActiveZoneError(null), 3500);
          return false;
        }
      }

      // Execute drop handler
      try {
        canvasAudio.playDropSuccess();
        setActiveZoneSuccess({
          zoneId,
          message: `EXECUTED: ${registration.label}`,
        });
        setStatusMessage(`ACTION EXECUTED: [ ${registration.label.toUpperCase()} ] FOR ${payloadToUse.title.toUpperCase()}`);

        await registration.onDrop(payloadToUse);

        setTimeout(() => {
          setActiveZoneSuccess(null);
          setActivePayload(null);
          setKeyboardSelectedPayload(null);
        }, 1200);

        return true;
      } catch (err: any) {
        console.error('Error executing action zone drop:', err);
        canvasAudio.playDropError();
        setActiveZoneError({
          zoneId,
          message: err.message || 'Action failed during execution.',
        });
        setTimeout(() => setActiveZoneError(null), 3500);
        return false;
      }
    },
    [activePayload, keyboardSelectedPayload]
  );

  return (
    <CanvasProtocolContext.Provider
      value={{
        activePayload,
        hoveredZoneId,
        activeZoneError,
        activeZoneSuccess,
        isDragging: Boolean(activePayload),
        isAudioMuted,
        toggleAudio,
        startDrag,
        endDrag,
        setHoveredZone,
        registerZone,
        unregisterZone,
        executeDrop,
        keyboardSelectPayload,
        keyboardSelectedPayload,
        statusMessage,
        setStatusMessage,
      }}
    >
      {children}
    </CanvasProtocolContext.Provider>
  );
};

export const useCanvasProtocol = (): CanvasProtocolContextType => {
  const context = useContext(CanvasProtocolContext);
  if (!context) {
    throw new Error('useCanvasProtocol must be used within a CanvasProtocolProvider');
  }
  return context;
};
