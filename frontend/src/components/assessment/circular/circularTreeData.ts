import type { AssessmentData, ItemCategoryId } from '../types';
import type {
  OutcomeType,
  OutcomeViability,
  CircularOutcomeSector,
  OutcomeSubBranch,
  EvaluatedCircularTree,
  CircularActionPlan,
} from './circularTreeTypes';

/**
 * Standard angles for 5 circular outcomes arranged in a circle.
 * -90° (Top 12 o'clock), -18° (Top-right), 54° (Bottom-right), 126° (Bottom-left), 198° (Top-left).
 */
export const OUTCOME_ANGLES: Record<OutcomeType, number> = {
  repair: -90,
  reuse: -18,
  repurpose: 54,
  replace: 126,
  recycle: 198,
};

export const OUTCOME_METADATA: Record<
  OutcomeType,
  { title: string; iconName: string; bannerBg: string; borderColor: string }
> = {
  repair: {
    title: 'Repair',
    iconName: 'Wrench',
    bannerBg: 'bg-[#FFE600]',
    borderColor: 'border-[#0B0B0B]',
  },
  reuse: {
    title: 'Reuse',
    iconName: 'RefreshCw',
    bannerBg: 'bg-[#10B25A]',
    borderColor: 'border-[#0B0B0B]',
  },
  repurpose: {
    title: 'Repurpose',
    iconName: 'Sparkles',
    bannerBg: 'bg-[#2A5BFF]',
    borderColor: 'border-[#0B0B0B]',
  },
  replace: {
    title: 'Replace',
    iconName: 'ArrowUpRight',
    bannerBg: 'bg-[#FF9900]',
    borderColor: 'border-[#0B0B0B]',
  },
  recycle: {
    title: 'Recycle / Discard',
    iconName: 'Trash2',
    bannerBg: 'bg-[#6C6659]',
    borderColor: 'border-[#0B0B0B]',
  },
};

/**
 * Checks whether user input signals a hazard (swollen battery, burning, smoke, fire risk).
 */
function detectHazard(data: AssessmentData): boolean {
  const faultLower = (data.reportedFault || '').toLowerCase();
  const nameLower = (data.itemName || '').toLowerCase();
  const adaptiveStr = JSON.stringify(data.adaptiveAnswers || {}).toLowerCase();
  const allText = `${faultLower} ${nameLower} ${adaptiveStr}`;

  return (
    allText.includes('swollen') ||
    allText.includes('smoke') ||
    allText.includes('burn') ||
    allText.includes('spark') ||
    allText.includes('exploded') ||
    allText.includes('fire') ||
    allText.includes('chemical leak') ||
    allText.includes('gas leak')
  );
}

/**
 * Helper to compute truthful financial strings without inventing figures.
 */
function computeCostEfficiencyString(
  outcome: OutcomeType,
  repairCost: number | null | undefined,
  repairCostUnknown: boolean | undefined,
  replacementCost: number | null | undefined,
  replacementCostUnknown: boolean | undefined
): string {
  const hasRepair = typeof repairCost === 'number' && !repairCostUnknown && repairCost > 0;
  const hasReplace = typeof replacementCost === 'number' && !replacementCostUnknown && replacementCost > 0;

  if (outcome === 'reuse') {
    return '100% financial savings (zero outlay required)';
  }

  if (hasRepair && hasReplace) {
    const diff = replacementCost - repairCost;
    const savingsPercent = Math.round((diff / replacementCost) * 100);
    if (outcome === 'repair') {
      if (diff > 0) {
        return `Saves ₹${diff.toLocaleString('en-IN')} (${savingsPercent}%) vs replacement`;
      } else {
        return `Costs ₹${Math.abs(diff).toLocaleString('en-IN')} more than replacement`;
      }
    }
    if (outcome === 'replace') {
      return `Full replacement cost ₹${replacementCost.toLocaleString('en-IN')}`;
    }
    if (outcome === 'repurpose') {
      return `Repurposing salvages value from ₹${replacementCost.toLocaleString('en-IN')} initial asset`;
    }
    if (outcome === 'recycle') {
      return 'Recovers scrap residual value';
    }
  }

  if (hasRepair && outcome === 'repair') {
    return `Estimated repair cost: ₹${repairCost.toLocaleString('en-IN')}`;
  }

  if (hasReplace && outcome === 'replace') {
    return `Estimated replacement outlay: ₹${replacementCost.toLocaleString('en-IN')}`;
  }

  return 'Cost efficiency unverified (costs not provided)';
}

/**
 * Generates category-tailored sub-branches and action plans for each circular outcome.
 */
function generateCategorySubBranches(
  category: ItemCategoryId,
  data: AssessmentData,
  isHazard: boolean
): Record<OutcomeType, OutcomeSubBranch[]> {
  const { repairCost, repairCostUnknown, replacementCost, replacementCostUnknown } = data;
  const hasCostData = Boolean(
    typeof repairCost === 'number' && !repairCostUnknown &&
    typeof replacementCost === 'number' && !replacementCostUnknown
  );

  const baseConfidence = hasCostData ? 88 : 72;
  const confidenceLevel = hasCostData ? 'High' : 'Limited (Data Gaps)';

  // Helper for action plan builders
  const makePlan = (
    id: string,
    title: string,
    headline: string,
    rationale: string,
    wasteSaved: string,
    outcome: OutcomeType,
    feasibility: 'High (DIY / Low skill)' | 'Moderate (Local tech)' | 'Specialist Required',
    difficulty: 'Easy' | 'Moderate' | 'Advanced',
    co2Estimate: string,
    steps: string[],
    confAdj = 0
  ): CircularActionPlan => ({
    id,
    title,
    headline,
    rationale,
    confidenceScore: Math.max(40, Math.min(95, baseConfidence + confAdj)),
    confidenceLevel,
    wasteSavedEstimate: wasteSaved,
    costEfficiency: computeCostEfficiencyString(outcome, repairCost, repairCostUnknown, replacementCost, replacementCostUnknown),
    feasibility,
    difficulty,
    co2SavingsEstimate: co2Estimate,
    recommendedSteps: steps,
  });

  // Category-specific sub-branch generation
  switch (category) {
    case 'electronics':
      return {
        repair: [
          {
            id: 'elec_rep_modular',
            outcomeType: 'repair',
            title: 'Modular Sub-Component DIY Swap',
            shortLabel: 'DIY Modular Swap',
            description: 'Replace swappable battery, display assembly, charging port, or connector cable.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Modular replacement parts available; screws and connectors intact.',
            actionPlan: makePlan(
              'plan_elec_rep_modular',
              'Modular Sub-Component Swap',
              'Replace isolated faulty modular component while preserving core motherboard and display.',
              'Electronic devices often fail at isolated mechanical wear points (battery cell, port, switch). Replacing only that module restores original reliability without replacing working silicon.',
              'Preserves ~85% of total product mass & casing',
              'repair',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids high embodied manufacturing carbon of semiconductor chips',
              [
                'Safely power down device and disconnect power sources',
                'Source certified OEM or reputable aftermarket component',
                'Use anti-static mat and precision Torx/Pentalobe bits',
                'Inspect contacts, clean with isopropyl alcohol, and test before final sealing',
              ],
              +4
            ),
          },
          {
            id: 'elec_rep_specialist',
            outcomeType: 'repair',
            title: 'Specialist Bench Micro-Soldering & Board Diagnostics',
            shortLabel: 'Specialist Bench Overhaul',
            description: 'Logic-board reflow, chip-level power-IC replacement, or ribbon micro-soldering.',
            viability: isHazard ? 'hazardous' : 'viable',
            conditionCriteria: 'Requires hot-air rework station, multimeter, or microscope diagnostics.',
            actionPlan: makePlan(
              'plan_elec_rep_specialist',
              'Specialist Bench Micro-Soldering',
              'Engage a qualified electronics workshop for component-level PCB diagnosis and rework.',
              'Component-level board repair rescues devices written off by authorized service centres that only offer expensive total-unit swaps.',
              'Diverts high-density e-waste from smelting',
              'repair',
              'Specialist Required',
              'Advanced',
              'Prevents manufacturing replacement logic boards',
              [
                'Obtain diagnostic quote from certified independent repair bench',
                'Verify technician provides minimum 90-day warranty on board rework',
                'Back up user data if accessible prior to bench testing',
              ],
              -2
            ),
          },
        ],
        reuse: [
          {
            id: 'elec_reuse_secondary',
            outcomeType: 'reuse',
            title: 'Dedicated Secondary Domestic Role',
            shortLabel: 'Secondary Utility',
            description: 'Reposition as dedicated music streamer, home security monitor, webcam, or offline reader.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'viable',
            conditionCriteria: 'Retains processing and display functions despite minor cosmetic or battery degradation.',
            actionPlan: makePlan(
              'plan_elec_reuse_secondary',
              'Reposition into Secondary Domestic Utility',
              'Deploy older electronics in low-demand dedicated roles where high-speed multitasking is unnecessary.',
              'Electronics with degraded batteries or slower processors perform reliably when assigned a single dedicated task.',
              'Extracts 100% remaining useful service life without processing new materials',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero new emissions generated',
              [
                'Factory reset to clear sluggish software cache and background bloatware',
                'Install dedicated single-purpose app (media client, digital clock, web camera)',
                'Place in designated permanent dock with surge-protected power',
              ],
              +3
            ),
          },
          {
            id: 'elec_reuse_peer',
            outcomeType: 'reuse',
            title: 'Peer Circular Hand-off / Student Donation',
            shortLabel: 'Peer Donation / Resale',
            description: 'Donate or resell to students, community learning centers, or circular marketplaces.',
            viability: data.condition === 'broken_non_functional' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Fully functional or operational for basic tasks; safe for immediate use.',
            actionPlan: makePlan(
              'plan_elec_reuse_peer',
              'Circular Community Transfer',
              'Gift or sell to someone whose functional requirements match the hardware capability.',
              'Direct peer transfer displaces new manufacturing demand directly in the community.',
              '100% asset preservation in active economy',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Displaces immediate retail purchase of equivalent device',
              [
                'Sanitize user accounts and perform cryptographically secure wipe',
                'Clean surfaces and bundle charging accessories and cables',
                'Hand over to local school, community library, or peer platform',
              ],
              +5
            ),
          },
        ],
        repurpose: [
          {
            id: 'elec_repurpose_chassis',
            outcomeType: 'repurpose',
            title: 'Smart Hub / Sensor / Server Conversion',
            shortLabel: 'Smart Appliance Hub',
            description: 'Reconfigure hardware into home automation server, digital frame, or IoT terminal.',
            viability: 'viable',
            conditionCriteria: 'Core system boots; peripheral inputs/outputs functional.',
            actionPlan: makePlan(
              'plan_elec_repurpose_hub',
              'Home Automation / Sensor Server Conversion',
              'Repurpose working logic board into dedicated networked home server or dashboard.',
              'Modern electronics retain significant compute power that can run home servers and monitoring nodes for years.',
              'Saves dedicated micro-PC hardware from manufacture',
              'repurpose',
              'Moderate (Local tech)',
              'Moderate',
              'Eliminates purchasing single-purpose IoT devices',
              [
                'Disable display backlight timeout and battery power-management throttling',
                'Configure lightweight OS or dedicated dashboard web browser',
                'Enclose in ventilated protective housing',
              ]
            ),
          },
          {
            id: 'elec_repurpose_harvest',
            outcomeType: 'repurpose',
            title: 'Component Harvesting (Fasteners, Speakers, Magnets)',
            shortLabel: 'Component Harvest',
            description: 'Safely recover neodymium magnets, precision screws, display panels, and wiring.',
            viability: 'viable',
            conditionCriteria: 'Chassis damaged beyond repair, but discrete components remain sound.',
            actionPlan: makePlan(
              'plan_elec_repurpose_harvest',
              'Clean Component Salvage Protocol',
              'Dismantle damaged hardware and harvest reusable fasteners, speakers, antennas, and cabling.',
              'Repair shops and makers constantly need precision fasteners and connectors that are hard to buy individually.',
              'Recovers 100% of usable discrete parts',
              'repurpose',
              'High (DIY / Low skill)',
              'Easy',
              'Keeps specialty subcomponents out of landfills',
              [
                'Discharge all capacitive circuits safely',
                'Organize precision screws and fasteners into labeled parts bins',
                'Store intact display or driver assemblies in anti-static sleeves',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'elec_replace_refurb',
            outcomeType: 'replace',
            title: 'Certified Refurbished Hardware Swap',
            shortLabel: 'Refurbished Replacement',
            description: 'Purchase certified pre-owned device with warranty instead of brand new retail unit.',
            viability: 'viable',
            conditionCriteria: 'Current unit severely obsolete or uneconomical to repair.',
            actionPlan: makePlan(
              'plan_elec_replace_refurb',
              'Certified Pre-Owned Replacement',
              'Replace through reputable refurbisher providing tested hardware with warranty protection.',
              'Certified refurbishment avoids up to 75-80% of manufacturing carbon while delivering modern performance.',
              'Prevents new raw mineral extraction',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Significantly lower lifecycle carbon footprint than brand new retail',
              [
                'Compare certified refurbishment platforms offering minimum 6-12 month warranty',
                'Trade in old non-repairable device for circular recycling credit',
              ]
            ),
          },
          {
            id: 'elec_replace_upgrade',
            outcomeType: 'replace',
            title: 'Modular / High-Repairability Modern Upgrade',
            shortLabel: 'High-Repairability Upgrade',
            description: 'Invest in modern device designed with high repairability index and spare part guarantees.',
            viability: data.age === 'over_10_years' ? 'recommended' : 'alternative',
            conditionCriteria: 'Current hardware obsolete; security updates discontinued by manufacturer.',
            actionPlan: makePlan(
              'plan_elec_replace_upgrade',
              'Modular Repairable Replacement',
              'Select modern replacement with official teardown guides, modular parts, and extended OS support.',
              'Replacing ten-year-old hardware with modular, repair-friendly equipment ensures decade-long circular durability.',
              'Invests in circular design ecosystem',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Improved energy efficiency over legacy generation',
              [
                'Check manufacturer repairability rating (e.g. iFixit or EU repair index >= 8/10)',
                'Ensure manufacturer commits to spare part availability for >= 5 years',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'elec_rec_hazardous',
            outcomeType: 'recycle',
            title: 'Safe Hazardous Waste Deposition',
            shortLabel: 'Hazardous Safe Disposal',
            description: 'Safely handle swollen lithium batteries, broken mercury lamps, or leaking capacitors.',
            viability: isHazard ? 'recommended' : 'alternative',
            conditionCriteria: 'Physical deformation, battery swelling, chemical leak, or burning odor.',
            actionPlan: makePlan(
              'plan_elec_rec_hazardous',
              'Hazardous Cell Safety Deposition',
              'Deliver dangerous cell or damaged module to certified hazardous recovery specialist.',
              'Swollen or chemically unstable cells represent dangerous thermal runaway hazards that must never enter domestic trash.',
              'Prevents landfill fires and groundwater contamination',
              'recycle',
              'Specialist Required',
              'Easy',
              'Critical community safety and environmental protection',
              [
                'Tape battery terminals with non-conductive electrical tape immediately',
                'Place in sand-filled metal container away from combustible materials',
                'Hand directly to authorized municipal e-waste collection centre',
              ],
              +10
            ),
          },
          {
            id: 'elec_rec_metals',
            outcomeType: 'recycle',
            title: 'Certified Closed-Loop Precious Metal Smelting',
            shortLabel: 'Precious Metal Smelting',
            description: 'Recover gold, copper, palladium, and pure aluminum through authorized R2/e-Stewards recyclers.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'End of mechanical and electrical life; all repair pathways exhausted.',
            actionPlan: makePlan(
              'plan_elec_rec_metals',
              'Certified Precious Metal Recovery',
              'Channel non-functional chassis into licensed pyrometallurgical and hydrometallurgical recovery.',
              'One ton of circuit boards contains 40 to 800 times more gold than one ton of mined ore.',
              'Recovers 95% of strategic tech metals for reuse in manufacturing',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Dramatically reduces virgin mining requirements',
              [
                'Remove batteries for separate treatment',
                'Hand to authorized e-waste aggregator with valid manifest documentation',
              ]
            ),
          },
        ],
      };

    case 'appliances':
      return {
        repair: [
          {
            id: 'app_rep_diy',
            outcomeType: 'repair',
            title: 'Mechanical Wear Component Replacement (Belts, Pumps, Gaskets)',
            shortLabel: 'Wear Parts Replacement',
            description: 'Swap standard high-wear parts: door seal gaskets, motor belts, drain pump, or thermostat.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Chassis and drum/motor structurally sound; fault isolated to standard consumable part.',
            actionPlan: makePlan(
              'plan_app_rep_diy',
              'Consumable Wear Part Replacement',
              'Replace worn drive belt, rubber gasket, or valve with standard OEM spare part.',
              'Major domestic appliances are built around heavy-duty steel and enamel casings that outlast mechanical wear components by decades.',
              'Diverts 40-70 kg of heavy steel and enamel from scrappage',
              'repair',
              'High (DIY / Low skill)',
              'Moderate',
              'Avoids steel smelting and appliance manufacturing emissions',
              [
                'Unplug appliance and turn off water/gas mains if applicable',
                'Locate model identification plate and order exact matching part number',
                'Clean seating surfaces before installing new rubber gaskets or belts',
                'Run a complete test cycle while checking for leaks or abnormal vibration',
              ]
            ),
          },
          {
            id: 'app_rep_pro',
            outcomeType: 'repair',
            title: 'Licensed Appliance Technician Bench Service',
            shortLabel: 'Licensed Tech Service',
            description: 'Compressor overhaul, main motor bearing pull, or electronic control board repair.',
            viability: isHazard ? 'hazardous' : 'viable',
            conditionCriteria: 'Requires refrigerant gauge manifold, bearing pullers, or high-current electrical safety checks.',
            actionPlan: makePlan(
              'plan_app_rep_pro',
              'Licensed Technician Overhaul',
              'Engage certified appliance engineer for sealed system or motor assembly rebuild.',
              'Professional servicing of high-value appliances extends service life by 5 to 8 years at a fraction of new retail outlay.',
              'Saves heavy embodied energy equipment',
              'repair',
              'Specialist Required',
              'Advanced',
              'Preserves heavy manufacturing footprint of compressors and motors',
              [
                'Verify technician holds certified trade license and refrigerant handling credentials',
                'Request written itemised breakdown of parts vs labour',
                'Confirm warranty coverage for repaired subsystem',
              ]
            ),
          },
        ],
        reuse: [
          {
            id: 'app_reuse_demoted',
            outcomeType: 'reuse',
            title: 'Demoted Service (Workshop, Garage, Utility Room)',
            shortLabel: 'Secondary Utility Duty',
            description: 'Reassign to garage, basement, or utility room where cosmetic perfection or silent operation is secondary.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'viable',
            conditionCriteria: 'Cosmetically flawed or noisy, but functionally sound and electrically safe.',
            actionPlan: makePlan(
              'plan_app_reuse_demoted',
              'Secondary Utility Relocation',
              'Demote appliance to secondary utility duties in laundry room, workshop, or garage.',
              'Appliances retired from primary kitchen duty provide years of reliable service in secondary or intermittent roles.',
              '100% material retention with zero outlay',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero lifecycle carbon emissions added',
              [
                'Clean appliance thoroughly with mild degreaser and inspect power cord',
                'Install in dry, well-ventilated secondary location with adequate clearance',
              ]
            ),
          },
          {
            id: 'app_reuse_donate',
            outcomeType: 'reuse',
            title: 'Thrift / Community Shelter Donation',
            shortLabel: 'Community Donation',
            description: 'Donate working appliance to local student collective, community pantry, or shelter.',
            viability: data.condition === 'broken_non_functional' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Fully functional, safe wiring, hygienic condition.',
            actionPlan: makePlan(
              'plan_app_reuse_donate',
              'Community Shelter Transfer',
              'Pass functional appliance to community shelter or non-profit organisation in need.',
              'Working domestic appliances provide essential everyday utility to community groups and low-income households.',
              'Displaces purchasing new equipment for community facilities',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids manufacturing new domestic machinery',
              [
                'Test all cycles to verify reliable and safe operation',
                'Thoroughly sanitize drum, trays, and exterior seals',
                'Coordinate collection with local charity or community pantry',
              ]
            ),
          },
        ],
        repurpose: [
          {
            id: 'app_rep_garden',
            outcomeType: 'repurpose',
            title: 'Industrial Heavy-Duty Planter / Workshop Storage',
            shortLabel: 'Drum / Chassis Repurpose',
            description: 'Convert stainless steel washing drum into fire pit or patio planter; repurpose chassis into lockable tool cabinet.',
            viability: 'viable',
            conditionCriteria: 'Mechanical systems expired, but stainless steel drum or enamel chassis is intact.',
            actionPlan: makePlan(
              'plan_app_rep_garden',
              'Stainless Drum & Casing Conversion',
              'Convert perforated stainless washing drum into outdoor fire pit, patio brazier, or planter.',
              'Perforated appliance drums are made from surgical-grade stainless steel that resists rust and heat indefinitely.',
              'Repurposes 15-25 kg of high-grade alloy',
              'repurpose',
              'High (DIY / Low skill)',
              'Moderate',
              'Saves manufacturing specialized steel fire pits or planters',
              [
                'Carefully extract stainless drum using socket wrench and de-burr any sharp edges',
                'Mount sturdy metal legs using stainless bolts and washers',
              ]
            ),
          },
          {
            id: 'app_rep_motor',
            outcomeType: 'repurpose',
            title: 'Universal Motor & Solenoid Salvage',
            shortLabel: 'Motor & Solenoid Harvest',
            description: 'Harvest durable high-torque motor, solenoid valves, switches, and wiring harnesses for workshop projects.',
            viability: 'viable',
            conditionCriteria: 'Chassis rusted or broken, but internal motor and solenoid assemblies remain functional.',
            actionPlan: makePlan(
              'plan_app_rep_motor',
              'Heavy Motor & Parts Salvage',
              'Extract high-torque induction or inverter motor, wiring loom, and heavy switches for workshop utility.',
              'Appliance motors are engineered for heavy rotational loads and make exceptional lathe or grinder power units.',
              'Recovers 100% of usable copper and electro-mechanical parts',
              'repurpose',
              'Moderate (Local tech)',
              'Moderate',
              'Prevents manufacturing replacement shop power tools',
              [
                'Discharge motor run capacitors before touching terminal leads',
                'Label wire pin-outs and motor rotation direction',
                'Store in dry workshop inventory ready for tool projects',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'app_replace_star',
            outcomeType: 'replace',
            title: 'BEE 5-Star / Energy-Star Inverter Replacement',
            shortLabel: '5-Star Eco-Upgrade',
            description: 'Replace obsolete appliance with top-tier inverter model that cuts electricity and water consumption.',
            viability: (data.age === '5_to_10_years' || data.age === 'over_10_years') ? 'recommended' : 'alternative',
            conditionCriteria: 'Operating legacy unit incurs heavy recurring electrical penalties and water waste.',
            actionPlan: makePlan(
              'plan_app_replace_star',
              'BEE 5-Star Eco-Efficiency Replacement',
              'Upgrade to modern inverter technology designed with minimum 5-star energy rating and extended motor warranty.',
              'Retiring cooling and heating appliances older than 8-10 years frequently pays for itself in reduced utility tariffs.',
              'Significantly lowers operational carbon and water use',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Substantial annual operational carbon reduction',
              [
                'Select BEE 5-Star inverter model with minimum 10-year compressor/motor warranty',
                'Check manufacturer spare parts commitment and right-to-repair index',
                'Enroll in authorized retailer trade-in scheme to guarantee responsible disposal',
              ]
            ),
          },
          {
            id: 'app_replace_takeback',
            outcomeType: 'replace',
            title: 'Manufacturer Take-Back & Closed-Loop Credit',
            shortLabel: 'Take-Back Trade-in',
            description: 'Trade in obsolete unit through official OEM circular take-back scheme.',
            viability: 'viable',
            conditionCriteria: 'Manufacturer offers circular exchange credit and certified material reclamation.',
            actionPlan: makePlan(
              'plan_app_replace_takeback',
              'Manufacturer Circular Take-Back Trade-In',
              'Utilize manufacturer take-back programme to receive trade-in discount while ensuring closed-loop processing.',
              'Leading appliance manufacturers operate closed-loop material channels that feed scrap steel directly back into production.',
              'Guarantees verified recycling chain of custody',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Supports producer responsibility regulations',
              [
                'Verify retailer or OEM is registered under EPR (Extended Producer Responsibility) norms',
                'Confirm collection includes safe refrigerant evacuation',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'app_rec_haz',
            outcomeType: 'recycle',
            title: 'Certified Refrigerant & Oil Recovery',
            shortLabel: 'Refrigerant Recovery',
            description: 'Professionally evacuate fluorinated refrigerants (R134a, R600a) and compressor lubricant.',
            viability: isHazard ? 'recommended' : 'alternative',
            conditionCriteria: 'Cooling appliance reaching end-of-life; sealed gas circuit must not be vented.',
            actionPlan: makePlan(
              'plan_app_rec_haz',
              'Certified Refrigerant Evacuation',
              'Ensure licensed HVAC/refrigeration technician extracts gas into recovery cylinders before scrapping.',
              'Venting refrigerants directly damages the ozone layer and causes severe global warming impacts.',
              'Safeguards against atmospheric gas emissions',
              'recycle',
              'Specialist Required',
              'Easy',
              'Avoids massive greenhouse gas warming impact of uncontained fluorocarbons',
              [
                'Do not pierce or cut copper tubing at any time',
                'Arrange pickup with authorized municipal e-waste or white-goods facility equipped with recovery pumps',
              ]
            ),
          },
          {
            id: 'app_rec_metals',
            outcomeType: 'recycle',
            title: 'Ferrous Scrap Metal Smelting & Polymer Recovery',
            shortLabel: 'Scrap Metal Reclamation',
            description: 'Channel stripped steel chassis, copper coils, and cast weights to licensed smelters.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'Total structural collapse or burnt motor; all functional value exhausted.',
            actionPlan: makePlan(
              'plan_app_rec_metals',
              'Heavy Metal Smelting Reclamation',
              'Channel segregated steel, aluminium, and copper into secondary metallurgy smelters.',
              'Recycling appliance steel requires 74% less energy than refining virgin iron ore.',
              'Recovers 90-95% of metallic mass',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Preserves finite iron ore and metallurgical coal deposits',
              [
                'Strip external plastic panels from metal body if accessible',
                'Deliver to licensed scrap metal yard with weigh-bridge facility',
              ]
            ),
          },
        ],
      };

    case 'furniture':
      return {
        repair: [
          {
            id: 'furn_rep_joints',
            outcomeType: 'repair',
            title: 'Structural Joint Clamping & Fastener Tightening',
            shortLabel: 'Joint Re-Gluing & Clamping',
            description: 'Disassemble loose mortise/tenon joints, scrape old glue, apply PVA wood glue, and clamp securely.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Loose joints or wobbling frame; wood grain and members intact.',
            actionPlan: makePlan(
              'plan_furn_rep_joints',
              'Structural Joint Clamping & Fastener Rebuild',
              'Disassemble loose dowel or tenon joints, re-glue with woodworking adhesive, and clamp for 24 hours.',
              'Wobbly chairs and tables almost never have broken timber; the adhesive simply fails after years of humidity cycles. Re-gluing restores factory rigidity.',
              'Preserves 100% of seasoned timber and upholstery',
              'repair',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids logging, kiln-drying, and milling replacement lumber',
              [
                'Carefully tap loose joint apart using rubber mallet and scrap wood block',
                'Scrape off crystalline old glue using chisel or sandpaper without gouging timber',
                'Apply high-strength PVA wood glue generously into joint socket',
                'Clamp firmly with bar clamps for 24 hours, wiping off excess squeeze-out immediately',
              ]
            ),
          },
          {
            id: 'furn_rep_refinish',
            outcomeType: 'repair',
            title: 'Surface Stripping, Sanding & Oil/Wax Refinishing',
            shortLabel: 'Refinishing & Re-oiling',
            description: 'Sand out water stains, minor gouges, and sun fading; seal with natural tung oil, hardwax, or varnish.',
            viability: 'viable',
            conditionCriteria: 'Cosmetic surface degradation, water rings, or peeling lacquer; substrate solid.',
            actionPlan: makePlan(
              'plan_furn_rep_refinish',
              'Timber Refinishing & Protective Sealing',
              'Sand back blemished topcoat with progressive abrasive grits and seal with natural protective oil.',
              'Solid and veneered timber can be refinished repeatedly, unveiling clean grain that looks superior to modern synthetic laminates.',
              'Preserves heirloom-quality hardwood',
              'repair',
              'High (DIY / Low skill)',
              'Moderate',
              'Preserves high biogenic carbon stored in solid hardwoods',
              [
                'Clean surface with mild mineral spirit wash to remove grease',
                'Sand evenly along the wood grain using 120, 180, and 240 grit abrasive paper',
                'Vacuum dust and apply lint-free coat of natural hardwax oil or Danish oil',
              ]
            ),
          },
        ],
        reuse: [
          {
            id: 'furn_reuse_reposition',
            outcomeType: 'reuse',
            title: 'Domestic Repositioning (Patio, Workshop, Bedroom)',
            shortLabel: 'Secondary Room Placement',
            description: 'Move from formal living space to children’s room, covered patio, workshop, or home office.',
            viability: 'viable',
            conditionCriteria: 'Comfortable and safe, but no longer matches main living room decor.',
            actionPlan: makePlan(
              'plan_furn_reuse_reposition',
              'Domestic Secondary Placement',
              'Relocate furniture piece to low-traffic or secondary domestic space.',
              'Changing room context extends practical utility without requiring modifications or expenditure.',
              '100% value retention with zero material waste',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero carbon footprint',
              [
                'Wipe clean and add protective felt pads to legs to protect floors',
                'Position in suitable room away from direct rain and harsh sun',
              ]
            ),
          },
          {
            id: 'furn_reuse_thrift',
            outcomeType: 'reuse',
            title: 'Second-Hand Marketplace / Charity Thrift Hand-off',
            shortLabel: 'Thrift Exchange / Resale',
            description: 'List on local classifieds, neighborhood swap group, or donate to charity furniture store.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Structurally sound and functional; suitable for immediate everyday use.',
            actionPlan: makePlan(
              'plan_furn_reuse_thrift',
              'Circular Furniture Hand-Off',
              'Gift or sell to local household looking for durable, functional furniture.',
              'Solid furniture has a multi-decade life span and readily finds eager new owners on community exchange channels.',
              'Displaces demand for new flat-pack chipboard manufacturing',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Directly eliminates demand for new manufactured furniture',
              [
                'Take clean, well-lit photos highlighting solid construction and honest patina',
                'List dimensions (height, width, depth) accurately',
                'Arrange local kerbside pickup with purchaser or community NGO',
              ]
            ),
          },
        ],
        repurpose: [
          {
            id: 'furn_rep_timber',
            outcomeType: 'repurpose',
            title: 'Lumber Upcycling (Floating Shelves, Planter Boxes, Desk Riser)',
            shortLabel: 'Lumber Upcycling',
            description: 'Dismantle broken frames and cut clear lumber into wall shelving, monitor risers, or planters.',
            viability: 'viable',
            conditionCriteria: 'Primary frame broken or outdated, but individual planks and rails contain defect-free timber.',
            actionPlan: makePlan(
              'plan_furn_rep_timber',
              'Hardwood Plank & Shelf Upcycling',
              'Dismantle damaged carcass and cross-cut clear timber into floating shelves, desktop risers, or workshop benches.',
              'Old furniture lumber is often seasoned hardwood that is denser and more stable than newly harvested construction timber.',
              'Diverts 80-90% of timber from landfill',
              'repurpose',
              'High (DIY / Low skill)',
              'Moderate',
              'Keeps stored biogenic carbon locked into solid objects',
              [
                'Check all boards with a magnet to ensure all nails and screws are removed before cutting',
                'Cross-cut sound sections to desired lengths using handsaw or circular saw',
                'Sand cut edges smooth and apply quick coat of wax polish',
              ]
            ),
          },
          {
            id: 'furn_rep_hardware',
            outcomeType: 'repurpose',
            title: 'Hardware & Fastener Salvage (Hinges, Slides, Handles)',
            shortLabel: 'Hardware Salvage',
            description: 'Remove brass pulls, soft-close drawer slides, casters, and heavy joinery bolts for future projects.',
            viability: 'viable',
            conditionCriteria: 'Wood beyond salvage, but metal drawer slides, knobs, or hinges are in clean condition.',
            actionPlan: makePlan(
              'plan_furn_rep_hardware',
              'Cabinet Hardware Salvage',
              'Unscrew handles, steel drawer runners, hinges, and casters for workshop inventory.',
              'Quality furniture hardware is expensive when bought retail; harvesting salvages substantial value.',
              'Recovers 100% of durable metal fittings',
              'repurpose',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids buying newly manufactured metal hardware',
              [
                'Use appropriate screwdriver to remove screws without stripping heads',
                'Pair hinges and slides with their corresponding screws in small bags',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'furn_rep_modular',
            outcomeType: 'replace',
            title: 'Modular Circular Solid-Timber Upgrade',
            shortLabel: 'Circular Solid-Wood Upgrade',
            description: 'Replace with durable FSC-certified solid-wood furniture engineered for disassembly and repair.',
            viability: 'viable',
            conditionCriteria: 'Current unit irreparably broken or fails basic ergonomic and space needs.',
            actionPlan: makePlan(
              'plan_furn_rep_modular',
              'Modular Disassemblable Furniture Investment',
              'Choose replacement designed with knock-down joinery, replaceable cushions, and certified sustainable timber.',
              'Investing in modular furniture ensures individual components can be swapped or repaired independently over decades.',
              'Prevents short-lifecycle disposable furniture cycle',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Supports sustainable forestry certifications',
              [
                'Verify timber carries FSC or PEFC certification',
                'Ensure joinery uses mechanical bolts and fasteners rather than non-repairable industrial glue',
              ]
            ),
          },
          {
            id: 'furn_rep_vintage',
            outcomeType: 'replace',
            title: 'Vintage / Second-Hand Solid Hardwood Purchase',
            shortLabel: 'Vintage Hardwood Swap',
            description: 'Purchase vintage solid teak, sheesham, or oak piece from architectural salvage or antique dealers.',
            viability: 'viable',
            conditionCriteria: 'Desire high quality and durability at a lower cost and zero carbon impact.',
            actionPlan: makePlan(
              'plan_furn_rep_vintage',
              'Pre-Owned Vintage Furniture Acquisition',
              'Source pre-owned solid hardwood piece with proven generational longevity.',
              'Buying vintage solid timber delivers heirloom craftsmanship without cutting down a single new tree.',
              '100% zero embodied manufacturing footprint',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Displaces newly manufactured retail imports',
              [
                'Inspect joints and frame stability before purchasing',
                'Clean and apply fresh coat of natural wax',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'furn_rec_chipping',
            outcomeType: 'recycle',
            title: 'Clean Timber Chipping, Composting & Biomass',
            shortLabel: 'Wood Chipping & Mulch',
            description: 'Separate untreated clean lumber from treated boards for woodchip mulch, particle board, or biomass energy.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'End of mechanical life; timber split, rotted, or broken beyond repair.',
            actionPlan: makePlan(
              'plan_furn_rec_chipping',
              'Timber Segregation & Secondary Shredding',
              'Remove screws and send untreated timber to municipal wood chipping or particle-board recycling.',
              'Clean untreated timber can be chipped into garden mulch or re-pressed into composite building panels.',
              'Recovers 90% of organic wood fiber',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Returns organic nutrients to soil or displaces virgin wood chips',
              [
                'Remove all metal brackets, screws, hinges, and fabric staples',
                'Deliver clean timber to municipal organic green-waste or wood recycler',
              ]
            ),
          },
          {
            id: 'furn_rec_scrap',
            outcomeType: 'recycle',
            title: 'Ferrous Scrap Steel & Aluminium Reclamation',
            shortLabel: 'Metal Hardware Recycling',
            description: 'Strip steel frame supports, drawer slides, and screws and drop at local scrap metal yard.',
            viability: 'viable',
            conditionCriteria: 'Metal brackets and steel frame components extracted from broken carcass.',
            actionPlan: makePlan(
              'plan_furn_rec_scrap',
              'Metal Hardware Recycling',
              'Consolidate metallic frames, drawer tracks, and fittings for scrap smelting.',
              'Metals can be recycled infinitely without loss of structural properties.',
              'Recovers 100% of metals',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Dramatically reduces smelting energy vs virgin ore',
              [
                'Separate ferrous metals (magnetic) from aluminium and brass',
                'Drop at licensed metal aggregator',
              ]
            ),
          },
        ],
      };

    case 'clothing':
      return {
        repair: [
          {
            id: 'cloth_rep_mending',
            outcomeType: 'repair',
            title: 'Precision Seam, Button & Zipper Mending',
            shortLabel: 'Seam & Zipper Mending',
            description: 'Restitch blown seams, replace missing buttons, or lubricate / realign zipper sliders.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Fabric intact; failure isolated to thread, button, or zipper slider.',
            actionPlan: makePlan(
              'plan_cloth_rep_mending',
              'Precision Seam & Fastener Mending',
              'Restitch open seam with matching thread or install a replacement zipper pull slider.',
              'Over 80% of garments discarded for defects suffer only from separated stitches or a derailed zipper slider.',
              'Preserves 100% of textile fabric',
              'repair',
              'High (DIY / Low skill)',
              'Easy',
              'Prevents immense water and pesticide footprint of new cotton/synthetic fiber farming',
              [
                'Identify thread type (cotton vs polyester) and thread appropriate needle',
                'Use backstitch along the original seam line for permanent strength',
                'If zipper is sticking, rub pencil lead (graphite) or wax along teeth',
              ]
            ),
          },
          {
            id: 'cloth_rep_sashiko',
            outcomeType: 'repair',
            title: 'Visible Mending / Sashiko Denim Reinforcement',
            shortLabel: 'Visible Mending / Sashiko',
            description: 'Reinforce worn denim crotches or elbows with interior patch and Japanese Sashiko geometric stitching.',
            viability: 'viable',
            conditionCriteria: 'Fabric worn thin or torn in high-friction zone; garment retains personal value.',
            actionPlan: makePlan(
              'plan_cloth_rep_sashiko',
              'Sashiko Visible Mending Reinforcement',
              'Back worn fabric with supportive backing cloth and sew dense running stitches for artistic durability.',
              'Visible mending transforms worn areas into unique bespoke design features while doubling fabric durability.',
              'Extends garment life by multiple seasons',
              'repair',
              'High (DIY / Low skill)',
              'Moderate',
              'Diverts heavy-water denim farming emissions',
              [
                'Pin a supportive cotton patch behind the damaged area',
                'Using embroidery floss, sew parallel rows of running stitches across the rip',
                'Tie off securely on the inside for a comfortable, durable finish',
              ]
            ),
          },
        ],
        reuse: [
          {
            id: 'cloth_reuse_swap',
            outcomeType: 'reuse',
            title: 'Wardrobe Swap / Peer Hand-down',
            shortLabel: 'Peer Swap / Hand-Down',
            description: 'Exchange with friend or family member whose size or styling preferences match.',
            viability: data.condition === 'broken_non_functional' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Clean, undamaged condition; user simply outgrew size or style preferences.',
            actionPlan: makePlan(
              'plan_cloth_reuse_swap',
              'Direct Wardrobe Peer Exchange',
              'Pass garment to someone who will wear it immediately through clothing swap or family hand-down.',
              'Wearing an existing garment for just 9 months longer reduces its carbon, waste, and water footprints by 20-30%.',
              '100% clothing utility retention',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero production impact',
              [
                'Wash according to garment care label instructions',
                'Inspect for loose threads and clip clean',
                'Bring to local clothes swap meet or pass directly to peer',
              ]
            ),
          },
          {
            id: 'cloth_reuse_donation',
            outcomeType: 'reuse',
            title: 'Community Clothing Bank / Thrift Donation',
            shortLabel: 'Thrift Donation',
            description: 'Donate clean garments to vetted local community charities or second-hand thrift stores.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'viable',
            conditionCriteria: 'Clean, stain-free, and wearable.',
            actionPlan: makePlan(
              'plan_cloth_reuse_donation',
              'Vetted Community Clothing Donation',
              'Deliver wearable clothing to non-profit organizations supporting local vulnerable communities.',
              'Local charitable donations ensure garments reach people who need warm, practical clothing immediately.',
              'Displaces purchase of cheap fast-fashion imports',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids fast fashion manufacturing emissions',
              [
                'Wash and dry completely before packing to prevent mildew in storage',
                'Sort by seasonal category (winter vs summer)',
                'Drop off during official collection hours at local shelter or charity bank',
              ]
            ),
          },
        ],
        repurpose: [
          {
            id: 'cloth_rep_upcycle',
            outcomeType: 'repurpose',
            title: 'Workshop Rags / Reusable Tote Bags / Cleaning Cloths',
            shortLabel: 'Tote Bag / Workshop Rags',
            description: 'Cut non-repairable cotton t-shirts and jeans into lint-free cleaning cloths or sew into shopping totes.',
            viability: 'viable',
            conditionCriteria: 'Stained or heavily torn garments no longer suitable for wear.',
            actionPlan: makePlan(
              'plan_cloth_rep_upcycle',
              'Workshop Cleaning Rag & Tote Conversion',
              'Cut absorbent cotton garments into workshop rags or sew pant legs into durable market tote bags.',
              'Cotton textiles make superior lint-free workshop wipers that replace single-use paper towels and synthetic wipes.',
              'Diverts 100% of fabric mass from landfill',
              'repurpose',
              'High (DIY / Low skill)',
              'Easy',
              'Eliminates single-use paper towel consumption',
              [
                'Cut off thick seams, buttons, and zippers using heavy shears',
                'Cut remaining fabric into uniform 30x30 cm workshop cleaning squares',
                'Store in dispenser bucket in garage or kitchen for reusable wiping',
              ]
            ),
          },
          {
            id: 'cloth_rep_quilting',
            outcomeType: 'repurpose',
            title: 'Textile Patchwork & Insulation Stuffing',
            shortLabel: 'Patchwork & Cushion Stuffing',
            description: 'Shred fabric scraps into dense cushion/pillow stuffing or piece into patchwork quilts.',
            viability: 'viable',
            conditionCriteria: 'Fabric remnants of varied weights and colors.',
            actionPlan: makePlan(
              'plan_cloth_rep_quilting',
              'Patchwork & Cushion Stuffing Recovery',
              'Shred clean cotton and polyester fabric remnants to stuff draught excluders, pet beds, or floor cushions.',
              'Fabric scraps provide dense, hygienic thermal insulation and cushion stuffing that replaces synthetic polyester pellets.',
              'Recovers 100% of fiber mass',
              'repurpose',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids synthetic virgin stuffing purchases',
              [
                'Shred fabric remnants into small 2 cm ribbons using rotary cutter',
                'Pack tightly into pet cushion or draught excluder inner lining',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'cloth_rep_circular',
            outcomeType: 'replace',
            title: 'Monomaterial / Durable Organic Fiber Replacement',
            shortLabel: 'Monomaterial Durable Upgrade',
            description: 'Invest in 100% monomaterial garments (e.g. 100% organic cotton, wool, or linen) designed for recyclability.',
            viability: 'viable',
            conditionCriteria: 'Current garment beyond use; replacement must avoid blended synthetic microfibers.',
            actionPlan: makePlan(
              'plan_cloth_rep_circular',
              'Monomaterial Natural Fiber Upgrade',
              'Choose unblended 100% natural fiber garments engineered without blended synthetic polyester threads.',
              'Monomaterial garments are easily recycled mechanically at end of life, whereas poly-cotton blends are difficult to separate.',
              'Supports pesticide-free organic farming',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Eliminates synthetic microfiber shedding during washing',
              [
                'Check garment tag specifies 100% single fiber (e.g. 100% linen or organic cotton)',
                'Verify brand provides repair guarantee or take-back recycling scheme',
              ]
            ),
          },
          {
            id: 'cloth_rep_vintage',
            outcomeType: 'replace',
            title: 'Curated Vintage / Pre-Owned Second-Hand Acquisition',
            shortLabel: 'Vintage / Second-Hand Swap',
            description: 'Acquire high-grade pre-owned clothing from curated vintage dealers or consignment stores.',
            viability: 'viable',
            conditionCriteria: 'Desire high-quality durable wardrobe addition at lower cost and zero production footprint.',
            actionPlan: makePlan(
              'plan_cloth_rep_vintage',
              'Curated Pre-Owned Wardrobe Acquisition',
              'Source well-constructed vintage apparel with high stitch density and resilient natural fabrics.',
              'Pre-owned vintage garments have already survived years of wear, proving durability while generating zero new manufacturing footprint.',
              '100% zero manufacturing carbon outlay',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Zero water and pesticide use',
              [
                'Inspect seams, buttons, and zippers prior to purchase',
                'Air out and wash in cool water with gentle detergent',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'cloth_rec_shredding',
            outcomeType: 'recycle',
            title: 'Industrial Fiber Shoddy & Insulation Shredding',
            shortLabel: 'Fiber Shoddy Recycling',
            description: 'Channel post-consumer textiles into mechanical fiber pulling for automotive insulation and acoustic padding.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'Severely torn, rotted, or contaminated textile fibers unwearable in any form.',
            actionPlan: makePlan(
              'plan_cloth_rec_shredding',
              'Mechanical Fiber Shoddy Recovery',
              'Deliver unusable textiles to mechanical shredders that produce industrial shoddy and automotive felt insulation.',
              'Shredded textiles are re-spun into yarn or pressed into soundproofing acoustic panels for construction and vehicles.',
              'Diverts fiber from methane-producing municipal dumps',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Displaces synthetic fiberglass insulation',
              [
                'Ensure textiles are dry and free from grease or paint',
                'Deposit in designated municipal textile recycling drop box',
              ]
            ),
          },
          {
            id: 'cloth_rec_closed_loop',
            outcomeType: 'recycle',
            title: 'Chemical / Fiber-to-Fiber Closed-Loop Deposition',
            shortLabel: 'Fiber-to-Fiber Closed-Loop',
            description: 'Deposit in brand-sponsored circular collection schemes (e.g., Circulose, Renewcell fiber recycling).',
            viability: 'viable',
            conditionCriteria: 'Pure 100% cotton or pure polyester garments with intact fiber structure.',
            actionPlan: makePlan(
              'plan_cloth_rec_closed_loop',
              'Closed-Loop Fiber-to-Fiber Deposition',
              'Participate in brand take-back channels that dissolve cellulose back into virgin-grade textile pulp.',
              'Chemical recycling technologies dissolve cotton waste into clean pulp that spins into new lyocell fibers.',
              'Returns pure fiber directly to textile manufacturing',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Reduces virgin timber pulp harvesting for rayon/viscose',
              [
                'Check if garment brand maintains in-store circular take-back bins',
                'Remove any non-fabric trims if requested by the scheme',
              ]
            ),
          },
        ],
      };

    case 'tools':
      return {
        repair: [
          {
            id: 'tools_rep_wear',
            outcomeType: 'repair',
            title: 'Carbon Brush, Switch & Power Cord Replacement',
            shortLabel: 'Brush & Cord Swap',
            description: 'Replace worn motor carbon brushes, damaged power cables, or trigger switches in power tools.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Armature and gear casing intact; motor sparking or intermittent due to worn brushes/cord.',
            actionPlan: makePlan(
              'plan_tools_rep_wear',
              'Power Tool Brush & Cord Restoration',
              'Unscrew brush caps to install fresh carbon brushes, and replace frayed power cords with heavy rubber cabling.',
              'Power tool motors are designed with sacrificial carbon brushes that wear out after 50-100 hours of runtime. Replacing them takes 10 minutes and restores full motor torque.',
              'Preserves 95% of heavy copper and steel tool construction',
              'repair',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids manufacturing high-embodied-energy tool steel and copper windings',
              [
                'Unplug tool from mains power or remove lithium battery pack',
                'Unscrew slotted brush caps on motor housing and inspect brush length',
                'If under 5 mm or chipped, insert new matching carbon brushes with springs',
                'Inspect cord strain-relief boot and replace if internal copper conductors are exposed',
              ]
            ),
          },
          {
            id: 'tools_rep_sharpen',
            outcomeType: 'repair',
            title: 'Blade Sharpening, De-Rusting & Bearing Lubrication',
            shortLabel: 'Sharpening & De-rusting',
            description: 'De-rust blades in vinegar/citric acid, hone cutting edges with waterstones, and re-grease gearboxes.',
            viability: 'viable',
            conditionCriteria: 'Dull cutting edges, surface oxidation, or dry gearbox bearings; structural steel sound.',
            actionPlan: makePlan(
              'plan_tools_rep_sharpen',
              'Tool Steel Sharpening & Lubrication',
              'Remove surface rust with mild electrolyte or citric acid bath, hone cutting edges, and re-pack gearbox with lithium grease.',
              'Quality carbon steel and forged hand tools never expire; removing surface rust and honing edges restores them to lifetime service.',
              'Preserves heirloom-quality forged tool steel',
              'repair',
              'High (DIY / Low skill)',
              'Moderate',
              'Avoids virgin iron ore mining and induction hardening energy',
              [
                'Soak rusted steel parts in 5% white vinegar bath for 4-6 hours',
                'Scrub with brass wire brush and wipe dry immediately',
                'Hone edge using progressive sharpening stones and apply light coat of mineral oil or camellia oil',
              ]
            ),
          },
        ],
        reuse: [
          {
            id: 'tools_reuse_library',
            outcomeType: 'reuse',
            title: 'Community Tool Library / Maker Space Sharing',
            shortLabel: 'Tool Library Sharing',
            description: 'Lend or donate specialized tools to community tool libraries, repair cafes, or maker collectives.',
            viability: data.condition === 'broken_non_functional' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Functional tool used only occasionally by owner; high community utility.',
            actionPlan: makePlan(
              'plan_tools_reuse_library',
              'Community Tool Library Share',
              'Share infrequently used tools with community tool libraries or neighborhood maker spaces.',
              'The average power drill is used for less than 15 minutes across its entire working lifetime. Shared libraries maximize tool utility.',
              'Displaces dozens of individual retail tool purchases',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Massive cumulative manufacturing reduction across community',
              [
                'Wipe clean and confirm safety guards and accessories are attached',
                'Enroll tool in community tool library inventory system',
              ]
            ),
          },
          {
            id: 'tools_reuse_rough',
            outcomeType: 'reuse',
            title: 'Secondary Rough-Duty / Demolition Utility',
            shortLabel: 'Secondary Rough-Duty Role',
            description: 'Reassign worn chisels, drill bits, or utility saws to demolition, garden roots, or rough construction.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'viable',
            conditionCriteria: 'Cosmetically battered or past precision woodworking tolerances, but fine for rough work.',
            actionPlan: makePlan(
              'plan_tools_reuse_rough',
              'Secondary Demolition Utility',
              'Assign worn or chipped tools to rough utility roles where precision is not required.',
              'Using older tools for destructive tasks preserves primary fine tools from accidental damage.',
              '100% tool utility extraction',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero additional emissions',
              [
                'Mark handles with colored tape to distinguish from fine finish tools',
                'Store in rough workshop or garden bucket ready for heavy chores',
              ]
            ),
          },
        ],
        repurpose: [
          {
            id: 'tools_rep_jig',
            outcomeType: 'repurpose',
            title: 'Stationary Workshop Jig / Drill Press Conversion',
            shortLabel: 'Stationary Jig Conversion',
            description: 'Mount corded drill into vertical drill-press stand or angle grinder into metal chop-saw jig.',
            viability: 'viable',
            conditionCriteria: 'Handheld tool cumbersome or casing worn, but motor and spindle run true.',
            actionPlan: makePlan(
              'plan_tools_rep_jig',
              'Stationary Workshop Machine Conversion',
              'Mount handheld power tool into permanent bench jig or vertical slide.',
              'Old corded power tools provide immense continuous torque that excels in stationary workshop fixtures.',
              'Saves purchasing expensive dedicated stationary machinery',
              'repurpose',
              'High (DIY / Low skill)',
              'Moderate',
              'Prevents manufacturing heavy cast-iron stationary machinery',
              [
                'Fabricate sturdy plywood or aluminium mounting collar to hold tool securely',
                'Wire safety dead-man foot switch for safe emergency shutoff',
              ]
            ),
          },
          {
            id: 'tools_rep_steel',
            outcomeType: 'repurpose',
            title: 'Tool Steel Harvesting (Files, Chisels, Pry Bars)',
            shortLabel: 'Tool Steel Salvage',
            description: 'Re-grind broken files into custom carving knives, scrapers, marking gauges, or turning chisels.',
            viability: 'viable',
            conditionCriteria: 'Broken tool made of high-carbon W1 or O1 tool steel.',
            actionPlan: makePlan(
              'plan_tools_rep_steel',
              'High-Carbon Tool Steel Harvesting',
              'Re-grind broken files, planer blades, or leaf springs into bespoke shop knives, scrapers, and turning tools.',
              'Old files and heavy blades are forged from exceptional high-carbon tool steel that holds razor edges.',
              'Recovers 100% of valuable tool steel',
              'repurpose',
              'Moderate (Local tech)',
              'Moderate',
              'Replaces retail specialty steel bar purchases',
              [
                'Grind slowly with frequent water dips to avoid overheating and softening the steel temper',
                'Fashion custom ergonomic wooden handle from hardwood scrap',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'tools_rep_brushless',
            outcomeType: 'replace',
            title: 'Brushless High-Efficiency Standardized Platform Upgrade',
            shortLabel: 'Brushless Platform Upgrade',
            description: 'Upgrade to brushless motor system sharing standardized battery packs across all workshop tools.',
            viability: 'viable',
            conditionCriteria: 'Legacy tool non-repairable; new unit standardizes battery ecosystem.',
            actionPlan: makePlan(
              'plan_tools_rep_brushless',
              'Standardized Brushless Tool Upgrade',
              'Invest in brushless motor tool sharing an open or modular battery platform.',
              'Brushless motors eliminate mechanical carbon friction, delivering 50% longer runtimes and double the motor lifespan.',
              'Prevents battery redundancy by sharing packs across all tools',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'High electrical efficiency and fewer battery replacements over lifetime',
              [
                'Choose a platform with wide tool compatibility so 2-3 batteries power all equipment',
                'Verify brand provides bare-tool purchasing options to avoid redundant chargers',
              ]
            ),
          },
          {
            id: 'tools_rep_used',
            outcomeType: 'replace',
            title: 'Commercial-Grade Pre-Owned / Refurbished Tool Swap',
            shortLabel: 'Refurbished Professional Unit',
            description: 'Acquire refurbished commercial-grade tool with all-metal gearbox instead of cheap DIY retail unit.',
            viability: 'viable',
            conditionCriteria: 'Desires industrial durability at affordable outlay.',
            actionPlan: makePlan(
              'plan_tools_rep_used',
              'Commercial Refurbished Tool Swap',
              'Purchase tested commercial-grade tool offering all-metal gearing and serviceable bearings.',
              'Commercial tools are designed for teardown and maintenance, outlasting entry-level consumer tools tenfold.',
              'Halves lifecycle environmental footprint of tool ownership',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids single-use consumer tool manufacturing',
              [
                'Source from tool refurbishers offering tested warranties',
                'Register tool serial number for ongoing parts support',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'tools_rec_batteries',
            outcomeType: 'recycle',
            title: 'Power Tool Battery Safe Recovery (NiMH, Li-Ion)',
            shortLabel: 'Battery Recovery',
            description: 'Drop depleted battery packs at certified Call2Recycle battery recovery kiosks.',
            viability: isHazard ? 'recommended' : 'alternative',
            conditionCriteria: 'Power tool battery pack dead or swollen; internal cell resistance high.',
            actionPlan: makePlan(
              'plan_tools_rec_batteries',
              'Power Tool Battery Cell Recovery',
              'Deliver dead or swollen battery packs to dedicated certified battery recycling stations.',
              'Power tool packs contain high-drain lithium-ion cells with cobalt and nickel that require specialized thermal recovery.',
              'Recovers strategic battery minerals safely',
              'recycle',
              'Specialist Required',
              'Easy',
              'Prevents dangerous trash fires and soil toxicity',
              [
                'Cover battery terminals with electrical tape',
                'Drop at tool retailer battery collection bin',
              ]
            ),
          },
          {
            id: 'tools_rec_scrap',
            outcomeType: 'recycle',
            title: 'Heavy Tool Steel & Cast-Iron Smelting',
            shortLabel: 'Tool Steel Smelting',
            description: 'Consolidate cast-iron casings, steel drill bits, and aluminium gear housings for secondary smelting.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'Cracked cast-iron housing or shattered motor core beyond any repair.',
            actionPlan: makePlan(
              'plan_tools_rec_scrap',
              'Heavy Tool Steel & Cast Iron Smelting',
              'Channel broken metal housings and bits to heavy secondary metal foundries.',
              'Tool steel alloys have high commercial value in secondary metallurgical refining.',
              'Recovers 95% of high-grade alloy',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Reduces virgin mining of tungsten, molybdenum, and chrome',
              [
                'Separate plastic housings from metal gearboxes',
                'Drop at licensed scrap yard',
              ]
            ),
          },
        ],
      };

    default: // 'other' category and custom categories
      return {
        repair: [
          {
            id: 'gen_rep_modular',
            outcomeType: 'repair',
            title: 'Modular Mechanical / Component Swap',
            shortLabel: 'Component Swap',
            description: 'Replace identified broken hardware component, fastener, or wear part.',
            viability: isHazard ? 'hazardous' : 'recommended',
            conditionCriteria: 'Standard fasteners or replacement parts accessible; structure intact.',
            actionPlan: makePlan(
              'plan_gen_rep_modular',
              'Component-Level Restoration',
              'Isolate faulty component and swap with certified replacement or equivalent modular part.',
              'Most everyday objects fail at single wear points while the remaining 90% of material structure is in healthy condition.',
              'Preserves ~80-90% of overall product materials',
              'repair',
              'High (DIY / Low skill)',
              'Easy',
              'Avoids manufacturing total replacement item',
              [
                'Safely disassemble object using non-destructive screwdrivers or pry tools',
                'Clean seating surfaces and inspect adjacent parts for wear',
                'Install replacement part and verify proper alignment',
                'Perform functionality check under normal operating conditions',
              ]
            ),
          },
          {
            id: 'gen_rep_bench',
            outcomeType: 'repair',
            title: 'Professional Bench / Repair Cafe Service',
            shortLabel: 'Specialist Bench Service',
            description: 'Engage local repair specialist, craftsman, or community repair cafe volunteer.',
            viability: isHazard ? 'hazardous' : 'viable',
            conditionCriteria: 'Requires specialist tools, welding, stitching, or electronic diagnostic instruments.',
            actionPlan: makePlan(
              'plan_gen_rep_bench',
              'Specialist Overhaul & Rebuild',
              'Take item to local skilled repair specialist or community repair cafe for expert diagnosis.',
              'Supporting local skilled repair keeps artisanal skills in the community while preventing premature disposal.',
              'Extends product life with minimal new raw materials',
              'repair',
              'Moderate (Local tech)',
              'Moderate',
              'Preserves embodied energy in manufactured items',
              [
                'Obtain written diagnosis and estimate from local technician',
                'Confirm replacement parts match OEM or certified specifications',
                'Request testing under load before collecting',
              ]
            ),
          },
        ],
        reuse: [
          {
            id: 'gen_reuse_secondary',
            outcomeType: 'reuse',
            title: 'Secondary Utility Duty (Backup / Low-Demand Role)',
            shortLabel: 'Secondary Utility',
            description: 'Reposition into backup duty, storage room, or secondary location.',
            viability: data.condition === 'severe_structural_failure' ? 'unfavorable' : 'viable',
            conditionCriteria: 'Retains safe operational status despite cosmetic wear.',
            actionPlan: makePlan(
              'plan_gen_reuse_secondary',
              'Domestic Secondary-Life Deployment',
              'Reposition item into secondary or low-intensity duty.',
              'Items retired from primary everyday use often deliver years of reliable service in backup roles.',
              '100% utility retention with zero expenditure',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Zero carbon footprint',
              [
                'Wipe clean and verify baseline safety',
                'Label clearly as backup or secondary equipment',
                'Store in dry environment ready for deployment',
              ]
            ),
          },
          {
            id: 'gen_reuse_donation',
            outcomeType: 'reuse',
            title: 'Direct Peer Donation / Community Thrift Exchange',
            shortLabel: 'Donation / Resale',
            description: 'Transfer directly to a student, charity, or second-hand marketplace.',
            viability: data.condition === 'broken_non_functional' ? 'unfavorable' : 'recommended',
            conditionCriteria: 'Functional hardware with useful service life for someone with simpler needs.',
            actionPlan: makePlan(
              'plan_gen_reuse_donation',
              'Circular Community Transfer',
              'Gift or sell to a community member to displace a new manufacturing purchase.',
              'Direct transfer keeps carbon emissions strictly at zero while delivering high utility to new owners.',
              'Directly displaces demand for new manufacturing',
              'reuse',
              'High (DIY / Low skill)',
              'Easy',
              'Displaces retail purchase of new item',
              [
                'Clean thoroughly and document condition honestly',
                'Include any spare accessories or documentation',
                'Drop off at community center or peer circular platform',
              ]
            ),
          },
        ],
        repurpose: [
          {
            id: 'gen_rep_functional',
            outcomeType: 'repurpose',
            title: 'Creative Functional Adaptation & Upcycling',
            shortLabel: 'Functional Conversion',
            description: 'Transform hardware chassis or components into an entirely new functional object.',
            viability: 'viable',
            conditionCriteria: 'Primary function impaired, but enclosure or subsystem possesses high secondary utility.',
            actionPlan: makePlan(
              'plan_gen_rep_functional',
              'Smart Repurposing Adaptation',
              'Convert intact parts into dedicated storage units, workshop tools, or creative fixtures.',
              'Repurposing salvages value from items that are otherwise uneconomical to return to original state.',
              'Diverts 70-90% of material mass',
              'repurpose',
              'High (DIY / Low skill)',
              'Moderate',
              'Saves purchasing single-purpose items',
              [
                'Safely disconnect or isolate non-functional sub-assemblies',
                'Adapt chassis to new designated position or role',
                'Mount securely and test stability',
              ]
            ),
          },
          {
            id: 'gen_rep_harvest',
            outcomeType: 'repurpose',
            title: 'Raw Material & Hardware Component Harvesting',
            shortLabel: 'Component Harvest',
            description: 'Harvest durable fasteners, springs, timber planks, motors, or clean metals.',
            viability: 'viable',
            conditionCriteria: 'Item possesses dense, high-grade materials with ongoing workshop utility.',
            actionPlan: makePlan(
              'plan_gen_rep_harvest',
              'Material Harvesting Protocol',
              'Dismantle cleanly and stock workshop parts inventory.',
              'Fasteners, quality metals, motors, and timber boards never lose utility. Harvesting stock saves money and waste.',
              'Recovers 100% of valuable mechanical subcomponents',
              'repurpose',
              'High (DIY / Low skill)',
              'Easy',
              'Builds permanent workshop spare parts stock',
              [
                'Dismantle using appropriate bit drivers without breaking screw heads',
                'Sort screws, nuts, bolts, and springs into compartment storage',
                'Store reclaimed materials in clean storage rack',
              ]
            ),
          },
        ],
        replace: [
          {
            id: 'gen_rep_efficiency',
            outcomeType: 'replace',
            title: 'Modern High-Efficiency / Durable Replacement',
            shortLabel: 'Eco-Upgrade',
            description: 'Replace with durable, high-efficiency model that lowers operational expenses.',
            viability: (data.age === '5_to_10_years' || data.age === 'over_10_years') ? 'recommended' : 'alternative',
            conditionCriteria: 'Operating old unit imposes safety, ergonomic, or energy penalties.',
            actionPlan: makePlan(
              'plan_gen_rep_efficiency',
              'High-Efficiency Modern Replacement',
              'Upgrade to modern, durable unit designed with long warranty and repairability.',
              'Replacing old equipment when repair costs are disproportionate improves reliability and reduces recurring breakdowns.',
              'Lowers lifetime operational footprint',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Improved efficiency over outdated legacy models',
              [
                'Select replacement model with verified repairability and spare part support',
                'Check manufacturer warranty coverage',
                'Trade-in old unit through authorized take-back program',
              ]
            ),
          },
          {
            id: 'gen_rep_refurb',
            outcomeType: 'replace',
            title: 'Certified Refurbished / Pre-Owned Alternative',
            shortLabel: 'Refurbished Swap',
            description: 'Acquire a professionally refurbished certified unit with full warranty.',
            viability: 'viable',
            conditionCriteria: 'Balances low budget with modern reliability and warranty.',
            actionPlan: makePlan(
              'plan_gen_rep_refurb',
              'Certified Refurbished Replacement',
              'Buy certified pre-owned with warranty instead of brand new.',
              'Buying refurbished avoids most of the manufacturing footprint while delivering dependable performance.',
              'Avoids majority of embodied carbon footprint',
              'replace',
              'High (DIY / Low skill)',
              'Easy',
              'Saves new resource extraction and factory processing',
              [
                'Source from certified refurbished vendors offering minimum 6-12 month warranty',
                'Recycle old non-repairable unit via seller take-back incentive',
              ]
            ),
          },
        ],
        recycle: [
          {
            id: 'gen_rec_hazardous',
            outcomeType: 'recycle',
            title: 'Safe Hazardous Waste Deposition',
            shortLabel: 'Hazardous Safe Disposal',
            description: 'Safely dispose of toxic chemicals, pressurized containers, or batteries.',
            viability: isHazard ? 'recommended' : 'alternative',
            conditionCriteria: 'Contains chemicals or batteries that risk fire or groundwater toxicity.',
            actionPlan: makePlan(
              'plan_gen_rec_hazardous',
              'Certified Hazardous Recycling',
              'Deposit safely at an authorized hazardous recovery facility.',
              'Pressurized or chemically unstable components require professional thermal deactivation.',
              'Prevents landfill fires and groundwater contamination',
              'recycle',
              'Specialist Required',
              'Easy',
              'Critical community safety and environmental protection',
              [
                'Tape exposed electrical terminals with non-conductive electrical tape',
                'Store in fireproof container away from flammable materials',
                'Drop off at municipal hazardous collection depot',
              ]
            ),
          },
          {
            id: 'gen_rec_materials',
            outcomeType: 'recycle',
            title: 'Scrap Metal & Pure Polymer Reclamation',
            shortLabel: 'Material Reclamation',
            description: 'Channel clean metals and pure plastics into closed-loop secondary smelting.',
            viability: data.condition === 'severe_structural_failure' ? 'recommended' : 'alternative',
            conditionCriteria: 'End of mechanical life; pure materials can be recycled infinitely.',
            actionPlan: makePlan(
              'plan_gen_rec_materials',
              'Closed-Loop Material Smelting',
              'Channel segregated scrap metal into secondary smelters.',
              'Recycling aluminium and steel consumes up to 95% less energy than refining virgin ores.',
              'Recovers 90-95% of metallic elements',
              'recycle',
              'High (DIY / Low skill)',
              'Easy',
              'Preserves finite ore deposits',
              [
                'Separate ferrous metals from non-ferrous metals',
                'Remove plastic outer coverings where accessible',
                'Drop at licensed scrap yard or aggregator',
              ]
            ),
          },
        ],
      };
  }
}

/**
 * Evaluates the full circular decision tree using transparent, grounded decision intelligence.
 */
export function evaluateCircularDecisionTree(data: AssessmentData): EvaluatedCircularTree {
  const category = data.category || 'other';
  const condition = data.condition;
  const isHazard = detectHazard(data);
  const subBranches = generateCategorySubBranches(category, data, isHazard);

  const isBrokenSeverely = condition === 'severe_structural_failure';
  const isBrokenNonFunctional = condition === 'broken_non_functional';
  const isMinorOrMint = condition === 'mint_minor_issue';
  const isPartiallyFunctional = condition === 'partially_functional';

  // Check data limitations honestly
  const overallDataLimitations: string[] = [];
  const repairCostProvided = typeof data.repairCost === 'number' && !data.repairCostUnknown && data.repairCost > 0;
  const replacementCostProvided = typeof data.replacementCost === 'number' && !data.replacementCostUnknown && data.replacementCost > 0;

  if (!repairCostProvided) {
    overallDataLimitations.push('Repair cost not specified by user; financial feasibility evaluated via category heuristics.');
  }
  if (!replacementCostProvided) {
    overallDataLimitations.push('Replacement cost not specified by user; relative purchase comparison cannot be verified.');
  }
  if (data.expectedLifespanUnknown || !data.expectedLifespanYears) {
    overallDataLimitations.push('Expected lifespan extension unknown; longevity projection based on condition grade.');
  }

  // 1. DIMENSION 1: SAFETY (0 - 100)
  const safetyScores: Record<OutcomeType, number> = {
    repair: isHazard ? 15 : 95,
    reuse: isHazard ? 10 : 90,
    repurpose: isHazard ? 20 : 85,
    replace: 95,
    recycle: 99,
  };

  // 2. DIMENSION 2: TECHNICAL FEASIBILITY (0 - 100)
  const feasibilityScores: Record<OutcomeType, number> = {
    repair: 85,
    reuse: 80,
    repurpose: 75,
    replace: 90,
    recycle: 95,
  };

  if (isBrokenSeverely) {
    feasibilityScores.repair = 35;
    feasibilityScores.reuse = 20;
    feasibilityScores.repurpose = 85;
    feasibilityScores.replace = 95;
    feasibilityScores.recycle = 95;
  } else if (isBrokenNonFunctional) {
    feasibilityScores.repair = 75;
    feasibilityScores.reuse = 40;
    feasibilityScores.repurpose = 80;
    feasibilityScores.replace = 90;
    feasibilityScores.recycle = 85;
  } else if (isPartiallyFunctional) {
    feasibilityScores.repair = 92;
    feasibilityScores.reuse = 80;
    feasibilityScores.repurpose = 75;
    feasibilityScores.replace = 75;
    feasibilityScores.recycle = 60;
  } else if (isMinorOrMint) {
    feasibilityScores.repair = 98;
    feasibilityScores.reuse = 95;
    feasibilityScores.repurpose = 60;
    feasibilityScores.replace = 60;
    feasibilityScores.recycle = 40;
  }

  // 3. DIMENSION 3: ECONOMIC VIABILITY (0 - 100, or null if missing)
  let economicScores: Record<OutcomeType, number | null> = {
    repair: null,
    reuse: 95, // Reuse is always high economic viability (zero new outlay)
    repurpose: 80,
    replace: null,
    recycle: 50,
  };

  if (repairCostProvided && replacementCostProvided) {
    const costRatio = (data.repairCost as number) / (data.replacementCost as number);
    if (costRatio <= 0.30) {
      // Very cheap repair compared to buying new
      economicScores.repair = 95;
      economicScores.replace = 40;
      economicScores.repurpose = 70;
    } else if (costRatio <= 0.60) {
      // Moderate repair
      economicScores.repair = 80;
      economicScores.replace = 65;
      economicScores.repurpose = 75;
    } else if (costRatio <= 0.85) {
      // Expensive repair
      economicScores.repair = 50;
      economicScores.replace = 85;
      economicScores.repurpose = 80;
    } else {
      // Uneconomical repair (repair costs more than 85% of replacement)
      economicScores.repair = 25;
      economicScores.replace = 95;
      economicScores.repurpose = 85;
    }
  } else if (repairCostProvided && !replacementCostProvided) {
    economicScores.repair = (data.repairCost as number) < 3000 ? 85 : 60;
  }

  // 4. DIMENSION 4: CIRCULAR & ENVIRONMENTAL IMPACT (0 - 100)
  // Circular hierarchy: Reuse (95) > Repair (90) > Repurpose (80) > Recycle (65) > Replace (35-60)
  const circularScores: Record<OutcomeType, number> = {
    repair: 90,
    reuse: 98,
    repurpose: 82,
    replace: 45,
    recycle: 68,
  };

  // If old appliance > 10 yrs, replace gets better circular score due to massive energy efficiency
  if (category === 'appliances' && (data.age === '5_to_10_years' || data.age === 'over_10_years')) {
    circularScores.replace = 75;
  }

  // 5. DIMENSION 5: USER ALIGNMENT (0 - 100)
  const userScores: Record<OutcomeType, number> = {
    repair: 75,
    reuse: 75,
    repurpose: 70,
    replace: 70,
    recycle: 60,
  };

  if (data.primaryPriority === 'save_money') {
    userScores.reuse += 20;
    userScores.repair += 15;
    userScores.replace -= 35;
    userScores.repurpose += 10;
  } else if (data.primaryPriority === 'reduce_waste') {
    userScores.reuse += 20;
    userScores.repair += 20;
    userScores.repurpose += 15;
    userScores.recycle += 10;
    userScores.replace -= 30;
  } else if (data.primaryPriority === 'extend_lifespan') {
    userScores.repair += 25;
    userScores.reuse += 15;
    userScores.replace -= 20;
  } else if (data.primaryPriority === 'convenience') {
    userScores.replace += 25;
    userScores.repair += (isMinorOrMint ? 10 : -10);
    userScores.repurpose -= 25; // Repurposing is time-intensive
  }

  if (data.urgency === 'urgent') {
    userScores.replace += 20;
    userScores.reuse += 15;
    userScores.repair -= 10;
    userScores.repurpose -= 30;
  } else if (data.urgency === 'flexible') {
    userScores.repair += 15;
    userScores.repurpose += 15;
  }

  if (data.budgetConstraint === 'minimal') {
    userScores.reuse += 20;
    userScores.repair += 10;
    userScores.replace -= 40;
  } else if (data.budgetConstraint === 'flexible') {
    userScores.replace += 15;
    userScores.repair += 10;
  }

  // 6. SYNTHESIZE MULTI-CRITERIA FIT SCORES (0 - 100)
  const calculateTotalFit = (outcome: OutcomeType): number => {
    // If hazard, Recycle dominates for critical safety
    if (isHazard) {
      if (outcome === 'recycle') return 98;
      if (outcome === 'replace') return 85;
      return 15;
    }

    const safety = safetyScores[outcome];
    const feasibility = feasibilityScores[outcome];
    const circular = circularScores[outcome];
    const userAlign = Math.max(10, Math.min(100, userScores[outcome]));

    let totalScore = 0;
    if (economicScores[outcome] !== null) {
      // When economics are known: Safety 25%, Feasibility 25%, Economics 25%, Circular 15%, User 10%
      totalScore =
        safety * 0.20 +
        feasibility * 0.25 +
        (economicScores[outcome] as number) * 0.25 +
        circular * 0.15 +
        userAlign * 0.15;
    } else {
      // When economics are unknown: Safety 25%, Feasibility 35%, Circular 20%, User 20%
      totalScore =
        safety * 0.20 +
        feasibility * 0.35 +
        circular * 0.20 +
        userAlign * 0.25;
    }

    // Strict boundary clamping
    return Math.max(12, Math.min(98, Math.round(totalScore)));
  };

  const scores: Record<OutcomeType, number> = {
    repair: calculateTotalFit('repair'),
    reuse: calculateTotalFit('reuse'),
    repurpose: calculateTotalFit('repurpose'),
    replace: calculateTotalFit('replace'),
    recycle: calculateTotalFit('recycle'),
  };

  // Sort outcomes descending by fit percentage
  const allOutcomes: OutcomeType[] = ['repair', 'reuse', 'repurpose', 'replace', 'recycle'];
  const rankingOrder = [...allOutcomes].sort((a, b) => scores[b] - scores[a]);
  const recommendedOutcome = rankingOrder[0];

  const getViability = (out: OutcomeType, score: number): OutcomeViability => {
    if (isHazard && (out === 'repair' || out === 'reuse')) return 'hazardous';
    if (out === recommendedOutcome) return 'recommended';
    if (score >= 75) return 'viable';
    if (score >= 50) return 'alternative';
    return 'unfavorable';
  };

  // Generate grounded comparative rationales
  const getComparativeRationale = (out: OutcomeType): string => {
    if (isHazard) {
      if (out === 'recycle') {
        return 'Critical recommendation due to reported hazardous warning (swelling/thermal event). Immediate certified safe disposal is required.';
      }
      return 'Unfavorable due to chemical or thermal hazard risks that make DIY handling unsafe.';
    }

    if (out === recommendedOutcome) {
      if (out === 'repair') {
        return `Ranks #1 because the item has salvageable physical condition (${condition?.replace(/_/g, ' ') || 'assessed'}) and isolated component failure. Repairing retains embodied carbon while minimizing financial outlay.`;
      }
      if (out === 'reuse') {
        return `Ranks #1 because the item remains operational or near-functional. Reusing or donating requires zero manufacturing resources and zero capital expense.`;
      }
      if (out === 'repurpose') {
        return `Ranks #1 because structural or cosmetic damage impairs primary operation, but durable subcomponents provide exceptional upcycling and utility value.`;
      }
      if (out === 'replace') {
        return `Ranks #1 because the combination of advanced age (${data.age || 'legacy'}), severe structural failure, and high repair quotes makes replacement more economical and efficient.`;
      }
      if (out === 'recycle') {
        return `Ranks #1 because the hardware has reached complete end of mechanical life. Closed-loop smelting recovers up to 95% of strategic raw materials.`;
      }
    }

    // For secondary outcomes:
    if (out === 'repair') {
      if (isBrokenSeverely) return 'Ranks lower because severe structural failure makes component repair technically complex and uneconomical.';
      if (repairCostProvided && replacementCostProvided && (data.repairCost as number) / (data.replacementCost as number) > 0.7) {
        return `Ranks lower because repair quote (₹${data.repairCost?.toLocaleString('en-IN')}) exceeds 70% of replacement cost.`;
      }
      return 'Viable alternative, but ranked behind the primary recommendation based on user priority and condition grade.';
    }
    if (out === 'reuse') {
      if (isBrokenNonFunctional || isBrokenSeverely) return 'Ranks lower because the item is non-functional in its current state without intervention.';
      return 'Strong circular alternative if user prefers immediate redistribution over personal repair.';
    }
    if (out === 'repurpose') {
      return 'Viable option if user enjoys hands-on maker upcycling, but ranked secondary to preserving primary functionality.';
    }
    if (out === 'replace') {
      if (isMinorOrMint || isPartiallyFunctional) {
        return 'Ranks lower because discarding functional hardware incurs avoidable carbon and financial expenditure.';
      }
      return 'Alternative pathway if immediate modern reliability or warranty protection is preferred over repair.';
    }
    if (out === 'recycle') {
      return 'Last resort in circular hierarchy; reserved for when all repair and upcycling options are exhausted.';
    }

    return 'Evaluated against multi-criteria decision framework.';
  };

  // Primary verdict synthesis
  const primaryVerdictRationale = isHazard
    ? 'CRITICAL SAFETY ALERT: Evidence of thermal swelling or hazardous failure detected. Certified safe recycling/disposal is strongly advised over personal handling.'
    : `Algorithm recommends ${recommendedOutcome.toUpperCase()} (${scores[recommendedOutcome]}% match) based on verified ${category} diagnostic rules, item condition (${condition?.replace(/_/g, ' ') || 'assessed'}), and stated ${data.primaryPriority?.replace(/_/g, ' ') || 'circular'} priority.`;

  // Build sector records
  const outcomes: Record<OutcomeType, CircularOutcomeSector> = {
    repair: {
      outcomeType: 'repair',
      angleDegrees: OUTCOME_ANGLES.repair,
      ...OUTCOME_METADATA.repair,
      viability: getViability('repair', scores.repair),
      fitPercentage: scores.repair,
      summary: `Restore operational integrity via modular component swap or skilled bench service.`,
      keyDrivers: [
        isBrokenSeverely ? 'High structural challenge' : 'Preserves core functional assembly',
        repairCostProvided && replacementCostProvided
          ? `Cost ratio: ${Math.round(((data.repairCost as number) / (data.replacementCost as number)) * 100)}% of new replacement`
          : 'Lowers manufacturing footprint vs replacement',
        'Avoids embodied carbon emissions',
      ],
      comparativeRationale: getComparativeRationale('repair'),
      scoreBreakdown: {
        safety: safetyScores.repair,
        feasibility: feasibilityScores.repair,
        economicViability: economicScores.repair,
        circularImpact: circularScores.repair,
        userAlignment: Math.max(10, Math.min(100, userScores.repair)),
      },
      dataLimitations: repairCostProvided ? [] : ['Repair quote unknown; estimated on standard component heuristics.'],
      subBranches: subBranches.repair,
    },
    reuse: {
      outcomeType: 'reuse',
      angleDegrees: OUTCOME_ANGLES.reuse,
      ...OUTCOME_METADATA.reuse,
      viability: getViability('reuse', scores.reuse),
      fitPercentage: scores.reuse,
      summary: `Maintain active service through domestic secondary deployment or peer donation.`,
      keyDrivers: [
        'Zero manufacturing resource consumption',
        '100% utility retention in active economy',
        'Zero out-of-pocket capital expenditure',
      ],
      comparativeRationale: getComparativeRationale('reuse'),
      scoreBreakdown: {
        safety: safetyScores.reuse,
        feasibility: feasibilityScores.reuse,
        economicViability: economicScores.reuse,
        circularImpact: circularScores.reuse,
        userAlignment: Math.max(10, Math.min(100, userScores.reuse)),
      },
      dataLimitations: [],
      subBranches: subBranches.reuse,
    },
    repurpose: {
      outcomeType: 'repurpose',
      angleDegrees: OUTCOME_ANGLES.repurpose,
      ...OUTCOME_METADATA.repurpose,
      viability: getViability('repurpose', scores.repurpose),
      fitPercentage: scores.repurpose,
      summary: `Transform chassis, lumber, or electro-mechanical parts into an alternative functional asset.`,
      keyDrivers: [
        'Creative upcycling and material harvesting',
        'Extracts utility from non-repairable assemblies',
        'Reduces demand for single-purpose hardware',
      ],
      comparativeRationale: getComparativeRationale('repurpose'),
      scoreBreakdown: {
        safety: safetyScores.repurpose,
        feasibility: feasibilityScores.repurpose,
        economicViability: economicScores.repurpose,
        circularImpact: circularScores.repurpose,
        userAlignment: Math.max(10, Math.min(100, userScores.repurpose)),
      },
      dataLimitations: [],
      subBranches: subBranches.repurpose,
    },
    replace: {
      outcomeType: 'replace',
      angleDegrees: OUTCOME_ANGLES.replace,
      ...OUTCOME_METADATA.replace,
      viability: getViability('replace', scores.replace),
      fitPercentage: scores.replace,
      summary: `Upgrade to high-efficiency 5-star inverter unit or certified refurbished hardware with warranty.`,
      keyDrivers: [
        data.age === 'over_10_years' ? 'Drastically improves operating efficiency' : 'Provides fresh warranty protection',
        'Eliminates chronic breakdown frustrations',
        'Guarantees modern safety and regulatory compliance',
      ],
      comparativeRationale: getComparativeRationale('replace'),
      scoreBreakdown: {
        safety: safetyScores.replace,
        feasibility: feasibilityScores.replace,
        economicViability: economicScores.replace,
        circularImpact: circularScores.replace,
        userAlignment: Math.max(10, Math.min(100, userScores.replace)),
      },
      dataLimitations: replacementCostProvided ? [] : ['Replacement cost unknown; comparison based on general category prices.'],
      subBranches: subBranches.replace,
    },
    recycle: {
      outcomeType: 'recycle',
      angleDegrees: OUTCOME_ANGLES.recycle,
      ...OUTCOME_METADATA.recycle,
      viability: getViability('recycle', scores.recycle),
      fitPercentage: scores.recycle,
      summary: `Safely recover hazardous cells and channel clean metals into closed-loop smelting.`,
      keyDrivers: [
        isHazard ? 'Prevents fires and toxic chemical leaks' : 'Recovers strategic scrap metals (95% circular)',
        'Diverts hazardous materials from landfills',
        'Certified closed-loop reclamation chain',
      ],
      comparativeRationale: getComparativeRationale('recycle'),
      scoreBreakdown: {
        safety: safetyScores.recycle,
        feasibility: feasibilityScores.recycle,
        economicViability: economicScores.recycle,
        circularImpact: circularScores.recycle,
        userAlignment: Math.max(10, Math.min(100, userScores.recycle)),
      },
      dataLimitations: [],
      subBranches: subBranches.recycle,
    },
  };

  return {
    product: {
      name: data.itemName || 'Assessed Item',
      category,
      condition,
      brandModel: data.brandModel,
      reportedFault: data.reportedFault || 'General maintenance evaluation',
      repairCost: data.repairCost,
      replacementCost: data.replacementCost,
      budget: data.budgetConstraint,
      priority: data.primaryPriority,
      urgency: data.urgency,
    },
    recommendedOutcome,
    rankingOrder,
    primaryVerdictRationale,
    overallDataLimitations,
    outcomes,
    activeBranchId: subBranches[recommendedOutcome][0]?.id || null,
    inspectedNodeId: `outcome_${recommendedOutcome}`,
  };
}
