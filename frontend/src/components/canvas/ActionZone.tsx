import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, RefreshCw, ArrowDownToLine } from 'lucide-react';
import type { CanvasPayload, CanvasPayloadType } from './canvasTypes';
import { useCanvasProtocol } from './CanvasProtocolContext';

interface ActionZoneProps {
  id: string;
  accepts: CanvasPayloadType[];
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  activeColor?: string; // Tailwind color class e.g. 'bg-[#FFE600]'
  className?: string;
  onDrop: (payload: CanvasPayload) => Promise<boolean | void> | boolean | void;
  validate?: (payload: CanvasPayload) => { valid: boolean; reason?: string };
  children?: React.ReactNode;
}

export const ActionZone: React.FC<ActionZoneProps> = ({
  id,
  accepts,
  label,
  hint,
  icon,
  activeColor = 'bg-[#FFE600]',
  className = '',
  onDrop,
  validate,
  children,
}) => {
  const {
    registerZone,
    unregisterZone,
    activePayload,
    hoveredZoneId,
    setHoveredZone,
    executeDrop,
    activeZoneError,
    activeZoneSuccess,
    keyboardSelectedPayload,
    keyboardSelectPayload,
  } = useCanvasProtocol();

  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Register with Canvas Context
  useEffect(() => {
    registerZone({
      id,
      accepts,
      label,
      hint,
      onDrop,
      validate,
    });
    return () => unregisterZone(id);
  }, [id, accepts, label, hint, onDrop, validate, registerZone, unregisterZone]);

  const effectivePayload = activePayload || keyboardSelectedPayload;
  const isCandidate = Boolean(effectivePayload && accepts.includes(effectivePayload.type));
  const isTargetHovered = isHovered || hoveredZoneId === id;
  const currentError = activeZoneError?.zoneId === id ? activeZoneError.message : null;
  const currentSuccess = activeZoneSuccess?.zoneId === id ? activeZoneSuccess.message : null;

  // HTML5 Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isCandidate) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    if (!isHovered) {
      setIsHovered(true);
      setHoveredZone(id);
    }
  };

  const handleDragLeave = () => {
    setIsHovered(false);
    setHoveredZone(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    setHoveredZone(null);

    let droppedPayload: CanvasPayload | null = null;
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        droppedPayload = JSON.parse(dataStr);
      }
    } catch {
      droppedPayload = effectivePayload;
    }

    if (!droppedPayload) return;

    setIsProcessing(true);
    await executeDrop(id, droppedPayload);
    setIsProcessing(false);
  };

  // Keyboard Accessible Drop
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (keyboardSelectedPayload && isCandidate) {
        e.preventDefault();
        setIsProcessing(true);
        await executeDrop(id, keyboardSelectedPayload);
        setIsProcessing(false);
      }
    } else if (e.key === 'Escape' && keyboardSelectedPayload) {
      e.preventDefault();
      keyboardSelectPayload(null);
    }
  };

  // Pointer Up Drop (Touch / Pointer fallbacks)
  const handlePointerUp = async () => {
    if (effectivePayload && isCandidate && isHovered) {
      setIsProcessing(true);
      await executeDrop(id, effectivePayload);
      setIsProcessing(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onPointerUp={handlePointerUp}
      tabIndex={isCandidate ? 0 : -1}
      role="region"
      aria-label={`Action Zone: ${label}. ${hint || ''}`}
      className={`
        relative transition-all duration-200 outline-none select-none flex flex-col justify-center items-center text-center p-4 sm:p-5
        ${
          currentError
            ? 'bg-[#FFF5F5] border-3 border-[#DC2626] ring-4 ring-[#DC2626] shadow-[4px_4px_0px_#DC2626]'
            : currentSuccess
            ? 'bg-[#EBF7EE] border-3 border-[#10B25A] ring-4 ring-[#10B25A] shadow-[4px_4px_0px_#10B25A]'
            : isTargetHovered
            ? `${activeColor}/30 border-3 border-[#0B0B0B] ring-4 ring-[#0B0B0B] scale-[1.01] shadow-[6px_6px_0px_#0B0B0B]`
            : isCandidate
            ? 'bg-[#FFFBEB] border-2 sm:border-3 border-dashed border-[#0B0B0B] ring-4 ring-[#FFE600] ring-offset-2 ring-offset-[#F4EFE2] shadow-[4px_4px_0px_#0B0B0B] animate-pulse'
            : 'bg-[#FFFDF5] border-2 sm:border-3 border-dashed border-[#0B0B0B]/70 shadow-[2px_2px_0px_#0B0B0B]/30 hover:border-[#0B0B0B] hover:shadow-[4px_4px_0px_#0B0B0B]'
        }
        focus-visible:ring-4 focus-visible:ring-[#2A5BFF] focus-visible:ring-offset-2
        ${className}
      `}
    >
      {/* Zone Status Banner */}
      {currentError && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#DC2626] text-white border-2 border-[#0B0B0B] font-mono text-[10px] font-bold flex items-center gap-1 shadow-[2px_2px_0px_#0B0B0B] z-20 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{currentError}</span>
        </div>
      )}

      {currentSuccess && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#10B25A] text-white border-2 border-[#0B0B0B] font-mono text-[10px] font-bold flex items-center gap-1 shadow-[2px_2px_0px_#0B0B0B] z-20 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{currentSuccess}</span>
        </div>
      )}

      {/* Target Tag */}
      <div className="flex items-center gap-1 mb-1.5 font-mono text-[8.5px] uppercase tracking-widest text-[#6C6659] font-bold">
        <span className="w-1.5 h-1.5 bg-[#0B0B0B] inline-block" />
        <span>ACTION ZONE TARGET</span>
      </div>

      {/* Zone Visual Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`p-2 border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] ${
            isTargetHovered ? activeColor : 'bg-[#FFE600]'
          }`}
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 text-[#0B0B0B] animate-spin" />
          ) : icon ? (
            icon
          ) : (
            <Target className="w-4 h-4 text-[#0B0B0B]" />
          )}
        </div>

        <span className="font-mono text-xs sm:text-sm font-black uppercase text-[#0B0B0B] tracking-wide">
          {label}
        </span>
      </div>

      {/* Instruction Prompt */}
      <p className="font-mono text-[11px] text-[#544E43] max-w-sm leading-snug">
        {isTargetHovered ? (
          <strong className="text-[#0B0B0B] flex items-center justify-center gap-1 font-black">
            <ArrowDownToLine className="w-3.5 h-3.5 text-[#0B0B0B] animate-bounce" />
            <span>RELEASE PAYLOAD TO COMMIT ACTION</span>
          </strong>
        ) : isCandidate ? (
          <span className="text-[#0B0B0B] font-bold bg-[#FFE600] px-1.5 py-0.2 border border-[#0B0B0B]">
            Drop payload here (or press Enter)
          </span>
        ) : (
          hint || `Drag compatible token into this zone`
        )}
      </p>

      {/* Sub-Children or Slot Rendering */}
      {children && <div className="w-full mt-2">{children}</div>}
    </div>
  );
};
