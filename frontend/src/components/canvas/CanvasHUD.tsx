import React from 'react';

const SHORTCUTS = [
  { key: 'SPACE', label: 'Grab' },
  { key: 'TAB', label: 'Cycle' },
  { key: 'ENTER', label: 'Drop' },
  { key: 'ESC', label: 'Cancel' },
] as const;

export const CanvasHUD: React.FC = () => {
  return (
    <footer
      aria-label="Keyboard interaction instructions"
      className="w-full bg-[#0B0B0B] text-[#FFFDF5] border-t-2 border-[#FFE600] py-2 px-3 sm:px-6 font-mono z-30 flex-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-1.5 text-center">
        {SHORTCUTS.map((item) => (
          <div key={item.key} className="inline-flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-[#1F1E1D] border border-[#FFE600]/60 text-[#FFE600] font-mono font-bold text-[10px] tracking-wider select-none shadow-[1px_1px_0px_rgba(0,0,0,0.6)]">
              {item.key}
            </kbd>
            <span className="text-[#6C6659] text-[11px] select-none">—</span>
            <span className="text-[#D4CFBE] text-xs font-mono">{item.label}</span>
          </div>
        ))}
      </div>
    </footer>
  );
};

