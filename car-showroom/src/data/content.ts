export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  accent: string;
  finish: 'metallic' | 'matte' | 'gloss';
  description: string;
  price?: number;
}

export interface WheelOption {
  id: string;
  name: string;
  size: string;
  finish: string;
  price: number;
}

export interface InteriorOption {
  id: string;
  name: string;
  material: string;
  hex: string;
  price: number;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CompetitorModel {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceRaw: number;
  horsepower: number;
  zeroToSixty: number;
  topSpeed: number;
  engine: string;
  nurburgringTime?: string;
  keyAdvantage: string;
}

export interface MercedesCarModel {
  id: string;
  name: string;
  series: 'Mercedes-AMG' | 'Mercedes-EQ' | 'Mercedes-Maybach';
  tagline: string;
  badge: string;
  price: string;
  basePriceRaw: number;
  engine: string;
  horsepower: number;
  zeroToSixty: number;
  topSpeed: number;
  rangeOrEfficiency: string;
  description: string;
  bodyStyle: 'hypercar' | 'track' | 'electric' | 'roadster' | 'luxury-sedan' | 'offroad';
  image: string;
  defaultColor: string;
  soundType: 'f1-v6' | 'v8-biturbo' | 'electric-thrust' | 'v12-twin-turbo';
  soundFrequency: number;
  colors: ColorOption[];
  wheels: WheelOption[];
  interiorTrims: InteriorOption[];
  packages: PackageOption[];
  highlights: { title: string; text: string }[];
  interiorFeatures: string[];
  competitorComparison?: CompetitorModel;
}

export const CAR_BRAND = "Mercedes-Benz";
export const DEALERSHIP_NAME = "Mercedes-AMG & Maybach Flagship Platform";

export const COMPETITOR_BENCHMARKS: CompetitorModel[] = [
  {
    id: "ferrari-sf90",
    name: "Ferrari SF90 Stradale",
    brand: "Ferrari",
    price: "$524,000",
    priceRaw: 524000,
    horsepower: 986,
    zeroToSixty: 2.0,
    topSpeed: 211,
    engine: "4.0L V8 Twin-Turbo + 3 Electric Motors",
    nurburgringTime: "6:58.70",
    keyAdvantage: "PHEV Hypercar performance with Italian styling"
  },
  {
    id: "porsche-gt3rs",
    name: "Porsche 911 GT3 RS",
    brand: "Porsche",
    price: "$241,300",
    priceRaw: 241300,
    horsepower: 518,
    zeroToSixty: 3.0,
    topSpeed: 184,
    engine: "4.0L Naturally Aspirated Flat-6",
    nurburgringTime: "6:49.32",
    keyAdvantage: "Extreme aerodynamic downforce and track agility"
  },
  {
    id: "tesla-plaid",
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    price: "$89,990",
    priceRaw: 89990,
    horsepower: 1020,
    zeroToSixty: 1.99,
    topSpeed: 200,
    engine: "Tri-Motor All-Wheel Drive",
    nurburgringTime: "7:25.23",
    keyAdvantage: "Instant electric launch acceleration under $100k"
  },
  {
    id: "rolls-phantom",
    name: "Rolls-Royce Phantom VIII",
    brand: "Rolls-Royce",
    price: "$493,000",
    priceRaw: 493000,
    horsepower: 563,
    zeroToSixty: 5.1,
    topSpeed: 155,
    engine: "6.75L Twin-Turbo V12",
    nurburgringTime: "N/A (Chauffeur Focus)",
    keyAdvantage: "Ultimate bespoke luxury and whisper-quiet isolation"
  },
  {
    id: "lamborghini-revuelto",
    name: "Lamborghini Revuelto",
    brand: "Lamborghini",
    price: "$604,000",
    priceRaw: 604000,
    horsepower: 1001,
    zeroToSixty: 2.5,
    topSpeed: 217,
    engine: "6.5L Naturally Aspirated V12 Hybrid",
    nurburgringTime: "6:54.00",
    keyAdvantage: "High-revving V12 hybrid supercar emotion"
  }
];

export const MERCEDES_FLEET: MercedesCarModel[] = [
  {
    id: "amg-one",
    name: "Mercedes-AMG ONE",
    series: "Mercedes-AMG",
    tagline: "FORMULA 1 TECHNOLOGY FOR THE ROAD",
    badge: "HYPERCAR FLAGSHIP",
    price: "$2,720,000",
    basePriceRaw: 2720000,
    engine: "1.6L V6 Turbo + 4 Electric Motors",
    horsepower: 1063,
    zeroToSixty: 2.9,
    topSpeed: 218,
    rangeOrEfficiency: "E-PERFORMANCE HYBRID",
    description: "Direct technology transfer from Mercedes-AMG Petronas Formula 1 team. Features active aero wings, carbon monocoque, and an 11,000 RPM V6 engine.",
    bodyStyle: "hypercar",
    image: "/images/mercedes_amg_one.png",
    defaultColor: "#d1d5db",
    soundType: "f1-v6",
    soundFrequency: 440,
    colors: [
      { id: "amg-petronas-silver", name: "Petronas Silver & Cyan", hex: "#d1d5db", accent: "#00d2be", finish: "metallic", description: "Official F1 livery silver with cyan accents.", price: 0 },
      { id: "obsidian-black-metallic", name: "Obsidian Black Metallic", hex: "#101216", accent: "#4b5563", finish: "metallic", description: "Deep obsidian black metal flake.", price: 12500 }
    ],
    wheels: [
      { id: "f1-centerlock-forged", name: "19/20\" AMG 10-Spoke Forged Center-Lock", size: "19\" / 20\"", finish: "Matte Black Aerocover", price: 0 },
      { id: "magnesium-f1", name: "19/20\" AMG Magnesium F1 Aero", size: "19\" / 20\"", finish: "Titanium & Cyan Ring", price: 28500 }
    ],
    interiorTrims: [
      { id: "carbon-f1-dinamica", name: "F1 Monocoque Carbon & Dinamica Microfiber", material: "Carbon Fiber & Microfiber", hex: "#1e293b", price: 0 }
    ],
    packages: [
      { id: "track-telemetry-pack", name: "AMG Track Pace F1 Telemetry Suite", description: "GPS lap timing and F1 shift lights.", price: 9500 }
    ],
    highlights: [
      { title: "Formula 1 E-TURBO", text: "Electric turbo spools instantly at zero RPM." }
    ],
    interiorFeatures: ["F1-style Steering Wheel", "Carbon Monocoque Shell"]
  },
  {
    id: "amg-gt-black-series",
    name: "Mercedes-AMG GT Black Series",
    series: "Mercedes-AMG",
    tagline: "UNCOMPROMISING TRACK DOMINANCE",
    badge: "V8 BITURBO TRACK BEAST",
    price: "$325,000",
    basePriceRaw: 325000,
    engine: "4.0L V8 Biturbo Flat-Plane Crank",
    horsepower: 720,
    zeroToSixty: 3.1,
    topSpeed: 202,
    rangeOrEfficiency: "720 HP // 590 LB-FT TORQUE",
    description: "The most powerful AMG V8 series engine ever produced. Features dual-adjustable carbon rear wing.",
    bodyStyle: "track",
    image: "/images/mercedes_amg_gt.png",
    defaultColor: "#15803d",
    soundType: "v8-biturbo",
    soundFrequency: 320,
    colors: [
      { id: "green-hell-magno", name: "AMG Green Hell Magno", hex: "#15803d", accent: "#22c55e", finish: "matte", description: "Nürburgring matte green.", price: 0 },
      { id: "magma-beam-orange", name: "AMG Magma Beam", hex: "#ea580c", accent: "#f97316", finish: "gloss", description: "Launch orange.", price: 8900 }
    ],
    wheels: [
      { id: "gt-10spoke-black", name: "19/20\" AMG Forged Matte Black", size: "19\" / 20\"", finish: "Matte Black", price: 0 }
    ],
    interiorTrims: [
      { id: "black-dinamica-orange", name: "AMG DINAMICA Microfiber Orange Stitch", material: "DINAMICA", hex: "#ca8a04", price: 0 }
    ],
    packages: [
      { id: "track-package-rollbar", name: "AMG Track Package Roll Cage", description: "Titanium roll bar and 4-point harness.", price: 7800 }
    ],
    highlights: [{ title: "Flat-Plane V8", text: "Flat crankshaft yields screaming 8,000 RPM note." }],
    interiorFeatures: ["Matte Carbon Trim", "AMG Track Pace"]
  },
  {
    id: "amg-eqs-53",
    name: "Mercedes-AMG EQS 53 4MATIC+",
    series: "Mercedes-EQ",
    tagline: "LUXURY ELECTRIC AMG PERFORMANCE",
    badge: "100% ELECTRIC FLAGSHIP",
    price: "$147,500",
    basePriceRaw: 147500,
    engine: "Dual AMG Electric Motors",
    horsepower: 751,
    zeroToSixty: 3.4,
    topSpeed: 155,
    rangeOrEfficiency: "350 MILES EPA RANGE",
    description: "The first all-electric AMG production vehicle with 56-inch MBUX Hyperscreen.",
    bodyStyle: "electric",
    image: "/images/mercedes_eqs_53.png",
    defaultColor: "#101216",
    soundType: "electric-thrust",
    soundFrequency: 600,
    colors: [
      { id: "obsidian-black", name: "Obsidian Black Metallic", hex: "#101216", accent: "#4b5563", finish: "metallic", description: "Metallic black.", price: 0 }
    ],
    wheels: [{ id: "eqs-21-aero", name: "21\" AMG Multi-Spoke Aero", size: "21\"", finish: "Black / Silver", price: 0 }],
    interiorTrims: [{ id: "nappa-neva-grey", name: "Nappa Leather Neva Grey", material: "Nappa Leather", hex: "#cbd5e1", price: 0 }],
    packages: [{ id: "amg-dynamic-plus", name: "AMG DYNAMIC PLUS Package", description: "Boost to 751 HP RACE START.", price: 4000 }],
    highlights: [{ title: "56\" MBUX Hyperscreen", text: "Three seamless OLED displays." }],
    interiorFeatures: ["Hyperscreen Cockpit", "Burmester 3D Atmos"]
  },
  {
    id: "amg-sl-63",
    name: "Mercedes-AMG SL 63 Roadster",
    series: "Mercedes-AMG",
    tagline: "REBORN ICONIC LUXURY ROADSTER",
    badge: "V8 BITURBO ROADSTER",
    price: "$183,000",
    basePriceRaw: 183000,
    engine: "4.0L V8 Biturbo Engine",
    horsepower: 577,
    zeroToSixty: 3.5,
    topSpeed: 196,
    rangeOrEfficiency: "577 HP // 590 LB-FT TORQUE",
    description: "Classic Z-fold fabric soft top with 4MATIC+ all-wheel drive and handcrafted V8.",
    bodyStyle: "roadster",
    image: "/images/mercedes_sl_63.png",
    defaultColor: "#b91c1c",
    soundType: "v8-biturbo",
    soundFrequency: 300,
    colors: [{ id: "patagonia-red", name: "MANUFAKTUR Patagonia Red", hex: "#b91c1c", accent: "#ef4444", finish: "metallic", description: "Metallic red.", price: 1750 }],
    wheels: [{ id: "sl-21-multispoke", name: "21\" AMG Forged Multi-Spoke", size: "21\"", finish: "Matte Black", price: 3300 }],
    interiorTrims: [{ id: "nappa-sienna-brown", name: "Exclusive Nappa Sienna Brown", material: "Nappa Leather", hex: "#78350f", price: 0 }],
    packages: [{ id: "amg-night-package-ii", name: "AMG Night Package II", description: "Dark chrome Panamericana grille.", price: 1450 }],
    highlights: [{ title: "AIRSCARF Heating", text: "Warmed airflow blows from headrests." }],
    interiorFeatures: ["Tilt Touchscreen", "AIRSCARF System"]
  },
  {
    id: "maybach-s-680",
    name: "Mercedes-Maybach S 680 4MATIC",
    series: "Mercedes-Maybach",
    tagline: "THE PINNACLE OF AUTOMOTIVE LUXURY",
    badge: "HANDCRAFTED V12 FLAGSHIP",
    price: "$234,000",
    basePriceRaw: 234000,
    engine: "6.0L Biturbo V12 Engine",
    horsepower: 621,
    zeroToSixty: 4.4,
    topSpeed: 155,
    rangeOrEfficiency: "621 HP // 664 LB-FT TORQUE",
    description: "The ultimate expression of handcrafted luxury with two-tone finish.",
    bodyStyle: "luxury-sedan",
    image: "/images/mercedes_maybach_s680.png",
    defaultColor: "#1e1b4b",
    soundType: "v12-twin-turbo",
    soundFrequency: 220,
    colors: [{ id: "two-tone-kalahari", name: "MANUFAKTUR Kalahari Gold & Onyx Black", hex: "#d97706", accent: "#1e293b", finish: "metallic", description: "Two-tone metallic paint.", price: 12000 }],
    wheels: [{ id: "maybach-20-monoblock", name: "20\" Maybach Forged Monoblock", size: "20\"", finish: "High-Polished Chrome", price: 0 }],
    interiorTrims: [{ id: "maybach-crystal-white", name: "Crystal White & Silver Pearl Nappa", material: "MANUFAKTUR Leather", hex: "#f8fafc", price: 0 }],
    packages: [{ id: "maybach-first-class-rear", name: "Maybach First-Class Rear Suite", description: "Refrigerated champagne flutes.", price: 10500 }],
    highlights: [{ title: "Active Road Noise Compensation", text: "Cancels road noise in 1ms." }],
    interiorFeatures: ["Refrigerated Compartment", "Reclining Rear Suite"]
  },
  {
    id: "amg-g63-squared",
    name: "Mercedes-AMG G 63 4x4²",
    series: "Mercedes-AMG",
    tagline: "EXTREME ULTRA-LUXURY OFF-ROAD ICON",
    badge: "PORTAL AXLE SUPER-SUV",
    price: "$349,000",
    basePriceRaw: 349000,
    engine: "4.0L V8 Biturbo Engine",
    horsepower: 585,
    zeroToSixty: 4.5,
    topSpeed: 130,
    rangeOrEfficiency: "585 HP // PORTAL AXLE AWD",
    description: "High-riding luxury SUV with portal axles for 13.8 inches of ground clearance.",
    bodyStyle: "offroad",
    image: "/images/mercedes_g63_squared.png",
    defaultColor: "#15803d",
    soundType: "v8-biturbo",
    soundFrequency: 350,
    colors: [{ id: "green-hell-magno-g", name: "AMG Green Hell Magno", hex: "#15803d", accent: "#22c55e", finish: "matte", description: "Matte green.", price: 0 }],
    wheels: [{ id: "g63-22-beadlock", name: "22\" AMG Beadlock Wheels", size: "22\"", finish: "Matte Black", price: 0 }],
    interiorTrims: [{ id: "g63-black-nappa-carbon", name: "Nappa Black & Carbon Fiber", material: "Nappa & Carbon", hex: "#1e293b", price: 0 }],
    packages: [{ id: "carbon-package-g", name: "AMG Carbon Exterior Package", description: "Carbon roof spoiler with LED searchlights.", price: 11500 }],
    highlights: [{ title: "Portal Axles", text: "13.8\" ground clearance." }],
    interiorFeatures: ["Carbon Steering Wheel", "Burmester 3D"]
  },
  {
    id: "amg-gt-63s-4door",
    name: "Mercedes-AMG GT 63 S E-Performance 4-Door",
    series: "Mercedes-AMG",
    tagline: "4-DOOR HYBRID SUPERCOUPE",
    badge: "843 HP HYBRID EXECUTIVE",
    price: "$194,900",
    basePriceRaw: 194900,
    engine: "4.0L V8 Biturbo + Electric Motor",
    horsepower: 843,
    zeroToSixty: 2.9,
    topSpeed: 196,
    rangeOrEfficiency: "843 HP // 1,033 LB-FT TORQUE",
    description: "Combines V8 biturbo power with Formula 1 derived battery tech.",
    bodyStyle: "track",
    image: "/images/mercedes_amg_gt.png",
    defaultColor: "#475569",
    soundType: "v8-biturbo",
    soundFrequency: 360,
    colors: [{ id: "selenite-grey-magno", name: "MANUFAKTUR Selenite Grey Magno", hex: "#475569", accent: "#94a3b8", finish: "matte", description: "Satin matte grey.", price: 3250 }],
    wheels: [{ id: "gt-21-forged", name: "21\" AMG Forged Cross-Spoke", size: "21\"", finish: "Matte Black", price: 2400 }],
    interiorTrims: [{ id: "nappa-titanium-grey", name: "AMG Nappa Titanium Grey Pearl", material: "Nappa", hex: "#64748b", price: 0 }],
    packages: [{ id: "aerodynamics-package", name: "AMG Aerodynamics Package", description: "Fixed rear wing.", price: 3850 }],
    highlights: [{ title: "843 HP Power", text: "V8 biturbo + electric motor." }],
    interiorFeatures: ["AMG Performance Seats", "MBUX Telemetry"]
  },
  {
    id: "maybach-gls-600",
    name: "Mercedes-Maybach GLS 600 4MATIC",
    series: "Mercedes-Maybach",
    tagline: "ULTRA-LUXURY SUV CAPTAIN SUITE",
    badge: "V8 BITURBO LUXURY SUV",
    price: "$174,350",
    basePriceRaw: 174350,
    engine: "4.0L V8 Biturbo with EQ Boost",
    horsepower: 550,
    zeroToSixty: 4.8,
    topSpeed: 155,
    rangeOrEfficiency: "550 HP // AIRMATIC SUSPENSION",
    description: "First-class luxury SUV featuring executive reclining seats and champagne refrigerator.",
    bodyStyle: "offroad",
    image: "/images/mercedes_maybach_s680.png",
    defaultColor: "#831843",
    soundType: "v8-biturbo",
    soundFrequency: 280,
    colors: [{ id: "rubellite-red", name: "MANUFAKTUR Rubellite Red & Obsidian Black", hex: "#831843", accent: "#1e293b", finish: "metallic", description: "Two-tone metallic.", price: 9500 }],
    wheels: [{ id: "gls-23-forged", name: "23\" Maybach Multi-Spoke Forged", size: "23\"", finish: "Polished Chrome", price: 5500 }],
    interiorTrims: [{ id: "mahogany-nappa", name: "Mahogany Brown & Open-Pore Walnut", material: "Nappa & Walnut", hex: "#451a03", price: 0 }],
    packages: [{ id: "captain-suite", name: "Rear Captain Executive Suite", description: "Folding tables & champagne flutes.", price: 6200 }],
    highlights: [{ title: "E-ACTIVE BODY CONTROL", text: "Hydraulic suspension leans into curves." }],
    interiorFeatures: ["Reclining Rear Seats", "Champagne Bar"]
  },
  {
    id: "amg-c63s-eperformance",
    name: "Mercedes-AMG C 63 S E-Performance",
    series: "Mercedes-AMG",
    tagline: "F1 HYBRID MOTORSPORT SEDAN",
    badge: "671 HP TURBO HYBRID",
    price: "$83,900",
    basePriceRaw: 83900,
    engine: "2.0L Turbo 4-Cyl + Electric Motor",
    horsepower: 671,
    zeroToSixty: 3.3,
    topSpeed: 174,
    rangeOrEfficiency: "671 HP // ELECTRIC TURBO",
    description: "Features the world's most powerful 4-cylinder engine with F1 electric turbocharger.",
    bodyStyle: "track",
    image: "/images/mercedes_amg_gt.png",
    defaultColor: "#1d4ed8",
    soundType: "f1-v6",
    soundFrequency: 410,
    colors: [{ id: "starling-blue", name: "Starling Blue Metallic", hex: "#1d4ed8", accent: "#60a5fa", finish: "metallic", description: "Brilliant blue.", price: 0 }],
    wheels: [{ id: "c63-20-forged", name: "20\" AMG Forged 10-Spoke", size: "20\"", finish: "Matte Black", price: 1800 }],
    interiorTrims: [{ id: "black-nappa-red", name: "Nappa Leather Black with Red Accents", material: "Nappa", hex: "#991b1b", price: 0 }],
    packages: [{ id: "driver-package", name: "AMG Driver's Package", description: "Top speed raised to 174 MPH.", price: 2500 }],
    highlights: [{ title: "F1 E-Turbo", text: "Electric motor spools turbo shaft." }],
    interiorFeatures: ["AMG Performance Wheel", "HUD Telemetry"]
  },
  {
    id: "amg-cla-45s",
    name: "Mercedes-AMG CLA 45 S Coupe",
    series: "Mercedes-AMG",
    tagline: "HIGH-OCTANE PERFORMANCE COUPE",
    badge: "HANDCRAFTED M139 TURBO",
    price: "$65,400",
    basePriceRaw: 65400,
    engine: "Handcrafted 2.0L AMG Turbo 4-Cyl",
    horsepower: 416,
    zeroToSixty: 4.0,
    topSpeed: 167,
    rangeOrEfficiency: "416 HP // AMG TORQUE CONTROL",
    description: "Compact performance powerhouse with Drift Mode and RACE START launch control.",
    bodyStyle: "track",
    image: "/images/mercedes_amg_gt.png",
    defaultColor: "#eab308",
    soundType: "v8-biturbo",
    soundFrequency: 380,
    colors: [{ id: "sun-yellow", name: "Sun Yellow Solid", hex: "#eab308", accent: "#fde047", finish: "gloss", description: "Bright yellow.", price: 0 }],
    wheels: [{ id: "cla-19-black", name: "19\" AMG Cross-Spoke Matte Black", size: "19\"", finish: "Matte Black", price: 950 }],
    interiorTrims: [{ id: "dinamica-yellow", name: "DINAMICA Microfiber Yellow Stitching", material: "DINAMICA", hex: "#854d0e", price: 0 }],
    packages: [{ id: "aerodynamics-plus", name: "AMG Aerodynamics Package Plus", description: "Front splitter blades.", price: 1550 }],
    highlights: [{ title: "416 HP 2.0L Engine", text: "World's highest specific output." }],
    interiorFeatures: ["Track Pace App", "Drift Mode Switch"]
  },
  {
    id: "amg-g63-edition55",
    name: "Mercedes-AMG G 63 Edition 55",
    series: "Mercedes-AMG",
    tagline: "55 YEARS OF AMG HERITAGE",
    badge: "HERITAGE V8 OFF-ROADER",
    price: "$208,000",
    basePriceRaw: 208000,
    engine: "Handcrafted 4.0L V8 Biturbo",
    horsepower: 577,
    zeroToSixty: 4.5,
    topSpeed: 149,
    rangeOrEfficiency: "577 HP // EDITION 55 FOIL",
    description: "Limited edition celebrating 55 years of AMG performance with AMG emblem decals.",
    bodyStyle: "offroad",
    image: "/images/mercedes_g63_squared.png",
    defaultColor: "#f8fafc",
    soundType: "v8-biturbo",
    soundFrequency: 340,
    colors: [{ id: "opalith-white", name: "MANUFAKTUR Opalith White Bright", hex: "#f8fafc", accent: "#e2e8f0", finish: "metallic", description: "Pearl white.", price: 4200 }],
    wheels: [{ id: "edition55-22", name: "22\" AMG Forged Matte Tantalum Grey", size: "22\"", finish: "Tantalum Grey", price: 0 }],
    interiorTrims: [{ id: "classic-red-nappa", name: "Edition 55 Nappa Leather Classic Red / Black", material: "Nappa", hex: "#b91c1c", price: 0 }],
    packages: [{ id: "night-package-magno", name: "AMG Night Package Magno", description: "Matte black bumpers & trim.", price: 3600 }],
    highlights: [{ title: "Edition 55 Badge", text: "Historic AMG emblem foil." }],
    interiorFeatures: ["Velour Floor Mats Edition 55", "AMG Steering Badge"]
  },
  {
    id: "amg-gt-coupe-2026",
    name: "Mercedes-AMG GT 63 Coupe (2026)",
    series: "Mercedes-AMG",
    tagline: "NEXT-GEN ALL-WHEEL DRIVE GRAND TOURER",
    badge: "V8 BITURBO GT FLAGSHIP",
    price: "$175,900",
    basePriceRaw: 175900,
    engine: "4.0L V8 Biturbo Engine",
    horsepower: 577,
    zeroToSixty: 3.1,
    topSpeed: 196,
    rangeOrEfficiency: "577 HP // 4MATIC+ AWD",
    description: "The second-generation AMG GT Coupe with 2+2 seating and active roll stabilization.",
    bodyStyle: "track",
    image: "/images/mercedes_amg_gt.png",
    defaultColor: "#0284c7",
    soundType: "v8-biturbo",
    soundFrequency: 350,
    colors: [{ id: "hyper-blue", name: "Hyper Blue Metallic", hex: "#0284c7", accent: "#38bdf8", finish: "metallic", description: "Ocean blue.", price: 0 }],
    wheels: [{ id: "gt-21-multispoke", name: "21\" AMG Forged 10-Spoke Gold", size: "21\"", finish: "Bronze Gold", price: 2900 }],
    interiorTrims: [{ id: "nappa-saddle-brown", name: "Exclusive Nappa Saddle Brown", material: "Nappa", hex: "#9a3412", price: 0 }],
    packages: [{ id: "active-ride-control-pkg", name: "AMG ACTIVE RIDE CONTROL Suspension", description: "Active hydraulic anti-roll.", price: 3500 }],
    highlights: [{ title: "4MATIC+ All-Wheel Drive", text: "Variable front-to-rear torque distribution." }],
    interiorFeatures: ["2+2 Seating Layout", "11.9\" MBUX Screen"]
  }
];

export const MERCEDES_FEATURES_GLOBAL = [
  {
    id: "panamericana-grille",
    title: "AMG Panamericana Grille",
    iconName: "Grid",
    category: "Design",
    description: "12 vertical chrome bars inspired by the 1952 Carrera Panamericana 300 SL race car."
  },
  {
    id: "amg-f1-turbo",
    title: "Formula 1 MGU-H E-Turbo",
    iconName: "Zap",
    category: "Powertrain",
    description: "Electric motor on the turbocharger shaft spooling turbine instantly at zero exhaust gas flow."
  },
  {
    id: "hyperscreen",
    title: "56\" MBUX Hyperscreen",
    iconName: "Tech",
    category: "Tech",
    description: "Three seamless high-resolution OLED glass displays powered by 8-CPU core AI software."
  },
  {
    id: "ceramic-brakes",
    title: "AMG Carbon-Ceramic Matrix Brakes",
    iconName: "Disc",
    category: "Safety",
    description: "Copper-colored 6-piston fixed front calipers clamping 402mm ceramic matrix brake rotors."
  }
];
