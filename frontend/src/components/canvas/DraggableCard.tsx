import React, { useRef, useState } from 'react';
import { GripVertical, Move } from 'lucide-react';
import type { CanvasPayload } from './canvasTypes';
import { useCanvasProtocol } from './CanvasProtocolContext';

interface DraggableCardProps {
  payload: CanvasPayload;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onCardClick?: () => void;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  payload,
  children,
  className = '',
  disabled = false,
  onCardClick,
}) => {
  const { startDrag, endDrag, activePayload, keyboardSelectPayload, keyboardSelectedPayload } = useCanvasProtocol();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const isCurrentActive = activePayload?.id === payload.id && activePayload?.type === payload.type;
  const isKeyboardSelected = keyboardSelectedPayload?.id === payload.id && keyboardSelectedPayload?.type === payload.type;

  // 1. Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';

    if (cardRef.current) {
      cardRef.current.classList.add('opacity-40');
    }
    startDrag(payload);
  };

  const handleDragEnd = () => {
    if (cardRef.current) {
      cardRef.current.classList.remove('opacity-40');
    }
    endDrag();
  };

  // 2. Touch / Pointer Drag Fallback Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current || disabled) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);

    if (dx > 6 || dy > 6) {
      if (!isPointerDragging) {
        setIsPointerDragging(true);
        startDrag(payload);
      }
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    if (isPointerDragging) {
      setIsPointerDragging(false);
      endDrag();
    } else if (onCardClick) {
      onCardClick();
    }
  };

  // 3. Accessible Keyboard Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (isKeyboardSelected) {
        keyboardSelectPayload(null);
      } else {
        keyboardSelectPayload(payload);
      }
    } else if (e.key === 'Escape' && isKeyboardSelected) {
      e.preventDefault();
      keyboardSelectPayload(null);
    }
  };

  return (
    <div
      ref={cardRef}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-grabbed={isCurrentActive || isKeyboardSelected}
      aria-label={`Draggable Card: ${payload.title}. Press Space or drag into target action zone.`}
      className={`
        relative select-none transition-all duration-200 outline-none
        bg-[#FFFDF5] border-2 sm:border-3 border-[#0B0B0B]
        flex flex-col overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed bg-[#F4EFE2]' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:-translate-x-0.5'}
        ${
          isKeyboardSelected
            ? 'ring-4 ring-[#2A5BFF] ring-offset-2 ring-offset-[#FFFDF5] scale-[1.01] shadow-[6px_6px_0px_#0B0B0B]'
            : isCurrentActive
            ? 'ring-2 ring-[#0B0B0B] opacity-60 scale-[0.98] shadow-[2px_2px_0px_#0B0B0B]'
            : 'shadow-[4px_4px_0px_#0B0B0B] hover:shadow-[6px_6px_0px_#0B0B0B]'
        }
        focus-visible:ring-3 focus-visible:ring-[#2A5BFF] focus-visible:ring-offset-2
        ${className}
      `}
    >
      {/* Draggable Handle Bar */}
      <div className="flex-none w-full m-0 flex items-center justify-between px-3 py-1.5 bg-[#F4EFE2] border-b-2 border-[#0B0B0B] font-mono text-[9.5px] select-none">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-[#0B0B0B] shrink-0" />
          <span className="font-black uppercase tracking-wider text-[#0B0B0B]">
            {isKeyboardSelected ? 'SELECTED (TAB TO DROP)' : 'DRAGGABLE TOKEN'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {payload.badge && (
            <span
              className={`px-1.5 py-0.5 border border-[#0B0B0B] font-mono font-black text-[9px] uppercase shadow-[1px_1px_0px_#0B0B0B] ${
                payload.badgeColor || 'bg-[#FFE600] text-[#0B0B0B]'
              }`}
            >
              {payload.badge}
            </span>
          )}
          <Move className="w-3 h-3 text-[#6C6659] shrink-0" />
        </div>
      </div>

      {/* Card Payload Content */}
      <div className="flex-1 w-full flex flex-col justify-center p-3">
        {children}
      </div>
    </div>
  );
};
