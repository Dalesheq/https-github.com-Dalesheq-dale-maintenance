import { ChecklistSection, ReportType } from '../types';

export interface ReportTemplate {
  type: ReportType;
  title: string;
  defaultCategory: string;
  description: string;
  defaultModelYear: string;
  sections: ChecklistSection[];
}

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate> = {
  spiral_cooler_double_drum: {
    type: 'spiral_cooler_double_drum',
    title: 'Friction drive spiral (Cooler - Double drum)',
    defaultCategory: '8000 LPH Double Drum Spiral Cooler',
    description: 'Comprehensive inspection and commissioning checklist for Dale Automation double drum spiral cooling towers.',
    defaultModelYear: 'Dale Automation',
    sections: [
      {
        id: 'sec-belt',
        title: 'Belt',
        items: [
          { id: 'item-1', sn: 1, name: 'Free of major damage', notes: 'Belt is free of major damage', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-2', sn: 2, name: 'No Broken links', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-3', sn: 3, name: 'Belt clips in place', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-4', sn: 4, name: 'Ensure belt safe to start', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-belt-oiler',
        title: 'Belt oiler',
        items: [
          { id: 'item-5', sn: 5, name: 'Oil level in tank', notes: 'Oil level in oiler is correct', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-6', sn: 6, name: 'Festo piping', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-7', sn: 7, name: 'Operation of oiler', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-belt-washer',
        title: 'Belt washer',
        items: [
          { id: 'item-8', sn: 8, name: 'Bearings and collars', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-9', sn: 9, name: 'Sprockets wear and /alignment', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-10', sn: 10, name: 'Side guides', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-11', sn: 11, name: 'Rail wear strips', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-12', sn: 12, name: 'Pump operational', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-13', sn: 13, name: 'Dosing pumps operational', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-14', sn: 14, name: 'Operation of rinse sprays', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-15', sn: 15, name: 'Operation of air blast', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-16', sn: 16, name: 'Operation of main solenoid', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-cip',
        title: 'CIP',
        items: [
          { id: 'item-17', sn: 17, name: 'Operation of solenoid valve', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-18', sn: 18, name: 'Temperature security', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-19', sn: 19, name: 'Leaks during operation', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-20', sn: 20, name: 'Operation of zones', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-21', sn: 21, name: 'Operation of dosing pumps', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-22', sn: 22, name: 'Operation of air purge', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-control-panel',
        title: 'Control Panel',
        items: [
          { id: 'item-23', sn: 23, name: 'Connections', notes: 'Connections tight and verified', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-24', sn: 24, name: 'Temperature display', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-25', sn: 25, name: 'Panel fans', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-26', sn: 26, name: 'Panel door seals', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-27', sn: 27, name: 'Door locks', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-28', sn: 28, name: 'Panel neatness', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-29', sn: 29, name: 'Panel drawings', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-crossovers',
        title: 'Cross overs (Top and bottom)',
        items: [
          { id: 'item-30', sn: 30, name: 'Wear strips', notes: 'Wearstrip inspected', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-31', sn: 31, name: 'Guides', notes: 'Guides secure and aligned', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-discharge',
        title: 'Discharge',
        items: [
          { id: 'item-32', sn: 32, name: 'Bearings', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-33', sn: 33, name: 'Sprockets wear / alignment', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-34', sn: 34, name: 'Belt guides', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-35', sn: 35, name: 'Rail wear strips', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-36', sn: 36, name: 'Operation of product height sensor', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-37', sn: 37, name: 'Product height, level with first tier height', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-38', sn: 38, name: 'Discharge E-stop', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-downdrum',
        title: 'Down Drum',
        items: [
          { id: 'item-39', sn: 39, name: 'Rail wear strips', notes: 'Wearstrip in good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-40', sn: 40, name: 'Support arms', notes: 'Rail arms straight and level', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-41', sn: 41, name: 'Rail arm supports (Plastic or welded tabs)', notes: 'Tabs intact', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-42', sn: 42, name: 'Hold down rail', notes: 'All hold down rails in place', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-43', sn: 43, name: 'Tier lift switches', notes: 'All sensors working and stopping belt', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-44', sn: 44, name: 'Motor and gearbox', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-45', sn: 45, name: 'Sputnik', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-46', sn: 46, name: 'Internal drum bolts', notes: 'Check for rust and torque', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-47', sn: 47, name: 'Top Centre shaft bearing', notes: 'Center bearing greased', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-48', sn: 48, name: 'Drum rings and internal drive spokes', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-49', sn: 49, name: 'Drum bar wear strips', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-updrum',
        title: 'Up Drum',
        items: [
          { id: 'item-50', sn: 50, name: 'Rail wear strips', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-51', sn: 51, name: 'Support arms', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-52', sn: 52, name: 'Rail arm supports (Plastic or welded tabs)', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-53', sn: 53, name: 'Tier lift switches', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-54', sn: 54, name: 'Motor and gearbox', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-55', sn: 55, name: 'Drum internals - Bolts', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-56', sn: 56, name: 'Drum internals - Drive spokes and rings', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-57', sn: 57, name: 'Top Centre bearing', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-evaporators',
        title: 'Evaporators',
        items: [
          { id: 'item-58', sn: 58, name: 'Air flow', notes: 'Airflow is good', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-59', sn: 59, name: 'Cleanliness', notes: 'Coils are clean', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-60', sn: 60, name: 'Corrosion', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-61', sn: 61, name: 'Filters', notes: 'Filters checked for condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-62', sn: 62, name: 'Drains', notes: 'Drains free and flowing', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-gearbox',
        title: 'Gearbox',
        items: [
          { id: 'item-63', sn: 63, name: 'Oil levels', notes: 'Oil level correct on both drums', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-64', sn: 64, name: 'Leaks', notes: 'Inspect seal areas', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-65', sn: 65, name: 'Gearbox noise', notes: 'No unusual noise during run', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-66', sn: 66, name: 'Coupling and fasteners', notes: 'Tight and checked', status: 'good', statusType: 'good_repair_replace' },
          { id: 'item-67', sn: 67, name: 'Gearbox motor', notes: 'Motors sound normal', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  spiral_cooler_edge_drive: {
    type: 'spiral_cooler_edge_drive',
    title: 'Edge Drive Spiral Cooler Inspection',
    defaultCategory: 'Edge Drive Bread Cooler',
    description: 'Detailed inspection form for Dale edge drive spiral bread & bakery cooling systems.',
    defaultModelYear: 'Dale Automation 2024',
    sections: [
      {
        id: 'sec-baffles',
        title: 'Baffles',
        items: [
          { id: 'ed-1', sn: 1, name: 'Up drum sliding baffles', notes: 'Up drum sliding baffles in place', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-2', sn: 2, name: 'Up drum internal hook on baffles', notes: 'Hook in baffles in place', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-3', sn: 3, name: 'Down drum sliding baffles', notes: 'All baffles in place', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-4', sn: 4, name: 'Down Drum internal hook on baffles', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-frame',
        title: 'Internal Frame stabilizing tie rods',
        items: [
          { id: 'ed-5', sn: 5, name: 'Up Drum', notes: 'Internal frame in good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-6', sn: 6, name: 'Down Drum', notes: 'Drum is stable', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-infeed-conv',
        title: 'Infeed Transfer Conveyor',
        items: [
          { id: 'ed-7', sn: 7, name: 'Belt', notes: 'Belt in good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-8', sn: 8, name: 'Drive and sprockets', notes: 'Drive sprockets in good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-9', sn: 9, name: 'Bearings', notes: 'Bearings greased', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-edge-belt',
        title: 'Belt',
        items: [
          { id: 'ed-10', sn: 10, name: 'Belt condition', notes: 'No broken links, plastic mesh intact', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-11', sn: 11, name: 'Edge drive links', notes: 'No edge links damaged', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-12', sn: 12, name: 'Belt rods', notes: 'Steel rods installed correctly', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-13', sn: 13, name: 'Belt engaging', notes: 'Proper pitch engagement', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-14', sn: 14, name: 'Belt tabs and flights', notes: 'Secure', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-15', sn: 15, name: 'Bearings', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-edge-oiler',
        title: 'Belt Oiler',
        items: [
          { id: 'ed-16', sn: 16, name: 'Oil level', notes: 'Oil level correct', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-17', sn: 17, name: 'Pump & piston', notes: 'Working properly', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-18', sn: 18, name: 'Pipe work', notes: 'Festo piping in good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-19', sn: 19, name: 'Splitter Block', notes: 'Clean, no leaks', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-20', sn: 20, name: 'Oiler blocks', notes: 'Blocks delivering oil to chain', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-21', sn: 21, name: 'Manual test', notes: 'Tested manual force cycle', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sec-safeties',
        title: 'Safeties & Sensors',
        items: [
          { id: 'ed-22', sn: 22, name: 'E-stop', notes: 'E-stops tested and verified', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-23', sn: 23, name: 'Tier lift sensors', notes: 'Tier lift sensors working', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-24', sn: 24, name: 'Product height', notes: 'Trip sensors operational', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-25', sn: 25, name: 'Temperature probes', notes: 'Probes working and reading correctly', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ed-26', sn: 26, name: 'Discharge sensor', notes: 'Discharge sensors working', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  spiral_freezer: {
    type: 'spiral_freezer',
    title: 'Friction Drive Spiral (Freezer)',
    defaultCategory: 'Spiral Freezer',
    description: 'Low-temperature industrial spiral freezer inspection covering sub-zero drive gearboxes, Ashworth steel belt, baffles, and coil icing.',
    defaultModelYear: 'Spiral Friction Drive Freezer',
    sections: [
      {
        id: 'fz-baff',
        title: 'Baffles',
        items: [
          { id: 'fz-1', sn: 1, name: 'Baffle Plates Top', notes: 'Baffle plates on top in place and good condition', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-2', sn: 2, name: 'Baffle Plates Bottom', notes: 'Bottom baffles in place', status: 'yes', statusType: 'yes_no' },
        ],
      },
      {
        id: 'fz-belt',
        title: 'Belt Specifications',
        items: [
          { id: 'fz-3', sn: 3, name: 'Steel or Blue Belt', notes: 'Ashworth stainless steel', status: 'good', statusType: 'readings_only', readings: 'Ashworth steel belt' },
          { id: 'fz-4', sn: 4, name: 'Belt Width', notes: 'Width measurement', status: 'good', statusType: 'readings_only', readings: '1060 mm' },
          { id: 'fz-5', sn: 5, name: 'Tiers', notes: 'Total tier count', status: 'good', statusType: 'readings_only', readings: '36 Tiers' },
          { id: 'fz-6', sn: 6, name: 'Pitch', notes: 'Pitch specification', status: 'good', statusType: 'readings_only', readings: 'Standard' },
          { id: 'fz-7', sn: 7, name: 'Design', notes: '', status: 'good', statusType: 'readings_only', readings: 'Ashworth steel belt design' },
        ],
      },
      {
        id: 'fz-oiler',
        title: 'Belt Oiler',
        items: [
          { id: 'fz-8', sn: 8, name: 'Belt Oiler Blocks', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-9', sn: 9, name: 'Belt Oiler Divider Block', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-10', sn: 10, name: 'Belt Oiler Piping', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-11', sn: 11, name: 'Manual Run of Oiler', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-12', sn: 12, name: 'Oil Level', notes: 'Oiler is filled to mark', status: 'yes', statusType: 'yes_no' },
          { id: 'fz-13', sn: 13, name: 'Belt Oiler Wiring', notes: '', status: 'ok', statusType: 'ok_faulty' },
          { id: 'fz-14', sn: 14, name: 'Pump Piston', notes: '', status: 'ok', statusType: 'ok_faulty' },
        ],
      },
      {
        id: 'fz-coils',
        title: 'Coils & Piping',
        items: [
          { id: 'fz-15', sn: 15, name: 'Coil Condition', notes: 'Fin integrity, no severe icing damage', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-16', sn: 16, name: 'Pipe Work & Lagging', notes: 'Insulation cladding intact', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'fz-drum',
        title: 'Drum & Sputnik',
        items: [
          { id: 'fz-17', sn: 17, name: 'Drum Fasteners', notes: 'Drum fasteners secure', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-18', sn: 18, name: 'Drum Supports (Spokes & Rings)', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-19', sn: 19, name: 'Drum Center Bearing', notes: 'Bearing size SF216 greased', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-20', sn: 20, name: 'Tie Rods', notes: 'Tie rods straight and tight', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-21', sn: 21, name: 'Drum Pull Cord', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'fz-takeup',
        title: 'Take-Up Frame & Overdrive',
        items: [
          { id: 'fz-22', sn: 22, name: 'Over Drive Shaft', notes: 'Bearings, roller, sprockets inspected', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-23', sn: 23, name: 'Over Drive Gearbox & Motor', notes: 'Inspect seal for oil seepage', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-24', sn: 24, name: 'Take-up Idler Shafts', notes: 'Bearing size FL206', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-25', sn: 25, name: 'Weighted Roller & Weight Box', notes: 'Top hats in place', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'fz-enclosure',
        title: 'Enclosure & Insulation',
        items: [
          { id: 'fz-26', sn: 26, name: 'Doors', notes: 'Freezer heated door seals intact', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-27', sn: 27, name: 'Flashings', notes: 'Flashings sealed', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-28', sn: 28, name: 'Wall Panels', notes: 'Panels intact, no air ingress', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-29', sn: 29, name: 'Infeed and Discharge Curtains', notes: 'Curtains in place', status: 'good', statusType: 'good_repair_replace' },
          { id: 'fz-30', sn: 30, name: 'Floor & Mess Floor', notes: 'Clean, heated underfloor active', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  oven_inspection: {
    type: 'oven_inspection',
    title: 'Oven General & Bake Chamber Inspection',
    defaultCategory: '8000 LPH Oven (Sarlie / Universal)',
    description: 'Inspection form for Dale Bakermation commercial bread and bakery baking ovens, burners, flame tubes, and conveyor chains.',
    defaultModelYear: 'Dale Bakermation',
    sections: [
      {
        id: 'ov-infeed',
        title: 'Infeed',
        items: [
          { id: 'ov-1', sn: 1, name: 'Air curtains', notes: 'Airflow prevents heat loss', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-2', sn: 2, name: 'Height sensors', notes: 'Bread pan height clearance', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-3', sn: 3, name: 'Pan sensors', notes: 'Check proximity sensors & wear strips', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-4', sn: 4, name: 'Pan guides', notes: 'Pan guide wearstrips intact', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-5', sn: 5, name: 'Idler shaft & bearings', notes: 'Idler bearings smooth and lubricated', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-6', sn: 6, name: 'Infeed guards', notes: 'Safety guards secure', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'ov-bake',
        title: 'Oven & Bake Chamber',
        items: [
          { id: 'ov-7', sn: 7, name: 'Oven chain (belt)', notes: 'Check link stretch, slats condition, lubrication', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-8', sn: 8, name: 'Burner 1', notes: 'Gas train, pilot, flame sensor, modulating actuator', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-9', sn: 9, name: 'Burner 2', notes: 'Ignition and flame safeguard', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-10', sn: 10, name: 'Burner 3', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-11', sn: 11, name: 'Burner 4', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-12', sn: 12, name: 'Flame tubes', notes: 'Refractory condition, erosion/cracking (2.4m tubes)', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-13', sn: 13, name: 'Big circulation fan 1', notes: 'Vibration, belt tension, grease', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-14', sn: 14, name: 'Big circulation fan 2', notes: 'Vibration & bearing noise', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-15', sn: 15, name: 'Small circulation fans', notes: 'Operational check', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-16', sn: 16, name: 'Oven inspection doors', notes: 'Door seals and latches tight', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-17', sn: 17, name: 'Temperature probes', notes: 'Thermocouples calibrated', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'ov-discharge',
        title: 'Discharge & Pan Handling',
        items: [
          { id: 'ov-18', sn: 18, name: 'Main drive motor & gearbox', notes: 'SEW-Eurodrive unit inspected', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-19', sn: 19, name: 'Main drive chain & tensioner', notes: 'Tension and sprocket alignment', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-20', sn: 20, name: 'Oven drive roller & bearings', notes: 'Rollers rotating freely', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-21', sn: 21, name: 'Discharge conveyor belt & rollers', notes: 'Slat belt and return rollers', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-22', sn: 22, name: 'Pan moving chain idler sprockets', notes: 'Idler sprockets & bearings', status: 'good', statusType: 'good_repair_replace' },
          { id: 'ov-23', sn: 23, name: 'Discharge conveyor pan stopping guide', notes: 'Pan stopper wearstrips', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  commissioning_chiller_pump: {
    type: 'commissioning_chiller_pump',
    title: 'Commissioning - Cooler Pump Station, Pipework, Coil & Chiller Setup',
    defaultCategory: 'Spiral Cooler Ammonia/Water Chiller Plant',
    description: 'Final commissioning and balance protocol for pump stations, Trane chillers, buffer tanks, and cooling coils.',
    defaultModelYear: 'Trane / Grundfos 2024',
    sections: [
      {
        id: 'comm-pipe',
        title: 'Pump Station & Pipework Layout',
        items: [
          { id: 'cp-1', sn: 1, name: 'Pumps (Primary & Standby)', notes: 'NSCS 80-160/150 Lowara 15kW motors. Rotation and isolator interlocking verified.', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-2', sn: 2, name: 'Isolators', notes: 'Isolators wired & tested. Switchover logic verified.', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-3', sn: 3, name: 'Gauges', notes: 'Pressure gauges calibrated and dampened', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-4', sn: 4, name: 'Check valves & pneumatic butterflies', notes: 'Pneumatic butterfly valves open/close tested with pump run signal', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-5', sn: 5, name: 'Strainers', notes: 'Strainers cleaned before circulation', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-6', sn: 6, name: 'Buffer tank', notes: 'Hydrostatically leak tested, low-level shutoff protocol verified', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-7', sn: 7, name: 'Pipework & Insulation', notes: 'Pressure tested, certificate filed, cladding sealed', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-8', sn: 8, name: 'Flowmeter', notes: 'Siemens Sitrans F M Mag flowmeter output verified', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'comm-chiller',
        title: 'Chiller Unit Installation & Commissioning',
        items: [
          { id: 'cp-9', sn: 9, name: 'Chiller Unit Installation', notes: 'Trane CGAF 130 SE XLN on damper feet', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-10', sn: 10, name: 'Grundfos Circulation Pump', notes: 'Grundfos TPD 100-240/2 7.5kW motor', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-11', sn: 11, name: 'Differential Pressure Switch', notes: 'No-flow pump trip condition tested and verified', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-12', sn: 12, name: 'System Performance Setpoint', notes: 'Design setpoint: 10°C, Actual: 7°C (UD 14°C, DD 10°C)', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cp-13', sn: 13, name: 'Chiller Evaporator Flowrate', notes: 'Flowrate verified on Comdronic meter', status: 'yes', statusType: 'yes_no', readings: '26 l/s @ 0.8 Bar' },
        ],
      },
      {
        id: 'comm-balance',
        title: 'Coil Balancing & Fan Performance',
        items: [
          { id: 'cp-14', sn: 14, name: 'Up Drum Bottom Stack Flow', notes: 'Bypass flowrate set', status: 'good', statusType: 'readings_only', readings: '8.2 l/s' },
          { id: 'cp-15', sn: 15, name: 'Up Drum Middle Stack Flow', notes: 'Bypass flowrate set', status: 'good', statusType: 'readings_only', readings: '8.2 l/s' },
          { id: 'cp-16', sn: 16, name: 'Up Drum Top Stack Flow', notes: 'Bypass flowrate set', status: 'good', statusType: 'readings_only', readings: '8.2 l/s' },
          { id: 'cp-17', sn: 17, name: 'Down Drum Stacks Flow', notes: 'Coil flowrate set', status: 'good', statusType: 'readings_only', readings: '3.6 l/s' },
          { id: 'cp-18', sn: 18, name: 'Up Drum Coil Face Velocities', notes: 'Anemometer average face velocity', status: 'good', statusType: 'readings_only', readings: '2.3 m/s @ 45Hz' },
          { id: 'cp-19', sn: 19, name: 'Circulation Pump Performance', notes: 'Pressure and current draw', status: 'good', statusType: 'readings_only', readings: '2.8-3.0 Bar, 38 l/s @ 47Hz, 22.8A' },
          { id: 'cp-20', sn: 20, name: 'Drum Fans Performance', notes: 'Fan current draw at set frequency', status: 'good', statusType: 'readings_only', readings: '45 Hz, 6.5-7.0A, 3.4 kW' },
        ],
      },
    ],
  },

  belt_pre_inspection: {
    type: 'belt_pre_inspection',
    title: 'Belt Replacement Pre-Inspection',
    defaultCategory: 'Bakery Spiral / Oven Belting',
    description: 'Pre-replacement engineering assessment for spiral conveyor chains, wear analysis, turn life, and fatigue.',
    defaultModelYear: 'Dale Automation',
    sections: [
      {
        id: 'bp-belt',
        title: 'Belt Assessment',
        items: [
          { id: 'bp-1', sn: 1, name: 'Belt width', notes: 'Measure width across tiers', status: 'good', statusType: 'readings_only', readings: '950 mm' },
          { id: 'bp-2', sn: 2, name: 'Belt type', notes: 'Material & mesh specification', status: 'good', statusType: 'readings_only', readings: 'Spiral wire link belt' },
          { id: 'bp-3', sn: 3, name: 'Belt condition & fatigue', notes: 'Inspect link distortion, elongation, edge links, and life expectancy', status: 'replace', statusType: 'good_repair_replace' },
          { id: 'bp-4', sn: 4, name: 'Sprocket tooth wear', notes: 'Inspect drive sprockets for shark-toothing', status: 'good', statusType: 'good_repair_replace' },
          { id: 'bp-5', sn: 5, name: 'Wear strips & slide rails', notes: 'Condition of UHMWPE wearstrips', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  prover_inspection: {
    type: 'prover_inspection',
    title: 'Prover Factory Inspection & Commissioning',
    defaultCategory: '8000 LPH Prover',
    description: 'Factory acceptance and commissioning inspection for industrial proofing chambers and load/unload mechanisms.',
    defaultModelYear: 'Dale Bakermation 2024',
    sections: [
      {
        id: 'pr-draw',
        title: 'Drawing & Specification',
        items: [
          { id: 'pr-1', sn: 1, name: 'Drawing Number', notes: 'Engineering blueprint verification', status: 'good', statusType: 'readings_only', readings: 'DSS 397-4' },
        ],
      },
      {
        id: 'pr-material',
        title: 'Material & Construction',
        items: [
          { id: 'pr-2', sn: 2, name: 'Material Type & Welds', notes: 'Stainless steel grade 304, clean TIG welds', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-3', sn: 3, name: 'Discharge conveyor fasteners', notes: 'Bolts torqued and checked', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-4', sn: 4, name: 'Main drive gearbox', notes: 'SEW-Eurodrive KA157 R97 running smoothly', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-5', sn: 5, name: 'Chain oiler brush alignment', notes: 'Brush making full contact with conveyor chain', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-6', sn: 6, name: 'Steam lance & humidity injection', notes: 'Steam modulation valve responsive', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'pr-safety',
        title: 'Safety Interlocks & Fortress System',
        items: [
          { id: 'pr-7', sn: 7, name: 'Fortress Key Lockout System', notes: 'Inhibits machine motion when key removed', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-8', sn: 8, name: 'Emergency Stops & Pull Chords', notes: 'All perimeter e-stops tested', status: 'good', statusType: 'good_repair_replace' },
          { id: 'pr-9', sn: 9, name: 'Finger tilt proxies', notes: 'Jam detection reset tested', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  training_register: {
    type: 'training_register',
    title: 'Training - Maintenance & Operation Register',
    defaultCategory: 'Industrial Machinery Training Handover',
    description: 'Formal staff training and competency evaluation register for equipment maintenance and operators.',
    defaultModelYear: 'Dale Automation',
    sections: [
      {
        id: 'tr-module',
        title: 'Training Modules Covered',
        items: [
          { id: 'tr-1', sn: 1, name: 'Machine Auto Start & Purge Cycle', notes: 'Taught pre-startup inspection, purge sequence, and slow heat', status: 'good', statusType: 'good_repair_replace' },
          { id: 'tr-2', sn: 2, name: 'HMI Touchscreen Operation', notes: 'Taught temperature control, bake time, alarms, and trend screens', status: 'good', statusType: 'good_repair_replace' },
          { id: 'tr-3', sn: 3, name: 'Burner & Flame Safeguard Procedures', notes: 'Taught LMV5 safety PLC, gas supply shut-off, emergency procedures', status: 'good', statusType: 'good_repair_replace' },
          { id: 'tr-4', sn: 4, name: 'Fortress Lockout & Safe Work System', notes: 'Lockout tagout (LOTO), buddy system, and manual pendant', status: 'good', statusType: 'good_repair_replace' },
          { id: 'tr-5', sn: 5, name: 'Routine Greasing & Lubrication', notes: 'PF FG2 / Habotec FG46 schedule and oiler injector checks', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'tr-register',
        title: 'Trainee Competency Register',
        items: [
          { id: 'tr-6', sn: 6, name: 'Signed Training Register on site', notes: 'Hardcopy signed and retained in plant safety file', status: 'good', statusType: 'good_repair_replace' },
          { id: 'tr-7', sn: 7, name: 'Trainee 1: Wasfiq Theunissen (Mechanical Tech)', notes: 'Competency verified on mechanical drive and oiler', status: 'pass', statusType: 'pass_fail' },
          { id: 'tr-8', sn: 8, name: 'Trainee 2: Delmaine Fred (Electrical Tech)', notes: 'Competency verified on HMI and safety circuit reset', status: 'pass', statusType: 'pass_fail' },
          { id: 'tr-9', sn: 9, name: 'Trainee 3: Tumisho Molefe (Line Operator)', notes: 'Competency verified on auto start/stop & e-stop protocol', status: 'pass', statusType: 'pass_fail' },
          { id: 'tr-10', sn: 10, name: 'Trainee 4: Piet Matjomane (Maintenance Artisan)', notes: 'Competency verified on belt tensioning & lubrication', status: 'pass', statusType: 'pass_fail' },
        ],
      },
    ],
  },

  service_van_tools: {
    type: 'service_van_tools',
    title: 'Tool Check List for Services Fleet & Rigging',
    defaultCategory: 'Fleet Vehicle & Rigging Tools',
    description: 'Vehicle equipment, rigging slings, King Tony tool chest inspection, consumables audit, and welding safety.',
    defaultModelYear: 'Dale Field Service Fleet',
    sections: [
      {
        id: 'sv-chain',
        title: 'Chain Blocks & Lifting Rigging',
        items: [
          { id: 'sv-1', sn: 1, name: '2TON Chain Block 001', notes: 'Certified and load tested', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-2', sn: 2, name: '2TON Chain Block 002', notes: 'Certified and load tested', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-3', sn: 3, name: '2TON Chain Block 003', notes: 'Certified and load tested', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sv-consumables',
        title: 'Consumables & Lubricants',
        items: [
          { id: 'sv-4', sn: 4, name: 'Klingspor Cutting Disks 115mm', notes: 'Check stock', status: 'good', statusType: 'readings_only', readings: '10 disks (0-100)' },
          { id: 'sv-5', sn: 5, name: 'Den Braven Food Grade Sealer (White)', notes: 'Full tubes on board', status: 'good', statusType: 'readings_only', readings: '2 tubes (0-50)' },
          { id: 'sv-6', sn: 6, name: 'Q20 Penetrating Spray', notes: 'Cans on board', status: 'good', statusType: 'readings_only', readings: '2 cans (0-5)' },
          { id: 'sv-7', sn: 7, name: 'Performance Fluid XP-FG Food Grade Grease', notes: 'Tubs on board', status: 'good', statusType: 'readings_only', readings: '1 tub' },
          { id: 'sv-8', sn: 8, name: 'S/S TIG Filler Wire 1.6mm & 2.4mm', notes: 'Stock in van', status: 'good', statusType: 'readings_only', readings: 'Full pack' },
        ],
      },
      {
        id: 'sv-powertools',
        title: 'Power Tools & Cordless',
        items: [
          { id: 'sv-9', sn: 9, name: '115mm Angle Grinder (Dewalt/Makita)', notes: 'Cord and guard inspected', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-10', sn: 10, name: 'Cordless Hand Drill 18V', notes: 'Working with 2 charged batteries', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-11', sn: 11, name: 'Cordless Nut Runner 350Nm', notes: 'Calibration verified', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sv-chests',
        title: 'King Tony Tool Chest (Draws 1-7)',
        items: [
          { id: 'sv-12', sn: 12, name: 'Draw 1: Punches & Chisels', notes: 'Audit against shadow board', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-13', sn: 13, name: 'Draw 2: Pliers & Hammers', notes: 'Check 400g rubber hammer & circlip pliers', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-14', sn: 14, name: 'Draw 3: Screwdrivers (Flat & Phillips)', notes: 'Full set complete', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-15', sn: 15, name: 'Draw 4: Hex Allen Keys & T-Handles', notes: 'Check metric keys', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-16', sn: 16, name: 'Draw 5: 1/2" & 1/4" Ratchets and Sockets', notes: 'Full socket tray inspected', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-17', sn: 17, name: 'Draw 6: Metric Combination Spanners (6-32mm)', notes: 'Full set present', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-18', sn: 18, name: 'Draw 7: Specialty Flange Wrenches', notes: 'All accounted for', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'sv-safety',
        title: 'Safety, Slings & Welding Machine',
        items: [
          { id: 'sv-19', sn: 19, name: 'Fire Extinguishers (4kg DCP)', notes: 'Serviced and in date', status: 'good', statusType: 'readings_only', readings: '2 Units' },
          { id: 'sv-20', sn: 20, name: 'First Aid Kit Box', notes: 'Stocked and sealed', status: 'good', statusType: 'good_repair_replace' },
          { id: 'sv-21', sn: 21, name: 'Rigging Slings Tags #101 to #121', notes: 'All slings inspected, no fraying, valid color tag', status: 'pass', statusType: 'pass_fail' },
          { id: 'sv-22', sn: 22, name: 'Welding Inverter & Auto-Darkening Helmet', notes: 'Working, lead insulation intact', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },

  custom: {
    type: 'custom',
    title: 'Custom Industrial Machinery Inspection',
    defaultCategory: 'Heavy Industrial Equipment',
    description: 'Customizable report template for any special conveyor, spiral, oven, freezer, or packaging line.',
    defaultModelYear: 'Dale Automation',
    sections: [
      {
        id: 'cst-sec-1',
        title: 'Mechanical & Structural',
        items: [
          { id: 'cst-1', sn: 1, name: 'Main Drive & Transmission', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cst-2', sn: 2, name: 'Chains & Conveyor Belts', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cst-3', sn: 3, name: 'Bearings & Lubrication', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
      {
        id: 'cst-sec-2',
        title: 'Electrical & Safety Systems',
        items: [
          { id: 'cst-4', sn: 4, name: 'Control Panel & PLC', notes: '', status: 'good', statusType: 'good_repair_replace' },
          { id: 'cst-5', sn: 5, name: 'Emergency Stop Circuits & Sensors', notes: '', status: 'good', statusType: 'good_repair_replace' },
        ],
      },
    ],
  },
};
