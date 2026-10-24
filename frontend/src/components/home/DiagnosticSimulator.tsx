import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { ItemProfile } from './types';

const SAMPLE_ITEMS: ItemProfile[] = [
  {
    id: 'amp-1978',
    name: 'Vintage Stereo Amplifier',
    category: 'Audio Hardware',
    year: 1978,
    condition: 'Good chassis, right channel hum & silence',
    symptom: 'Dead electrolytic filter capacitors; corroded balance pot',
    partsAvailability: 'Abundant',
    repairCost: 42,
    replaceCost: 320,
    bestOutcome: 'REPAIR',
    viabilityScore: 92,
    rationale: 'Discrete through-hole electronics with standard capacitor values. High acoustic value and long expected service life once recapped.',
    firstStep: 'Discharge filter capacitors with an insulated resistor before probe testing.'
  },
  {
    id: 'keyboard-2021',
    name: 'Mechanical TKL Keyboard',
    category: 'Peripherals',
    year: 2021,
    condition: 'Liquid spill; intermittent row 3 keys',
    symptom: 'Sticky switch stems and PCB copper trace corrosion',
    partsAvailability: 'Abundant',
    repairCost: 18,
    replaceCost: 140,
    bestOutcome: 'REPAIR',
    viabilityScore: 84,
    rationale: 'Individual switches can be desoldered and replaced. Trace continuity bridgeable with 30AWG wire. 87% cheaper than replacement.',
    firstStep: 'Isolate PCB with 99% isopropyl alcohol bath and scrub corroded switch pins.'
  },
  {
    id: 'drill-2017',
    name: 'Cordless 18V Hammer Drill',
    category: 'Power Tools',
    year: 2017,
    condition: 'Motor runs hot with intermittent sparks',
    symptom: 'Worn carbon brushes and commutator scoring',
    partsAvailability: 'Moderate',
    repairCost: 26,
    replaceCost: 165,
    bestOutcome: 'REPURPOSE',
    viabilityScore: 68,
    rationale: 'Motor commutator scoring indicates heavy duty fatigue. While motor replacement is marginal, the 18V lithium battery pack and chuck are prime for shop bench conversion or rock-tumbler drive.',
    firstStep: 'Remove motor casing screws to inspect commutator ring wear depth.'
  },
  {
    id: 'monitor-2014',
    name: '24" IPS Office Monitor',
    category: 'Displays',
    year: 2014,
    condition: 'Power LED blinks 3 times, backlight stays black',
    symptom: 'Blown cold cathode inverter transformer on power supply board',
    partsAvailability: 'Scarce',
    repairCost: 65,
    replaceCost: 85,
    bestOutcome: 'RECYCLE',
    viabilityScore: 28,
    rationale: 'Obsolete inverter parts with high labor overhead. Modern replacement offers 4x energy efficiency, HDMI 2.1, and sub-$90 price point.',
    firstStep: 'Locate local certified e-Stewards drop-off facility for safe mercury backlight handling.'
  }
];

export const DiagnosticSimulator: React.FC = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemProfile>(SAMPLE_ITEMS[0]);
  const [faultSeverity, setFaultSeverity] = useState<number>(3);

  const calculatedViability = Math.max(
    15,
    Math.min(98, selectedItem.viabilityScore - (faultSeverity - 3) * 12)
  );
  
  const dynamicOutcome = calculatedViability >= 75 
    ? 'REPAIR' 
    : calculatedViability >= 55 
      ? 'REPURPOSE' 
      : calculatedViability >= 35 
        ? 'REUSE' 
        : 'RECYCLE';

  return (
    <div className="retro-box-lg bg-[#FFFDF5] p-5 sm:p-6 terminal-bracket-card">
      
      {/* Simulator Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-[#0B0B0B]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#FF3344] border border-[#0B0B0B] inline-block"></span>
          <span className="w-3 h-3 bg-[#FFE600] border border-[#0B0B0B] inline-block"></span>
          <span className="w-3 h-3 bg-[#10B25A] border border-[#0B0B0B] inline-block"></span>
          <span className="ml-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B0B]">
            Item Diagnostic Simulator
          </span>
        </div>
      </div>

      {/* Item Selector */}
      <div className="mb-5">
        <label className="block text-xs font-mono font-bold uppercase text-[#6C6659] mb-2">
          Select an item to evaluate:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-2 text-left font-mono text-xs border border-[#0B0B0B] transition-all ${
                selectedItem.id === item.id 
                  ? 'bg-[#FFE600] font-black shadow-[2px_2px_0px_#0B0B0B] -translate-y-0.5' 
                  : 'bg-[#F4EFE2] hover:bg-white text-[#6C6659]'
              }`}
            >
              <div className="font-bold truncate text-[#0B0B0B]">{item.name}</div>
              <div className="text-[10px] opacity-75">{item.year}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Item Telemetry Readout */}
      <div className="bg-[#F4EFE2] border-2 border-[#0B0B0B] p-4 mb-5 font-mono text-xs space-y-2.5">
        <div className="flex justify-between border-b border-[#0B0B0B]/20 pb-1.5">
          <span className="text-[#6C6659] font-bold">Item:</span>
          <span className="font-bold text-[#0B0B0B]">{selectedItem.name} ({selectedItem.category})</span>
        </div>
        <div className="flex justify-between border-b border-[#0B0B0B]/20 pb-1.5">
          <span className="text-[#6C6659] font-bold">Reported issue:</span>
          <span className="font-medium text-[#0B0B0B] text-right truncate max-w-[240px]">{selectedItem.symptom}</span>
        </div>
        <div className="flex justify-between border-b border-[#0B0B0B]/20 pb-1.5">
          <span className="text-[#6C6659] font-bold">Parts availability:</span>
          <span className={`font-bold px-1.5 border border-[#0B0B0B] ${
            selectedItem.partsAvailability === 'Abundant' ? 'bg-[#10B25A] text-white' :
            selectedItem.partsAvailability === 'Moderate' ? 'bg-[#FFE600] text-black' :
            'bg-[#FF3344] text-white'
          }`}>
            {selectedItem.partsAvailability}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-[#6C6659] font-bold">Cost comparison:</span>
          <span className="font-bold text-[#0B0B0B]">
            Repair: <strong className="text-[#10B25A]">${selectedItem.repairCost}</strong> vs Replace: <strong>${selectedItem.replaceCost}</strong>
          </span>
        </div>
      </div>

      {/* Interactive Fault Severity Slider */}
      <div className="mb-5 bg-white border-2 border-[#0B0B0B] p-3 shadow-[2px_2px_0px_#0B0B0B]">
        <div className="flex justify-between items-center mb-1.5 font-mono text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#2A5BFF]" />
            Condition / fault severity:
          </span>
          <span className="px-1.5 py-0.5 bg-[#0B0B0B] text-[#FFE600]">
            Level {faultSeverity} of 5
          </span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="5" 
          value={faultSeverity}
          onChange={(e) => setFaultSeverity(Number(e.target.value))}
          className="w-full accent-[#0B0B0B] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-[#6C6659] mt-1">
          <span>1: Minor wear</span>
          <span>3: Moderate fault</span>
          <span>5: Severe damage</span>
        </div>
      </div>

      {/* Synthesis Outcome Box */}
      <div className="border-2 border-[#0B0B0B] bg-[#FFFDF5] p-4 shadow-[3px_3px_0px_#0B0B0B]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-[#6C6659] uppercase">
            Recommended outcome:
          </span>
          <span className={`terminal-tag text-xs font-black ${
            dynamicOutcome === 'REPAIR' ? 'terminal-tag-yellow' :
            dynamicOutcome === 'REPURPOSE' ? 'terminal-tag-blue' :
            dynamicOutcome === 'REUSE' ? 'terminal-tag-green' :
            'terminal-tag-red'
          }`}>
            {dynamicOutcome} ({calculatedViability}% viability)
          </span>
        </div>

        <p className="text-xs font-sans text-[#262422] mb-3 leading-relaxed">
          {selectedItem.rationale}
        </p>

        <div className="bg-[#F4EFE2] border border-[#0B0B0B] p-2.5 font-mono text-[11px]">
          <span className="font-bold text-[#0B0B0B] block mb-1">
            Recommended next step:
          </span>
          <span className="text-[#262422]">{selectedItem.firstStep}</span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 flex items-center justify-between font-mono text-xs">
        <span className="text-[11px] text-[#6C6659]">
          Interactive specimen triage preview
        </span>
        {user ? (
          <Link
            to="/dashboard"
            className="retro-btn text-xs py-2 px-4 font-bold flex items-center gap-1.5"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            to="/signup"
            className="retro-btn text-xs py-2 px-4 font-bold flex items-center gap-1.5"
          >
            <span>Sign Up to Assess</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

    </div>
  );
};
