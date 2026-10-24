import type {
  CategoryOption,
  ConditionOption,
  AdaptiveQuestion,
  ItemAgeId,
  BudgetConstraint,
  UrgencyLevel,
  PrimaryPriority,
} from './types';

export const CATEGORIES: CategoryOption[] = [
  {
    id: 'electronics',
    label: 'Consumer Electronics',
    iconName: 'Tv',
    description: 'Phones, laptops, audio equipment, tablets, monitors, and gaming hardware.',
    examples: 'MacBook Air, iPhone 12, Sony WH-1000XM4, Dell Monitor',
  },
  {
    id: 'appliances',
    label: 'Small & Large Appliances',
    iconName: 'Coffee',
    description: 'Kitchen appliances, coffee makers, vacuums, microwaves, blenders.',
    examples: 'Breville Barista, Dyson V11, KitchenAid Stand Mixer, DeLonghi Heater',
  },
  {
    id: 'clothing',
    label: 'Clothing & Footwear',
    iconName: 'Shirt',
    description: 'Jackets, coats, denim, leather goods, knitwear, workwear, shoes, boots.',
    examples: 'Barbour Waxed Jacket, Selvedge Denim, Red Wing Boots, Cashmere Sweater',
  },
  {
    id: 'furniture',
    label: 'Furniture & Homeware',
    iconName: 'Armchair',
    description: 'Chairs, desks, tables, storage shelving, lamps, frames, wooden fittings.',
    examples: 'Solid Oak Desk, Herman Miller Aeron, Mid-Century Credenza, Floor Lamp',
  },
  {
    id: 'tools',
    label: 'Tools & Hardware',
    iconName: 'Wrench',
    description: 'Power tools, lawnmowers, hand tools, workshop machinery, garden gear.',
    examples: 'DeWalt Cordless Drill, Bosch Lawnmower, Bench Grinder, Pressure Washer',
  },
  {
    id: 'other',
    label: 'Other / Miscellaneous',
    iconName: 'Package',
    description: 'Bicycles, musical instruments, luggage, toys, sports gear, specialty goods.',
    examples: 'Trek Road Bike, Fender Guitar, Rimowa Suitcase, Camping Tent',
  },
];

export const ITEM_AGES: { id: ItemAgeId; label: string; hint: string }[] = [
  { id: 'under_1_year', label: '< 1 Year', hint: 'Likely still under manufacturer warranty' },
  { id: '1_to_3_years', label: '1 – 3 Years', hint: 'Modern generation, parts usually widely available' },
  { id: '3_to_5_years', label: '3 – 5 Years', hint: 'Mature hardware, reasonable balance of parts and DIY guides' },
  { id: '5_to_10_years', label: '5 – 10 Years', hint: 'Legacy generation, replacement parts may require donor units' },
  { id: 'over_10_years', label: '10+ Years', hint: 'Vintage or classic, repair often requires specialized care' },
  { id: 'unknown', label: 'Age Unknown', hint: 'Second-hand or inherited without exact purchase date' },
];

export const CONDITIONS: ConditionOption[] = [
  {
    id: 'mint_minor_issue',
    label: 'Cosmetic Wear / Minor Glitch',
    badge: 'GRADE A / COSMETIC',
    badgeColor: '#10B25A',
    description: 'Item functions normally overall. Minor cosmetic scratch, loose handle, or intermittent minor glitch.',
  },
  {
    id: 'partially_functional',
    label: 'Partially Impaired',
    badge: 'GRADE B / IMPAIRED',
    badgeColor: '#FFE600',
    description: 'Key functions work, but specific features have failed (e.g., dead battery, broken zipper, one speaker quiet).',
  },
  {
    id: 'broken_non_functional',
    label: 'Non-Functional / Dead',
    badge: 'GRADE C / INOPERABLE',
    badgeColor: '#FF9500',
    description: 'Does not perform its primary function. Does not power on, motor jammed, severed cord, or shattered mechanism.',
  },
  {
    id: 'severe_structural_failure',
    label: 'Severe Damage / Burnout',
    badge: 'GRADE D / CRITICAL',
    badgeColor: '#FF3344',
    description: 'Major structural break, liquid damage, blown mainboard, burnt coils, or catastrophic physical trauma.',
  },
];

export const BUDGET_OPTIONS: { id: BudgetConstraint; label: string; description: string }[] = [
  { id: 'minimal', label: 'Low Cost (< ₹1,000)', description: 'Seeking DIY solutions or low-cost fix' },
  { id: 'moderate', label: 'Moderate (₹1,000 – ₹5,000)', description: 'Willing to buy parts or pay local technician' },
  { id: 'flexible', label: 'Substantial (₹5,000+)', description: 'Prepared to invest significantly if lifespan is extended' },
  { id: 'none', label: 'Cost is Secondary', description: 'Priority is quality, sentimentality, or circularity over money' },
];

export const URGENCY_OPTIONS: { id: UrgencyLevel; label: string; description: string }[] = [
  { id: 'urgent', label: 'Need It Back Soon (1–3 Days)', description: 'Critical daily-use item (phone, work laptop, key garment)' },
  { id: 'moderate', label: 'Within a Couple Weeks', description: 'Can wait for shipped parts or weekend DIY time' },
  { id: 'flexible', label: 'No Rush / Spare Item', description: 'Can sit in workshop until the right circular opportunity arises' },
];

export const PRIORITY_OPTIONS: { id: PrimaryPriority; label: string; badge: string; description: string }[] = [
  {
    id: 'save_money',
    label: 'Save Money',
    badge: 'ECONOMICS',
    description: 'Minimize out-of-pocket expenses compared to purchasing a new replacement.',
  },
  {
    id: 'extend_lifespan',
    label: 'Extend Item Lifespan',
    badge: 'DURABILITY',
    description: 'Keep this specific item in service as long as physically and safely possible.',
  },
  {
    id: 'reduce_waste',
    label: 'Reduce Landfill Waste',
    badge: 'CIRCULARITY',
    description: 'Prevent e-waste and material dumping by prioritizing repair, reuse, or closed-loop recycling.',
  },
  {
    id: 'convenience',
    label: 'Time & Convenience',
    badge: 'EFFORT',
    description: 'Prefer the fastest, lowest-hassle path to having a working solution.',
  },
];

// Adaptive Branching Questions
export const ADAPTIVE_QUESTIONS: AdaptiveQuestion[] = [
  // 1. Electronics & Appliances Branches
  {
    id: 'elec_power_state',
    categoryId: 'electronics',
    title: 'Power & Vital Signs',
    subtitle: 'Does the device show any signs of electrical life?',
    explanation: 'Distinguishing between a dead power delivery circuit and a working mainboard helps establish whether modular parts replacement is feasible.',
    options: [
      { value: 'powers_on_normal', label: 'Powers on normally', hint: 'Screen/lights work, but an internal or peripheral feature has failed' },
      { value: 'intermittent_power', label: 'Intermittent power / shuts off suddenly', hint: 'Often battery degradation, loose connection, or thermal throttling' },
      { value: 'completely_dead', label: 'Completely dead (no lights, sounds, or draw)', hint: 'Indicates blown fuse, damaged port, dead power supply, or mainboard failure' },
      { value: 'unknown', label: 'Unsure / Cannot safely test', hint: 'Safety precaution if swollen battery or damaged plug is suspected' },
    ],
  },
  {
    id: 'elec_modular_fault',
    categoryId: 'electronics',
    title: 'Component Fault Location',
    subtitle: 'Which component is primarily responsible for the issue?',
    explanation: 'Modular components like batteries, keyboards, and screens can often be replaced easily, whereas soldered chipsets require micro-soldering.',
    options: [
      { value: 'battery_charging', label: 'Battery, charging port, or cable', hint: 'High repair success rate with off-the-shelf replacement parts' },
      { value: 'screen_display', label: 'Screen, digitizer, or display back-light', hint: 'Standard screen replacement or connector reseating' },
      { value: 'audio_buttons_mechanical', label: 'Buttons, jacks, dials, or casing', hint: 'Simple mechanical cleaning, soldering, or switch swap' },
      { value: 'motherboard_internal_chip', label: 'Main logic board, processor, or liquid damage', hint: 'Complex board-level diagnosis or complete board swap needed' },
      { value: 'unknown_hardware', label: 'Internal electronics are unclear', hint: 'Requires diagnostic multimeter testing' },
    ],
  },
  {
    id: 'elec_inspection_history',
    categoryId: 'electronics',
    title: 'Diagnostic & Inspection History',
    subtitle: 'Has the item been diagnosed or opened before?',
    explanation: 'Knowing whether a professional technician has already assessed the item prevents repeating impossible fixes.',
    options: [
      { value: 'never_inspected', label: 'Never opened or professionally inspected', hint: 'Factory seals intact; full diagnostic potential' },
      { value: 'diy_attempted', label: 'I attempted opening or troubleshooting myself', hint: 'Basic cleaning or inspection completed' },
      { value: 'repair_shop_quote', label: 'A repair shop diagnosed it or quoted repair', hint: 'Specific faulty component already identified' },
      { value: 'declared_unfixable', label: 'A shop claimed it is unrepairable or proprietary', hint: 'Strong candidate for component harvesting or certified recycling' },
    ],
  },

  // 2. Appliances Branches
  {
    id: 'appliance_mechanism',
    categoryId: 'appliances',
    title: 'Mechanical Drive & Heating State',
    subtitle: 'What primary system has degraded?',
    explanation: 'Household appliances usually fail either in their heating element, electric motor, or electronic timer board.',
    options: [
      { value: 'pump_motor_jam', label: 'Motor, pump, or impeller is jammed/noisy', hint: 'Common bearing wear, scale buildup, or foreign object blockage' },
      { value: 'heating_element', label: 'Does not heat up or maintain temperature', hint: 'Thermostat, thermal fuse, or heating element replacement' },
      { value: 'leaks_seals', label: 'Water, liquid, or pressure leak', hint: 'Gasket, o-ring, or silicone tube replacement' },
      { value: 'electronics_controls', label: 'Control board or digital panel unresponsive', hint: 'Capacitor failure or power board replacement' },
    ],
  },
  {
    id: 'appliance_maintenance',
    categoryId: 'appliances',
    title: 'Descaling & Deep Maintenance',
    subtitle: 'Has regular descaling or filter replacement been maintained?',
    explanation: 'Over 60% of small kitchen appliance failures stem from mineral scale rather than irreversible hardware death.',
    options: [
      { value: 'regularly_maintained', label: 'Yes, maintained on schedule', hint: 'Failure is genuine hardware fatigue' },
      { value: 'seldom_maintained', label: 'Rarely descaled or cleaned internally', hint: 'A deep chemical flush may immediately restore operation' },
      { value: 'not_applicable', label: 'Not applicable to this appliance', hint: 'Dry appliances without liquid circuits' },
    ],
  },

  // 3. Clothing & Footwear Branches
  {
    id: 'apparel_damage_type',
    categoryId: 'clothing',
    title: 'Fabric & Seam Failure Type',
    subtitle: 'What is the nature of the damage?',
    explanation: 'Stitching and zipper issues are easily mendable, while dry-rot and widespread chemical staining suggest repurposing or textile recycling.',
    options: [
      { value: 'seam_zipper_hardware', label: 'Split seam, broken zipper, or missing button', hint: 'Standard needle & thread or tailor repair (₹150 – ₹800)' },
      { value: 'tear_hole', label: 'Torn fabric, blowout, or worn-through patch', hint: 'Visible mending (Sashiko), darning, or patch reinforcement' },
      { value: 'stain_discoloration', label: 'Stubborn stain, dye transfer, or fading', hint: 'Overdyeing, fabric paint, or color-reviving treatment' },
      { value: 'fabric_rot_moth', label: 'Moth damage, dry rot, or elastic disintegration', hint: 'Irreversible structural fabric loss; ideal for repurposing into rags/crafts' },
    ],
  },
  {
    id: 'apparel_wearability',
    categoryId: 'clothing',
    title: 'Current Wearability',
    subtitle: 'Can it still be worn in public or around the house?',
    explanation: 'Garments that are still wearable can often be reused or donated immediately, while unwearable items require repair or transformation.',
    options: [
      { value: 'fully_wearable', label: 'Fully wearable right now (just aesthetic flaw)', hint: 'Candidate for donation, styling, or minor cosmetic touch-up' },
      { value: 'partially_wearable', label: 'Wearable around the house or as workwear', hint: 'Can be downgraded to utility/gardening clothing' },
      { value: 'unwearable_as_is', label: 'Unwearable without repair', hint: 'Requires intervention before it can re-enter service' },
    ],
  },
  {
    id: 'apparel_material_tier',
    categoryId: 'clothing',
    title: 'Material Quality & Longevity',
    subtitle: 'What is the primary material composition?',
    explanation: 'Natural durable fibers (wool, heavy cotton, full-grain leather) justify investing in repairs, whereas ultra-thin fast-fashion synthetics rarely hold stitches.',
    options: [
      { value: 'natural_heritage', label: 'High quality (leather, heavy wool, selvedge, silk)', hint: 'Designed to outlive owner if properly cared for' },
      { value: 'mid_tier_cotton', label: 'Standard everyday blend (cotton, denim, linen)', hint: 'Moderate longevity; very easy to sew and patch' },
      { value: 'fast_fashion_synthetic', label: 'Fast-fashion synthetic (polyester, acrylic, nylon)', hint: 'Low material durability; minimal resale or repair ROI' },
      { value: 'sentimental_value', label: 'High sentimental value (family heirloom, memorable)', hint: 'Worth preserving regardless of material cost' },
    ],
  },

  // 4. Furniture & Homeware Branches
  {
    id: 'furniture_structural_safety',
    categoryId: 'furniture',
    title: 'Structural Frame Stability',
    subtitle: 'Is the core load-bearing structure intact?',
    explanation: 'A broken leg on a chair poses a safety hazard, whereas a wobbly screw can be tightened in seconds.',
    options: [
      { value: 'rock_solid', label: 'Solid frame, purely cosmetic surface damage', hint: 'Sanding, staining, reupholstery, or buffing' },
      { value: 'wobbly_fixable', label: 'Wobbly joints or loose dowels/brackets', hint: 'Wood glue, pocket screws, or corner braces (₹300 – ₹600 fix)' },
      { value: 'cracked_structural', label: 'Snapped leg, fractured crossbeam, or cracked frame', hint: 'Requires joinery clamp, dowel reinforcement, or metal bracket' },
      { value: 'particle_board_crumble', label: 'Crumbling MDF / particle board moisture damage', hint: 'Blown particle board cannot be reglued; candidate for repurposing' },
    ],
  },
  {
    id: 'furniture_diy_access',
    categoryId: 'furniture',
    title: 'Tools & Space Availability',
    subtitle: 'Do you have access to a workspace and basic tools?',
    explanation: 'Furniture repair practicality depends heavily on whether the user has clamps, sandpaper, and a ventilated area.',
    options: [
      { value: 'full_tools_workshop', label: 'Yes, have workspace and power/hand tools', hint: 'High DIY feasibility for full restoration' },
      { value: 'basic_apartment_tools', label: 'Basic household tools (screwdriver, hammer, glue)', hint: 'Feasible for non-structural tightening and glue-ups' },
      { value: 'no_tools_prefer_pro', label: 'No tools or DIY space (prefer professional or zero-tool path)', hint: 'Favors local upholstery shop or repurposing' },
    ],
  },

  // 5. Tools & Hardware Branches
  {
    id: 'tools_drive_status',
    categoryId: 'tools',
    title: 'Motor, Gearbox & Mechanical Drive',
    subtitle: 'Does the mechanical drive still operate?',
    explanation: 'Worn carbon brushes in power tools are cheap ₹200 – ₹400 drop-in fixes, whereas burnt copper armatures indicate end-of-life.',
    options: [
      { value: 'motor_runs_sparks', label: 'Motor runs with excessive sparks or smell', hint: 'Classic worn carbon brush symptom; 15-minute ₹250 repair' },
      { value: 'motor_runs_gear_strips', label: 'Motor spins, but bit/blade does not turn', hint: 'Stripped planetary gearbox or broken belt' },
      { value: 'battery_trigger_issue', label: 'Dead trigger switch or faulty battery contact', hint: 'Switch replacement or terminal cleaning' },
      { value: 'burnt_motor_smoke', label: 'Smoked, overheated, completely seized', hint: 'Melted armature coils; usually cheaper to replace tool' },
    ],
  },
  {
    id: 'tools_parts_ecosystem',
    categoryId: 'tools',
    title: 'Brand Parts Availability',
    subtitle: 'Is this from an established brand with available schematic diagrams?',
    explanation: 'Established brands publish exploded parts diagrams and sell individual components online.',
    options: [
      { value: 'major_brand_diagrams', label: 'Major brand with diagrams available (DeWalt, Bosch, Makita, etc.)', hint: 'Parts readily available online via OEM or eBay' },
      { value: 'generic_no_brand', label: 'Generic / store-brand / no exploded diagrams', hint: 'Requires generic donor parts or standard metric fasteners' },
      { value: 'unknown', label: 'Unsure of parts availability', hint: 'Will check model number in decision engine' },
    ],
  },

  // 6. Universal / General Follow-Up
  {
    id: 'general_secondary_use',
    categoryId: 'other',
    title: 'Secondary Utility & Donor Parts',
    subtitle: 'Could parts of this item serve another practical function?',
    explanation: 'Even when primary function is lost, materials, motors, housings, or fabrics can often be repurposed creatively.',
    options: [
      { value: 'high_donor_value', label: 'Yes, contains valuable parts or durable raw materials', hint: 'Strong repurpose candidate (e.g. storage, planter, wiring, fabric)' },
      { value: 'single_purpose_unit', label: 'No, highly integrated single-purpose item', hint: 'Better suited for direct repair or certified material recycling' },
      { value: 'open_to_ideas', label: 'Open to creative repurposing ideas', hint: 'Engine will suggest unconventional second-life projects' },
    ],
  },
];
