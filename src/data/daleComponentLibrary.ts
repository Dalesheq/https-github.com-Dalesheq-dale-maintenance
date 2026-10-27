import { StatusType } from '../types';

export interface PrepopulatedComponent {
  id: string;
  name: string;
  category: string; // e.g. 'Spiral Systems', 'Baking Ovens', 'Provers', 'Material Handling', 'Refrigeration', 'Electrical & Safety'
  defaultSection: string;
  defaultStatusType: StatusType;
  defaultNotes?: string;
  suggestedIssues: string[];
}

export const DALE_COMPONENT_CATEGORIES = [
  'Spiral Systems',
  'Baking Ovens',
  'Provers & Conditioning',
  'Material Handling & Slat Conveyors',
  'Refrigeration & Piping',
  'Electrical, HMI & Safety Circuits',
] as const;

export const PREPOPULATED_DALE_COMPONENTS: PrepopulatedComponent[] = [
  // --- Spiral Systems ---
  {
    id: 'comp-spiral-belt',
    name: 'Modular Plastic / Stainless Steel Belt Condition',
    category: 'Spiral Systems',
    defaultSection: 'Belt & Drive Assembly',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Ashworth / Intralox belt inspected across all tiers.',
    suggestedIssues: ['Few broken links found', 'Edge drive links distorted', 'Belt rods worn or migrating', 'Belt tension excessive'],
  },
  {
    id: 'comp-spiral-clips',
    name: 'Belt Clips and Retaining Pins',
    category: 'Spiral Systems',
    defaultSection: 'Belt & Drive Assembly',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'All retaining clips seated securely.',
    suggestedIssues: ['Not all clips in place', 'Clips cracked from thermal fatigue', 'Pins backing out on outside edge'],
  },
  {
    id: 'comp-spiral-oiler',
    name: 'Belt Automatic Oiler & Festo Air Piping',
    category: 'Spiral Systems',
    defaultSection: 'Belt Oiler & Lubrication',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Oiler reservoir full with food-grade lubricant, pulsing nominal.',
    suggestedIssues: ['Oiler blocks clogged with flour/debris', 'Festo line cracked or leaking', 'Oil level below minimum sight gauge', 'Oiler pump piston not actuating'],
  },
  {
    id: 'comp-spiral-wearstrip',
    name: 'Drum Bar & Rail HDPE Wear Strips',
    category: 'Spiral Systems',
    defaultSection: 'Spiral Cage & Rail Guide',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Wear strip thickness within Dale Automation 3mm tolerance limit.',
    suggestedIssues: ['Wear strip worn thin (<1.5mm remaining)', 'Wear strip warped or detached', 'Missing wear strip section on bottom tier', 'Excessive friction causing belt hop'],
  },
  {
    id: 'comp-spiral-drum-bearing',
    name: 'Center Shaft Main Drum Bearing (SF216)',
    category: 'Spiral Systems',
    defaultSection: 'Drum & Center Tower',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Center bearing well greased with food-safe XP FG2 grease.',
    suggestedIssues: ['Bearing dry, requires grease', 'Excessive grease leakage onto shaft', 'Radial play detected on drum shaft', 'Flange bolts loose'],
  },
  {
    id: 'comp-spiral-drum-bolts',
    name: 'Internal Drum Spokes & Structural Fasteners',
    category: 'Spiral Systems',
    defaultSection: 'Drum & Center Tower',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'All internal drum fasteners torque-checked and rust-free.',
    suggestedIssues: ['Severe surface corrosion on drum bolts', 'Loose fasteners on intermediate spokes', 'Cracked weld at drive ring spoke juncture'],
  },
  {
    id: 'comp-spiral-tier-lifts',
    name: 'Tier Lift Limit Switches & Flip-Flops',
    category: 'Spiral Systems',
    defaultSection: 'Safety & Sensors',
    defaultStatusType: 'pass_fail',
    defaultNotes: 'Flip-flop actuators trip emergency stop relay within 50ms.',
    suggestedIssues: ['Switch failed trip test', 'Physical arm bent or misaligned', 'Wiring damaged by ice/frost', 'Sensor bracket loose'],
  },
  {
    id: 'comp-spiral-takeup',
    name: 'Weighted Take-Up Roller & Idler Shafts (FL206)',
    category: 'Spiral Systems',
    defaultSection: 'Take-Up Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Take-up weight box free-floating with balanced counterweights.',
    suggestedIssues: ['Top hats on weighted roller missing', 'Idler bearing dry and noisy', 'Take-up guide rails binding', 'Output shaft seal leaking oil'],
  },

  // --- Baking Ovens ---
  {
    id: 'comp-oven-flametubes',
    name: 'Flame Tubes Refractory & Shell Integrity',
    category: 'Baking Ovens',
    defaultSection: 'Combustion & Bake Chamber',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Inspected refractory lining and 2.4m tubes for thermal fatigue.',
    suggestedIssues: ['Refractory breaking apart from flame tubes', 'Burner tube wall thinning from thermal erosion', 'Refractory cracked at throat ring', 'Flame impingement hot-spots observed'],
  },
  {
    id: 'comp-oven-burners',
    name: 'Gas / Diesel Burner Train & Ignition Spark',
    category: 'Baking Ovens',
    defaultSection: 'Combustion & Bake Chamber',
    defaultStatusType: 'pass_fail',
    defaultNotes: 'Burners 1 through 4 light off cleanly with stable flame signal.',
    suggestedIssues: ['Burner flame safeguard sensor faulty', 'Ignition electrode carbon fouled', 'Gas modulating valve sluggish', 'Combustion blower air pressure low'],
  },
  {
    id: 'comp-oven-chain',
    name: 'Main Oven Slat Conveyor Chain & Sprockets',
    category: 'Baking Ovens',
    defaultSection: 'Oven Drive & Slats',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Chain pitch measured over 10 links; within Dale stretch tolerance.',
    suggestedIssues: ['Oven chain stretched beyond 2.5% limit', 'Damaged or warped oven slats', 'Sprocket teeth hooked or excessively worn', 'Auto-greaser not dispensing Habotec FG46'],
  },
  {
    id: 'comp-oven-dampers',
    name: 'Belimo Exhaust Damper & Modulating Cams',
    category: 'Baking Ovens',
    defaultSection: 'Air Circulation & Exhaust',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Belimo actuator travels 0-100% smoothly with digital position feedback.',
    suggestedIssues: ['Belimo shaft binding from heat scale', 'Damper blade warped or failing to seal', 'Exhaust limit switch failure', 'Exhaust fan belt slipping'],
  },
  {
    id: 'comp-oven-doors',
    name: 'Inspection Access Doors & High-Temp Gaskets',
    category: 'Baking Ovens',
    defaultSection: 'Enclosure & Insulation',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'High-temp silicone seals intact; locks clamp tight without heat leakage.',
    suggestedIssues: ['Missing door latch hardware', 'Door gasket frayed/deteriorated', 'Heat escaping around door perimeter', 'Door handle sheared'],
  },

  // --- Provers & Conditioning ---
  {
    id: 'comp-prover-steam-train',
    name: 'Spirax Sarco DP27 Steam PRV & Strainer',
    category: 'Provers & Conditioning',
    defaultSection: 'Steam Train & Conditioning',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Steam pressure regulated at steady design setpoint.',
    suggestedIssues: ['PRV internal diaphragm leaking', 'Steam strainer clogged with scale', 'Condensate trap flooded', 'Steam lance nozzle orifices scaled up'],
  },
  {
    id: 'comp-prover-modulating-valve',
    name: 'Proportional Steam Modulating Valve & Sensor',
    category: 'Provers & Conditioning',
    defaultSection: 'Steam Train & Conditioning',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Modulating valve follows 4-20mA humidity control loop cleanly.',
    suggestedIssues: ['Valve stuck at 100% open', 'Actuator unresponsive to PLC PID signal', 'Gland packing steam leak', 'Wet-bulb humidity probe drifting'],
  },
  {
    id: 'comp-prover-loader-pusher',
    name: 'Loader Pusher Arm & Position Proxies',
    category: 'Provers & Conditioning',
    defaultSection: 'Loader & Infeed Mechanism',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Rear home, ultimate front, and mid position proximity sensors aligned.',
    suggestedIssues: ['Pusher arm mechanical end stop loose', 'Rear home proxy loose or flickering', 'Pneumatic cylinder leaking air at rod seal', 'Finger tilt proxy failing to reset'],
  },
  {
    id: 'comp-prover-cross-conveyor',
    name: 'Slat Cross Conveyor & Batching Sensors',
    category: 'Provers & Conditioning',
    defaultSection: 'Loader & Infeed Mechanism',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Batch made and extended batch photo-eyes tested with production pans.',
    suggestedIssues: ['Batch photo-eye lens dusted with flour', 'Slat belt wearstrip grooved', 'Cross conveyor chain drive slack', 'Missing pan guide stop tabs'],
  },
  {
    id: 'comp-prover-fortress',
    name: 'Fortress Key Interlock System & Safeties',
    category: 'Provers & Conditioning',
    defaultSection: 'Safety & Lockout Protocol',
    defaultStatusType: 'pass_fail',
    defaultNotes: 'Full machine run inhibit verified when key is trapped in access door.',
    suggestedIssues: ['Fortress key tumbler jammed', 'Safety switch auxiliary contact faulty', 'Door interlock bypassed with dummy key', 'E-stop reset latch sticky'],
  },

  // --- Material Handling & Slat Conveyors ---
  {
    id: 'comp-depanner-vacuum',
    name: 'De-Panner Suction Cups & Vacuum Manifold',
    category: 'Material Handling & Slat Conveyors',
    defaultSection: 'De-Panner Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Silicone suction cups pliable, vacuum header holding nominal bar.',
    suggestedIssues: ['Suction cups torn or missing', 'Vacuum filter element blocked', 'Blow-off solenoid failing to release product', 'Height adjusting spindle stripped'],
  },
  {
    id: 'comp-slat-infeed',
    name: 'Slat Infeed Conveyor & Drive Sprockets',
    category: 'Material Handling & Slat Conveyors',
    defaultSection: 'Infeed Transfer Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Stainless steel slats flat and interlocking smoothly.',
    suggestedIssues: ['Bent stainless steel slats causing pan jams', 'Drive sprocket loose on keyway', 'Pan guides missing wearstrip liner', 'Infeed photo-sensor misaligned'],
  },
  {
    id: 'comp-sew-gearmotor',
    name: 'SEW Eurodrive Main Drive Gearmotor & Oil Level',
    category: 'Material Handling & Slat Conveyors',
    defaultSection: 'Drive Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'SEW gearmotor quiet under full load; oil level verified in sight glass.',
    suggestedIssues: ['Oil leak from output shaft seal', 'High-pitched gearbox bearing noise', 'Motor drawing excessive amps', 'Torque arm rubber damper degraded'],
  },

  // --- Refrigeration & Piping ---
  {
    id: 'comp-refrig-coils',
    name: 'Cooler / Freezer Evaporator Coils & Fin Spacing',
    category: 'Refrigeration & Piping',
    defaultSection: 'Evaporator Coils',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Coil fins free of frost accumulation and corrosion.',
    suggestedIssues: ['Coil fins bent or flattened', 'Severe corrosion or chemical pitting', 'Defrost heater element open-circuit', 'Uneven ice build-up across bottom passes'],
  },
  {
    id: 'comp-refrig-pumps',
    name: 'Lowara / Grundfos Chilled Water Circulation Pumps',
    category: 'Refrigeration & Piping',
    defaultSection: 'Pump Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Pump 1 & 2 mechanical seals dry; pressure and flow nominal.',
    suggestedIssues: ['Mechanical seal weeping coolant', 'Differential pressure switch trip', 'Pump impeller cavitation noise', 'Isolator switch auxiliary contact failure'],
  },
  {
    id: 'comp-refrig-valves',
    name: 'Ammonia / Glycol Valve Station & Strainers',
    category: 'Refrigeration & Piping',
    defaultSection: 'Refrigeration Valve Station',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Valves insulated with vapor barrier; no signs of icing or weeping.',
    suggestedIssues: ['Solenoid valve failing to close completely', 'Strainer clogged with pipeline debris', 'Insulation cladding damaged or waterlogged', 'Pressure relief valve overdue inspection'],
  },

  // --- Electrical, HMI & Safety Circuits ---
  {
    id: 'comp-elec-panel',
    name: 'Main Electrical Panel Neatness & Ducting',
    category: 'Electrical, HMI & Safety Circuits',
    defaultSection: 'Control Panel',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Panel clean, wire tags legible, drawings and schematics in pocket.',
    suggestedIssues: ['Flour dust accumulation inside cabinet', 'Door seals degraded letting in moisture', 'Panel cooling air conditioner filter choked', 'Loose terminal connections on 24V bus'],
  },
  {
    id: 'comp-elec-hmi',
    name: 'Omron / Siemens Touchscreen HMI & Passwords',
    category: 'Electrical, HMI & Safety Circuits',
    defaultSection: 'Control Panel',
    defaultStatusType: 'good_repair_replace',
    defaultNotes: 'Touchscreen responsive; all alarm banners cleared and operational.',
    suggestedIssues: ['Touchscreen overlay delaminating', 'Backlight dim or flickering', 'Default passwords bypassed', 'Communication timeout to safety CPU'],
  },
  {
    id: 'comp-safety-estop',
    name: 'Emergency Stop Pushbuttons & Pull Cords',
    category: 'Electrical, HMI & Safety Circuits',
    defaultSection: 'Safety Systems',
    defaultStatusType: 'pass_fail',
    defaultNotes: 'All perimeter E-stops and tensioned pull cords tested.',
    suggestedIssues: ['Pull cord tension loose, fails to trip switch', 'E-stop contact block unseated', 'Missing E-stop legend label', 'Reset push-button indicator lamp blown'],
  },
];
