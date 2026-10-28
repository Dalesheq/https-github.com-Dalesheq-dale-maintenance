export interface EquipmentAsset {
  id: string;
  assetNumber: string;
  name: string;
  category: string;
  description?: string;
  recommendedTemplate?: string;
}

export interface ClientFacility {
  id: string;
  name: string;
  clientGroup: string;
  country: string;
  countryFlag: string;
  region: string;
  locationAddress: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  assets: EquipmentAsset[];
}

export const SITE_CATALOG: ClientFacility[] = [
  // ==========================================
  // 🇿🇦 SOUTH AFRICA
  // ==========================================
  {
    id: 'sasko-aeroton',
    name: 'Sasko Aeroton',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Aeroton, Johannesburg',
    locationAddress: 'Aeroton, Johannesburg, Gauteng, South Africa',
    gps: { latitude: -26.2573, longitude: 27.9892 },
    assets: [
      { id: 'sa-kaak001', assetNumber: 'KAAK001', name: 'Plant 1 Cooler', category: 'Spiral Cooler' },
      { id: 'sa-kaak002', assetNumber: 'KAAK002', name: 'Plant 2 Cooler', category: 'Spiral Cooler' },
      { id: 'sa-dss311-2', assetNumber: 'DSS 311-2', name: 'Cooler', category: 'Spiral Cooler' },
      { id: 'sa-dss311-6', assetNumber: 'DSS 311-6', name: 'Basket/Crate Loader', category: 'Packaging & Handling' },
      { id: 'sa-dss340-24', assetNumber: 'DSS 340-24', name: 'Plant 1 Tweedy Mixer', category: 'Industrial Mixer' },
      { id: 'sa-dss347-24', assetNumber: 'DSS 347-24', name: 'Plant 2 Tweedy Mixer', category: 'Industrial Mixer' },
    ],
  },
  {
    id: 'blue-ribbon-aeroton',
    name: 'Blue Ribbon / Premiere Aeroton',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Aeroton, Johannesburg',
    locationAddress: 'Adcock Ingram Ave, Aeroton, Johannesburg, South Africa',
    gps: { latitude: -26.2585, longitude: 27.991 },
    assets: [
      { id: 'bra-395-5', assetNumber: 'DSS 395-5', name: 'Bakermation Oven', category: 'Baking Oven' },
      { id: 'bra-396-1', assetNumber: 'DSS 396-1 / DSS 397-1', name: 'Pan & Lid Prover Loop Conveyors', category: 'Conveyor & Handling' },
      { id: 'bra-396-2', assetNumber: 'DSS 396-2 / DSS 397-2', name: 'Floor Tracks / Pan Store', category: 'Storage & Pan Handling' },
      { id: 'bra-396-4', assetNumber: 'DSS 396-4 / DSS 397-4', name: 'Prover Systems', category: 'Prover System' },
      { id: 'bra-396-5', assetNumber: 'DSS 396-5 / DSS 397-5', name: 'Ovens & Unloaders', category: 'Baking Oven' },
      { id: 'bra-396-6', assetNumber: 'DSS 396-6 / DSS 397-6', name: 'Lid Conveyors / Access Platform', category: 'Conveyor & Handling' },
      { id: 'bra-396-9', assetNumber: 'DSS 396-9 / DSS 397-9', name: 'Cooler Pump Stations / Chiller Setups / HDPE Tanks', category: 'Cooling & Fluid Systems' },
    ],
  },
  {
    id: 'abinbev-alrode',
    name: 'ABInBEV / SAB Alrode',
    clientGroup: 'AB InBev / South African Breweries',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Alrode, Alberton',
    locationAddress: 'Alrode, Alberton, Gauteng, South Africa',
    gps: { latitude: -26.3142, longitude: 28.1408 },
    assets: [
      { id: 'sab-line9', assetNumber: 'SAB Line 9 / Pasteuriser', name: 'Line 9 Pasteuriser', category: 'Pasteuriser' },
    ],
  },
  {
    id: 'albany-bellville',
    name: 'Albany Bellville',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Bellville, Cape Town',
    locationAddress: 'Bellville, Cape Town, Western Cape, South Africa',
    gps: { latitude: -33.8943, longitude: 18.6294 },
    assets: [
      { id: 'alb-319-10', assetNumber: 'DSS 319-10', name: 'Industrial Bakery Plant Asset', category: 'Bakery Automation' },
    ],
  },
  {
    id: 'sunbake-benoni',
    name: 'Sunbake Benoni',
    clientGroup: 'Foodcorp / Sunbake',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Benoni',
    locationAddress: 'Van Dyk Rd, Industrial Sites, Benoni, Gauteng, South Africa',
    gps: { latitude: -26.1887, longitude: 28.3206 },
    assets: [
      { id: 'sb-269-2', assetNumber: 'DSS 269-2', name: 'Oven System (8000 Loaf P/H)', category: 'Baking Oven' },
      { id: 'sb-402-9', assetNumber: 'DSS 402-9', name: 'Mixer Refurbishment', category: 'Industrial Mixer' },
    ],
  },
  {
    id: 'sasko-bloemfontein',
    name: 'Sasko Bloemfontein',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Bloemfontein',
    locationAddress: 'Hamilton Industrial, Bloemfontein, Free State, South Africa',
    gps: { latitude: -29.1388, longitude: 26.2238 },
    assets: [
      { id: 'sbf-180-1', assetNumber: 'DSS 180-1', name: 'Lid Store System', category: 'Storage & Pan Handling' },
      { id: 'sbf-180-5', assetNumber: 'DSS 180-5', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'sbf-180-7-c', assetNumber: 'DSS 180-7 Collator 1 to 4', name: 'Collator Production Lines', category: 'Packaging & Handling' },
      { id: 'sbf-180-7-bl', assetNumber: 'DSS 180-7 Basket Loader', name: 'Production Section Basket Loader', category: 'Packaging & Handling' },
      { id: 'sbf-284', assetNumber: 'DSS 284', name: 'Basket Loader Assembly', category: 'Packaging & Handling' },
    ],
  },
  {
    id: 'rich-foods-booysens',
    name: 'Rich Foods / Gen4Foods',
    clientGroup: 'Rich Products / Gen4Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Booysens / Johannesburg Regions',
    locationAddress: 'Booysens, Johannesburg, Gauteng, South Africa',
    gps: { latitude: -26.2312, longitude: 28.0264 },
    assets: [
      { id: 'rf-327', assetNumber: 'DSS 327', name: 'Pizza Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'rf-northfield', assetNumber: 'Northfield spiral (IJ) / IJ Freezer Spiral', name: 'Friction/Pozi Drive Freezer Systems', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'sasko-brits',
    name: 'Sasko Brits',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Brits',
    locationAddress: 'Brits Industrial, North West, South Africa',
    gps: { latitude: -25.6339, longitude: 27.7806 },
    assets: [
      { id: 'sb-116', assetNumber: 'DSS 116', name: 'Double Drum Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'sb-379-24', assetNumber: 'DSS 379-24', name: 'Mixer System Modifications', category: 'Industrial Mixer' },
    ],
  },
  {
    id: 'woodys-cape-town',
    name: 'Woodys Cape Town',
    clientGroup: 'Woodys Brands',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Cape Town (Other)',
    locationAddress: 'Montague Gardens, Cape Town, Western Cape, South Africa',
    gps: { latitude: -33.868, longitude: 18.52 },
    assets: [
      { id: 'wd-344-9', assetNumber: 'DSS 344-9 Woodys Capetown', name: 'Side Drive Freezer Spiral', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'blue-ribbon-durban',
    name: 'Blue Ribbon Durban',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Durban / Pinetown',
    locationAddress: 'Mobeni Industrial, Durban, KwaZulu-Natal, South Africa',
    gps: { latitude: -29.931, longitude: 30.985 },
    assets: [
      { id: 'brd-265-2', assetNumber: 'DSS 265-2', name: 'Spiral Unit', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'blue-ribbon-pinetown',
    name: 'Blue Ribbon Pinetown',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Durban / Pinetown',
    locationAddress: 'New Germany / Pinetown, KwaZulu-Natal, South Africa',
    gps: { latitude: -29.818, longitude: 30.887 },
    assets: [
      { id: 'brp-299-5', assetNumber: 'DSS 299-5', name: 'Oven Module System', category: 'Baking Oven' },
      { id: 'brp-299-9', assetNumber: 'DSS 299-9', name: 'Double Drum Spiral Cooler', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'albany-durban',
    name: 'Albany Durban',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Durban / Pinetown',
    locationAddress: 'Durban Industrial, KwaZulu-Natal, South Africa',
    gps: { latitude: -29.8587, longitude: 31.0218 },
    assets: [
      { id: 'ad-236-4', assetNumber: 'DSS 236-4', name: 'Double Drum Spiral Cooler', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'albany-germiston',
    name: 'Albany Germiston',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Germiston',
    locationAddress: 'Germiston Industrial, Gauteng, South Africa',
    gps: { latitude: -26.2235, longitude: 28.1691 },
    assets: [
      { id: 'ag-alb002', assetNumber: 'ALB 002', name: 'Final Prover', category: 'Prover System' },
      { id: 'ag-alb002-1', assetNumber: 'ALB 002-1', name: 'Plant 2 De-lidder Inside & Outside Lines', category: 'Packaging & Handling' },
      { id: 'ag-alb002-2', assetNumber: 'ALB 002-2', name: 'Lidder Systems Plants 1 & 2', category: 'Packaging & Handling' },
      { id: 'ag-alb002-3', assetNumber: 'ALB 002-3', name: 'De-panner Inside & Outside Lines', category: 'Packaging & Handling' },
      { id: 'ag-alb002-4', assetNumber: 'ALB 002-4', name: 'Oven Plants 1 & 2', category: 'Baking Oven' },
    ],
  },
  {
    id: 'sovereign-foods-harties',
    name: 'Sovereign Foods Harties',
    clientGroup: 'Sovereign Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Hartebeespoort / Harties',
    locationAddress: 'Hartebeespoort, North West, South Africa',
    gps: { latitude: -25.727, longitude: 27.892 },
    assets: [
      { id: 'sf-137', assetNumber: 'DSS 137', name: '2.5 Ton Friction Freezer', category: 'Spiral Freezer' },
      { id: 'sf-361-9', assetNumber: 'DSS 361-9', name: '6 Ton Pozzi Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'sf-384-9', assetNumber: 'DSS 384-9', name: 'HBD 2.5T Rebuild System', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'eskort-heidelberg',
    name: 'Eskort Heidelberg',
    clientGroup: 'Eskort Pork Products',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Heidelberg',
    locationAddress: 'Heidelberg Industrial, Gauteng, South Africa',
    gps: { latitude: -26.502, longitude: 28.358 },
    assets: [
      { id: 'eh-198', assetNumber: 'DSS 198', name: 'Double Drum Spiral Friction Freezer', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'snackworks-isando',
    name: 'Snackworks Isando',
    clientGroup: 'AVI / Snackworks',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Isando',
    locationAddress: 'Isando, Kempton Park, Gauteng, South Africa',
    gps: { latitude: -26.142, longitude: 28.2 },
    assets: [
      { id: 'sw-331-9', assetNumber: 'DSS 331-9', name: 'Friction Dryer Spiral System', category: 'Dryer System' },
      { id: 'sw-332-9', assetNumber: 'DSS 332-9', name: 'Double Drum Ambient Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'sw-318', assetNumber: '318', name: 'Dryer Unit', category: 'Dryer System' },
    ],
  },
  {
    id: 'sasko-krugersdorp',
    name: 'Sasko Krugersdorp',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Krugersdorp',
    locationAddress: 'Factoria, Krugersdorp, Gauteng, South Africa',
    gps: { latitude: -26.115, longitude: 27.79 },
    assets: [
      { id: 'sk-330-09', assetNumber: 'DSS 330-09', name: 'Dale Automation Cooler System', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'rcl-piemans-krugersdorp',
    name: 'RCL Pie-mans Krugersdorp',
    clientGroup: 'RCL Foods / Piemans',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Krugersdorp',
    locationAddress: 'Chamdor, Krugersdorp, Gauteng, South Africa',
    gps: { latitude: -26.13, longitude: 27.795 },
    assets: [
      { id: 'rcl-157', assetNumber: 'DSS 157', name: 'Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'rcl-158', assetNumber: 'DSS 158', name: 'Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'rcl-177', assetNumber: 'DSS 177', name: 'Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'supreme-mafikeng',
    name: 'Supreme Mafikeng',
    clientGroup: 'Country Bird / Supreme Poultry',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Mafikeng',
    locationAddress: 'Mafikeng Industrial, North West, South Africa',
    gps: { latitude: -25.86, longitude: 25.64 },
    assets: [
      { id: 'sm-179', assetNumber: 'DSS 179', name: 'Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'sm-york', assetNumber: 'Supreme Mafikeng YORK / YORK 2', name: 'Freezer Spirals 1 & 2', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'blue-ribbon-middelburg',
    name: 'Blue Ribbon Middelburg',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Middelburg',
    locationAddress: 'Middelburg Industrial, Mpumalanga, South Africa',
    gps: { latitude: -25.775, longitude: 29.464 },
    assets: [
      { id: 'brm-403-2', assetNumber: 'DSS 403-2', name: 'Floor Track Framework', category: 'Conveyor & Handling' },
      { id: 'brm-403-4', assetNumber: 'DSS 403-4', name: 'Prover Main Drives, Sprockets, & Framework', category: 'Prover System' },
      { id: 'brm-403-5', assetNumber: 'DSS 403-5', name: 'Oven Module, Circulation Systems, Inner Shields & Pressure Chambers', category: 'Baking Oven' },
      { id: 'brm-403-9', assetNumber: 'DSS 403-9', name: 'Cooler Pump Station / Chiller Setup', category: 'Cooling & Fluid Systems' },
    ],
  },
  {
    id: 'famous-brands-midrand',
    name: 'Famous Brands Midrand',
    clientGroup: 'Famous Brands Supply Chain',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Midrand',
    locationAddress: 'Midrand Industrial, Gauteng, South Africa',
    gps: { latitude: -25.998, longitude: 28.126 },
    assets: [
      { id: 'fb-mnf0322', assetNumber: 'MNF-EQ-0322', name: 'Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'blue-ribbon-mthatha',
    name: 'Blue Ribbon / Premiere Mthatha',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Mthatha',
    locationAddress: 'Vulindlela Heights, Mthatha, Eastern Cape, South Africa',
    gps: { latitude: -31.594, longitude: 28.777 },
    assets: [
      { id: 'brmt-383-5', assetNumber: 'DSS 383-5', name: 'Bakermation 8000 Loaf P/H Oven Loader/Unloader', category: 'Baking Oven' },
      { id: 'brmt-383-9', assetNumber: 'DSS 383-9', name: 'Edge Drive Spiral Cooler System', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'sunbake-nelspruit',
    name: 'Sunbake Nelspruit',
    clientGroup: 'Foodcorp / Sunbake',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Nelspruit',
    locationAddress: 'Rocky Drift Industrial, Nelspruit / Mbombela, Mpumalanga, South Africa',
    gps: { latitude: -25.438, longitude: 30.963 },
    assets: [
      { id: 'sbn-double-drum', assetNumber: 'Sunbake Nelspruit', name: 'Double Drum Spiral Cooler', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'sasko-olifantsfontein',
    name: 'Sasko Olifantsfontein',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Olifantsfontein',
    locationAddress: 'Industry Rd, Olifantsfontein, Midrand, Gauteng, South Africa',
    gps: { latitude: -25.952, longitude: 28.212 },
    assets: [
      { id: 'so-167', assetNumber: 'DSS 167', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'so-spooner', assetNumber: 'Sasko Olifantsfontein', name: 'Spooner Vicars Final Prover System', category: 'Prover System' },
      { id: 'so-169obc', assetNumber: 'DSS 169 OBC / DSS 169OBC', name: 'Collator Line Unit', category: 'Packaging & Handling' },
      { id: 'so-sp001', assetNumber: 'SP001', name: 'Spooner Vicars System', category: 'Prover System' },
    ],
  },
  {
    id: 'festive-olifantsfontein',
    name: 'Festive Olifantsfontein',
    clientGroup: 'Astral Foods / Festive',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Olifantsfontein',
    locationAddress: 'Olifantsfontein Industrial, Gauteng, South Africa',
    gps: { latitude: -25.955, longitude: 28.216 },
    assets: [
      { id: 'fo-185-iqf4', assetNumber: 'DSS 185 / IQF 4', name: 'Spiral Friction Freezer System Rebuild', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'albany-pietermaritzburg',
    name: 'Albany Pietermaritzburg',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Pietermaritzburg',
    locationAddress: 'Industrial Crescent, Pietermaritzburg, KwaZulu-Natal, South Africa',
    gps: { latitude: -29.6168, longitude: 30.3928 },
    assets: [
      { id: 'apmb-211-8', assetNumber: 'DSS 211-8', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'apmb-249-1', assetNumber: 'DSS 249-1', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'apmb-coal-1', assetNumber: 'Albany PMB Collator line 1 / Coal-1', name: 'Collator Production Lines', category: 'Packaging & Handling' },
    ],
  },
  {
    id: 'sasko-polokwane',
    name: 'Sasko Polokwane',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Polokwane',
    locationAddress: 'Ladanna Industrial, Polokwane, Limpopo, South Africa',
    gps: { latitude: -23.896, longitude: 29.458 },
    assets: [
      { id: 'spk-224', assetNumber: 'DSS 224', name: 'Dale Bakermation Oven Chambers/Circulation Fans', category: 'Baking Oven' },
      { id: 'spk-225', assetNumber: 'DSS 225', name: 'Double Drum Friction Spiral Cooler System', category: 'Spiral Cooler' },
      { id: 'spk-spooner', assetNumber: 'Sasko Polokwane', name: 'Spooner Vicars Big Marie Oven Assembly', category: 'Baking Oven' },
    ],
  },
  {
    id: 'sunbake-polokwane',
    name: 'Sunbake Polokwane',
    clientGroup: 'Foodcorp / Sunbake',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Polokwane',
    locationAddress: 'Polokwane Industrial, Limpopo, South Africa',
    gps: { latitude: -23.899, longitude: 29.462 },
    assets: [
      { id: 'sbpk-194', assetNumber: 'DSS 194', name: 'Dale System Section', category: 'Bakery Automation' },
    ],
  },
  {
    id: 'abinbev-pe',
    name: 'ABInBEV P.E.',
    clientGroup: 'AB InBev / South African Breweries',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Port Elizabeth',
    locationAddress: 'Neave Industrial, Port Elizabeth / Gqeberha, Eastern Cape, South Africa',
    gps: { latitude: -33.945, longitude: 25.592 },
    assets: [
      { id: 'sab-pe-past', assetNumber: 'Pasteuriser AbinBev P.E', name: '4-Deck Pasteuriser Assembly', category: 'Pasteuriser' },
    ],
  },
  {
    id: 'sasko-pe',
    name: 'Sasko Port Elizabeth',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Port Elizabeth',
    locationAddress: 'Korsten, Port Elizabeth / Gqeberha, Eastern Cape, South Africa',
    gps: { latitude: -33.931, longitude: 25.578 },
    assets: [
      { id: 'spe-190', assetNumber: 'DSS 190 - Sasko Brito\'s P3', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'spe-104', assetNumber: 'Contract No 104 / No 104 - Sasko Brito\'s P2', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'blue-ribbon-potch',
    name: 'Blue Ribbon Potch',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Potchefstroom',
    locationAddress: 'Industria, Potchefstroom, North West, South Africa',
    gps: { latitude: -26.714, longitude: 27.097 },
    assets: [
      { id: 'brpo-316-2', assetNumber: 'DSS 316-2', name: 'Double Drum Friction Spiral Cooler System', category: 'Spiral Cooler' },
      { id: 'brpo-316-4', assetNumber: 'DSS 316-4', name: 'Production Line Check', category: 'Conveyor & Handling' },
    ],
  },
  {
    id: 'albany-pretoria',
    name: 'Albany Pretoria',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Pretoria',
    locationAddress: 'Pretoria Industrial, Gauteng, South Africa',
    gps: { latitude: -25.753, longitude: 28.188 },
    assets: [
      { id: 'apta-001', assetNumber: 'ALB 001', name: 'Universal Oven Framework', category: 'Baking Oven' },
      { id: 'apta-003', assetNumber: 'ALB 003', name: 'Universal Oven Circulation Chambers Assembly', category: 'Baking Oven' },
      { id: 'apta-t0345', assetNumber: 'T0345 / Albany PTA cooler', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'apta-lidstore', assetNumber: 'Albany Pretoria Lid store', name: '8-Pan Lid Store System', category: 'Storage & Pan Handling' },
    ],
  },
  {
    id: 'blue-ribbon-pretoria',
    name: 'Blue Ribbon Pretoria',
    clientGroup: 'Premier Foods / Blue Ribbon',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Pretoria',
    locationAddress: 'Hermanstad, Pretoria, Gauteng, South Africa',
    gps: { latitude: -25.72, longitude: 28.16 },
    assets: [
      { id: 'brpta-351-4', assetNumber: 'DSS 351-4 / DSS 351- 4', name: 'Dale Automation Oven Circulation Framework', category: 'Baking Oven' },
      { id: 'brpta-351-5', assetNumber: 'DSS 351-5 / DSS 352-5', name: 'Oven Module and Base Plates', category: 'Baking Oven' },
    ],
  },
  {
    id: 'albany-randfontein',
    name: 'Albany Randfontein',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Randfontein',
    locationAddress: 'Aureus Industrial, Randfontein, Gauteng, South Africa',
    gps: { latitude: -26.178, longitude: 27.702 },
    assets: [
      { id: 'ar-160', assetNumber: 'DSS 160', name: 'Friction Drive Spiral System Assembly', category: 'Spiral Cooler' },
      { id: 'ar-alb004', assetNumber: 'ALB 004', name: 'Universal Oven System', category: 'Baking Oven' },
      { id: 'ar-alb004-1', assetNumber: 'ALB 004 - 1', name: 'Final Prover Assembly', category: 'Prover System' },
    ],
  },
  {
    id: 'sunbake-rustenburg',
    name: 'Sunbake Rustenburg',
    clientGroup: 'Foodcorp / Sunbake',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Rustenburg',
    locationAddress: 'Rustenburg Industrial, North West, South Africa',
    gps: { latitude: -25.667, longitude: 27.242 },
    assets: [
      { id: 'sr-188', assetNumber: 'DSS 188', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'albany-secunda',
    name: 'Albany Secunda',
    clientGroup: 'Tiger Brands / Albany',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Secunda',
    locationAddress: 'Secunda Industrial, Mpumalanga, South Africa',
    gps: { latitude: -26.516, longitude: 29.176 },
    assets: [
      { id: 'as-172', assetNumber: 'DSS 172', name: 'Double Drum Friction Spiral Cooler', category: 'Spiral Cooler' },
      { id: 'as-394-5', assetNumber: 'DSS 394-5', name: '4500 Loaf P/H Bakermation Oven Modules, Tin Return Lines & Lidders', category: 'Baking Oven' },
    ],
  },
  {
    id: 'sasko-shakaskraal',
    name: 'Sasko Shakaskraal',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Shakaskraal',
    locationAddress: 'Shakaskraal, Dolphin Coast, KwaZulu-Natal, South Africa',
    gps: { latitude: -29.43, longitude: 31.23 },
    assets: [
      { id: 'ss-256', assetNumber: 'DSS 256-2 / DSS 256-6 / DSS 256-8', name: 'Double Drum Friction Spiral Coolers & Gearboxes', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'goldi-standerton',
    name: 'Goldi Standerton',
    clientGroup: 'Astral Foods / Goldi',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Standerton',
    locationAddress: 'Standerton Industrial, Mpumalanga, South Africa',
    gps: { latitude: -26.95, longitude: 29.24 },
    assets: [
      { id: 'gs-131', assetNumber: 'DSS 131 IQF 4', name: 'Spiral Friction Freezer Framework', category: 'Spiral Freezer' },
      { id: 'gs-176', assetNumber: 'DSS 176 / IQF 5', name: 'Spiral Friction Drive Freezer & Infeed Framework', category: 'Spiral Freezer' },
      { id: 'gs-185-6', assetNumber: 'DSS 185 IQF 6 / IQF 6', name: 'Spiral Friction Freezer Systems', category: 'Spiral Freezer' },
      { id: 'gs-185-7', assetNumber: 'DSS 185 IQF 7 / IQF 7', name: 'Spiral Friction Freezer Systems', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'sasko-worcester',
    name: 'Sasko Worcester',
    clientGroup: 'Sasko / Pioneer Foods',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Worcester',
    locationAddress: 'Worcester Industrial, Western Cape, South Africa',
    gps: { latitude: -33.646, longitude: 19.445 },
    assets: [
      { id: 'swor-112', assetNumber: 'DSS 112', name: 'Double Drum Spiral Cooler Friction System & Gearboxes', category: 'Spiral Cooler' },
    ],
  },
  // Other Unique South African Facilities
  {
    id: 'other-sa-facilities',
    name: 'Specialist Food & Poultry Plants (SA Regional)',
    clientGroup: 'Regional Poultry & Meat Processors',
    country: 'South Africa',
    countryFlag: '🇿🇦',
    region: 'Other Unique SA Facilities',
    locationAddress: 'Various Regional Facilities, South Africa',
    assets: [
      { id: 'osa-bluff', assetNumber: 'DSS 369-9', name: 'Bluff Meats – Pozi Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-bush215', assetNumber: 'DSS 215 / 217', name: 'Bushvalley – Pozi Drive Spiral Freezer & Freezer Unit', category: 'Spiral Freezer' },
      { id: 'osa-caterchain', assetNumber: 'DSS 365-9', name: 'Cater Chain Food Services – Dale Freezermation System', category: 'Spiral Freezer' },
      { id: 'osa-ccchick', assetNumber: 'DSS 337-9', name: 'CC Chickens – Pozi/Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-chickos', assetNumber: 'Chickos Chicken', name: 'Spiral Freezer Double Drum', category: 'Spiral Freezer' },
      { id: 'osa-clover', assetNumber: 'DSS 366-25', name: 'Clover – 4 Ton Carton Chiller System', category: 'Carton Chiller' },
      { id: 'osa-countyfair', assetNumber: 'County Fair Gyro 1-7 / Jackstone 5 & 6', name: 'County Fair – Friction Drive Freezer Spirals', category: 'Spiral Freezer' },
      { id: 'osa-davies', assetNumber: 'DSS 395-4-Final Prover', name: 'Davies Bakery – Prover Assembly', category: 'Prover System' },
      { id: 'osa-eagles', assetNumber: 'Eagles Valley Poultry Gyro', name: 'Eagles Valley Poultry – Chain Drive Friction System', category: 'Spiral Freezer' },
      { id: 'osa-fambrands', assetNumber: 'MNF-EQ-0322', name: 'Famous Brands Supply Chain – Eurotek Spiral', category: 'Spiral Freezer' },
      { id: 'osa-finlar', assetNumber: 'TSTechniek Line 1 & Line 2', name: 'Finlar Fine Foods – Friction Drive Spiral Freezers', category: 'Spiral Freezer' },
      { id: 'osa-fryfamily', assetNumber: 'DSS 364-9', name: 'Fry Family Food – Dale Freezermation Edge Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-grainfields', assetNumber: 'DSS 258 / HEINEN 1', name: 'Grainfields Chicken – Friction Freezer Sputnik Systems', category: 'Spiral Freezer' },
      { id: 'osa-henwill', assetNumber: 'DSS 162 / Unknown', name: 'Henwill Chickens – Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-ivconveyor', assetNumber: 'IV convayer 1', name: 'IV Conveyor Site – Main Line Conveyor', category: 'Conveyor & Handling' },
      { id: 'osa-kingpie', assetNumber: 'DSS 192', name: 'King Pie – Friction Drive Spiral Freezer Rebuild', category: 'Spiral Freezer' },
      { id: 'osa-megachicks', assetNumber: 'Mega chicks', name: 'Mega Chicks – Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-namibp', assetNumber: 'DSS -241', name: 'Namib Poultry – Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-rainbow', assetNumber: 'DSS 136', name: 'Rainbow Chickens Wolwehoek – Center Bearings & Freezer', category: 'Spiral Freezer' },
      { id: 'osa-rfg', assetNumber: 'DSS-378-10', name: 'RFG Foods (Pty) Ltd – Dale Automation Asset', category: 'Bakery Automation' },
      { id: 'osa-riversmead', assetNumber: 'Spiral freezer 1.5 ton', name: 'Riversmead Poultry – Spiral Freezer 1.5 Ton', category: 'Spiral Freezer' },
      { id: 'osa-sunbakeb', assetNumber: 'DSS 226 / DSS 385-5', name: 'Sunbake Boerstra – Universal Oven Chain Rails & Pusher Systems', category: 'Baking Oven' },
      { id: 'osa-sunrise', assetNumber: 'DSS 387-9', name: 'Sunrise Chickens – Pozi/Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
      { id: 'osa-supbotsh', assetNumber: 'DSS 212', name: 'Supreme Botshabelo – Pozi Drive Spiral Freezer Clutch Assembly', category: 'Spiral Freezer' },
      { id: 'osa-suptigane', assetNumber: 'Supreme Tigane', name: 'Jack Stone Friction Drive Spiral Freezer', category: 'Spiral Freezer' },
    ],
  },

  // ==========================================
  // 🇦🇺 AUSTRALIA
  // ==========================================
  {
    id: 'davies-bakery-melbourne',
    name: 'Davies Bakery Melbourne',
    clientGroup: 'Davies Bakery Australia',
    country: 'Australia',
    countryFlag: '🇦🇺',
    region: 'Melbourne, Victoria',
    locationAddress: 'Melbourne, Victoria, Australia',
    gps: { latitude: -37.8136, longitude: 144.9631 },
    assets: [
      { id: 'dbm-395-24', assetNumber: '395 -24_A / 395 - 24_B / DSS 395-24', name: '340 High Speed Mixermation Dual Systems & Valve Banks', category: 'Industrial Mixer' },
      { id: 'dbm-395-5', assetNumber: 'DSS 395-5', name: 'Wide Slat Oven Module, Extraction Assemblies, Base Frames & Loader/Unloaders', category: 'Baking Oven' },
      { id: 'dbm-395-30', assetNumber: '395-30 / DSS 395-29', name: 'MCC Ducting / Dough Conveyors / External Gantry Framework', category: 'Conveyor & Handling' },
    ],
  },
  {
    id: 'bovells-mias-perth',
    name: "Bovell's Bakery / Mia's Bakery",
    clientGroup: "Bovell's / Mia's Bakery",
    country: 'Australia',
    countryFlag: '🇦🇺',
    region: 'Perth / Dandenong / Maddington',
    locationAddress: 'Maddington, Perth, Western Australia',
    gps: { latitude: -32.05, longitude: 115.98 },
    assets: [
      { id: 'bov-393-4', assetNumber: 'DSS 393-4', name: 'Dale Bakermation Prover Unloader Site System', category: 'Prover System' },
      { id: 'bov-393-5', assetNumber: 'DSS 393-5', name: 'Dale Bakermation Oven Modules, Roof Assemblies, Slat Systems & Feed Terminals', category: 'Baking Oven' },
    ],
  },
  {
    id: 'tip-top-canning-vale',
    name: 'Tip Top Bakery / Canning Vale',
    clientGroup: 'George Weston Foods / Tip Top',
    country: 'Australia',
    countryFlag: '🇦🇺',
    region: 'Perth / Canning Vale',
    locationAddress: 'Canning Vale, Perth, Western Australia',
    gps: { latitude: -32.072, longitude: 115.918 },
    assets: [
      { id: 'tt-389-1', assetNumber: 'DSS 389-1', name: 'Instore Pan & Prover Loop Conveyor Lines', category: 'Conveyor & Handling' },
      { id: 'tt-389-2', assetNumber: 'DSS 389-2', name: 'Pan Store Servo Motor VSD Overhauls', category: 'Storage & Pan Handling' },
      { id: 'tt-389-7', assetNumber: '389-7 Tip Top Perth', name: 'Robot System Batch Placements', category: 'Robotics & Automation' },
      { id: 'tt-389-4', assetNumber: 'DSS 389-4', name: 'Prover Sprocket Posts, Cat Ladders, Dual Pressure Reducing Stations & Lubricators', category: 'Prover System' },
      { id: 'tt-389-5', assetNumber: 'DSS 389-5', name: 'Bakermation 2024 Oven Slat Plates, Burner Brackets, Swing Cranes & Damper Control Tubes', category: 'Baking Oven' },
      { id: 'tt-389-9', assetNumber: 'DSS 389-9', name: 'Canning Vale Bun Cooler Down-Drum, Sputnik Legs, Up-Drum Crossovers & Mezz Floors', category: 'Spiral Cooler' },
      { id: 'tt-389-24', assetNumber: 'DSS 389-24-Mixer Refurbishment / DSS 393-24', name: '340 Mixermation Tilt Frames, Weigh Frames, High-Tip Carriages & Drive Hubs', category: 'Industrial Mixer' },
      { id: 'tt-203', assetNumber: 'DSS 203', name: 'Ambient Bun Cooler Down-Drum System', category: 'Spiral Cooler' },
    ],
  },
  {
    id: 'goodman-fielder-perth',
    name: 'Goodman Fielder',
    clientGroup: 'Goodman Fielder Australia',
    country: 'Australia',
    countryFlag: '🇦🇺',
    region: 'Perth / Dandenong / Maddington',
    locationAddress: 'Perth, Western Australia',
    gps: { latitude: -31.95, longitude: 115.86 },
    assets: [
      { id: 'gf-367-9', assetNumber: 'DSS 367-9', name: 'Double Drum Friction Spiral Cooler Maintenance & Mold Prevention', category: 'Spiral Cooler' },
    ],
  },

  // ==========================================
  // 🇿🇲 ZAMBIA
  // ==========================================
  {
    id: 'ross-breeders-zambia',
    name: 'Ross Breeders / Supreme Chickens Zambia',
    clientGroup: 'Ross Breeders / Supreme Chickens',
    country: 'Zambia',
    countryFlag: '🇿🇲',
    region: 'Lusaka / Regional Sites',
    locationAddress: 'Lusaka Region, Zambia',
    gps: { latitude: -15.3875, longitude: 28.3228 },
    assets: [
      { id: 'rbz-356-9', assetNumber: 'DSS 356-9', name: 'Pozi Drive Spiral Freezer Belts, Inner/Outer Links, Legs & Curtains', category: 'Spiral Freezer' },
    ],
  },
  {
    id: 'hybrid-poultry-zambia',
    name: 'Hybrid Poultry',
    clientGroup: 'Hybrid Poultry Farm Zambia',
    country: 'Zambia',
    countryFlag: '🇿🇲',
    region: 'Lusaka / Regional Sites',
    locationAddress: 'Chamba Valley, Lusaka, Zambia',
    gps: { latitude: -15.35, longitude: 28.38 },
    assets: [
      { id: 'hpz-upgrade', assetNumber: 'Hybrid Poultry', name: 'Friction Gearbox & Drum Wear-Strip System Upgrades', category: 'Spiral Freezer' },
    ],
  },

  // ==========================================
  // 🇿🇼 ZIMBABWE
  // ==========================================
  {
    id: 'proton-bakers-marondera',
    name: 'Proton Bakers / Proton Marondera',
    clientGroup: 'Proton Bakers Zimbabwe',
    country: 'Zimbabwe',
    countryFlag: '🇿🇼',
    region: 'Marondera',
    locationAddress: 'Marondera Industrial, Mashonaland East, Zimbabwe',
    gps: { latitude: -18.1856, longitude: 31.5492 },
    assets: [
      { id: 'pb-391-1', assetNumber: 'DSS 391-1', name: 'Prover Loop Systems', category: 'Prover System' },
      { id: 'pb-391-2', assetNumber: 'DSS 391-2', name: 'Manual Floor Tracks / Pan Store Commissioning', category: 'Storage & Pan Handling' },
      { id: 'pb-391-4', assetNumber: 'DSS 391-4 / DSS 410-4', name: 'Prover Systems & Loader Sensors', category: 'Prover System' },
      { id: 'pb-391-5', assetNumber: 'DSS 391-5 / DSS 410-5', name: 'Oven Loader/Unloader Drive Modules & Panels', category: 'Baking Oven' },
      { id: 'pb-391-6', assetNumber: 'DSS 391-6', name: 'Lid Line Conveyor Transfers', category: 'Conveyor & Handling' },
      { id: 'pb-391-15', assetNumber: 'DSS 391-15', name: 'Inline Depanner Systems', category: 'Packaging & Handling' },
      { id: 'pb-391-18', assetNumber: 'DSS 391-18', name: 'Pan Line Tin Feed / Return & Lidders', category: 'Packaging & Handling' },
      { id: 'pb-399-24', assetNumber: 'DSS 399-24', name: 'Mixer Vibrajets, Rotary Unions & Bowl Seals Assembly', category: 'Industrial Mixer' },
    ],
  },

  // ==========================================
  // 🇳🇦 NAMIBIA
  // ==========================================
  {
    id: 'namib-mills-windhoek',
    name: 'Namib Mills / BAKPRO',
    clientGroup: 'Namib Mills Group',
    country: 'Namibia',
    countryFlag: '🇳🇦',
    region: 'Windhoek / Regional Sites',
    locationAddress: 'Northern Industrial, Windhoek, Khomas, Namibia',
    gps: { latitude: -22.5609, longitude: 17.0658 },
    assets: [
      { id: 'nm-346-9', assetNumber: 'DSS 346-9', name: 'Edge Drive Spiral Cooler System', category: 'Spiral Cooler' },
      { id: 'nm-404-5', assetNumber: 'DSS 404-5 Oven', name: 'Oven Loader/Unloader Systems & Internal Ducting', category: 'Baking Oven' },
      { id: 'nm-404-24', assetNumber: 'DSS 404-24', name: 'Mixer H-Frames, HDPE Water Hoppers & Mainframe Skeleton Assemblies', category: 'Industrial Mixer' },
    ],
  },
];

// Helper: All facilities
export const getAllFacilities = (): ClientFacility[] => SITE_CATALOG;

// Helper: Flattened list of all individual equipment assets with facility info
export interface FlattenedSiteEquipment {
  uniqueKey: string;
  facilityId: string;
  facilityName: string;
  clientGroup: string;
  country: string;
  countryFlag: string;
  region: string;
  locationAddress: string;
  gps?: { latitude: number; longitude: number };
  assetId: string;
  assetNumber: string;
  assetName: string;
  category: string;
  fullLabel: string;
}

export const getAllFlattenedEquipment = (): FlattenedSiteEquipment[] => {
  const result: FlattenedSiteEquipment[] = [];
  SITE_CATALOG.forEach((fac) => {
    fac.assets.forEach((asset) => {
      result.push({
        uniqueKey: `${fac.id}__${asset.id}`,
        facilityId: fac.id,
        facilityName: fac.name,
        clientGroup: fac.clientGroup,
        country: fac.country,
        countryFlag: fac.countryFlag,
        region: fac.region,
        locationAddress: fac.locationAddress,
        gps: fac.gps,
        assetId: asset.id,
        assetNumber: asset.assetNumber,
        assetName: asset.name,
        category: asset.category,
        fullLabel: `${fac.countryFlag} ${fac.name} — ${asset.assetNumber} (${asset.name})`,
      });
    });
  });
  return result;
};

// Search across facility names, asset numbers, regions, categories
export const searchSiteCatalog = (query: string): FlattenedSiteEquipment[] => {
  const q = query.toLowerCase().trim();
  const all = getAllFlattenedEquipment();
  if (!q) return all;
  return all.filter((item) => {
    return (
      item.facilityName.toLowerCase().includes(q) ||
      item.assetNumber.toLowerCase().includes(q) ||
      item.assetName.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.clientGroup.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
};
