import express from 'express';
import { CarModel } from '../models/Car.js';
import { LeadModel } from '../models/Lead.js';

export const chatRouter = express.Router();

// Competitor database for deep AI Studio comparisons
const COMPETITOR_DB = {
  ferrari: {
    name: 'Ferrari SF90 Stradale',
    brand: 'Ferrari',
    price: '$524,000',
    hp: 986,
    zeroToSixty: '2.0s',
    topSpeed: '211 MPH',
    engine: '4.0L V8 Twin-Turbo + 3 Electric Motors',
    nurburgring: '6:58.70',
    maintenanceAnnual: '$3,500 - $6,000 / year',
    vsAMGOne: 'The Ferrari SF90 Stradale ($524,000, 986 HP) is a production hybrid supercar, whereas the Mercedes-AMG ONE ($2.72M, 1,063 HP) is a true Formula 1 race car for the road with an authentic 1.6L F1 engine, active DRS rear wing, and pushrod suspension.'
  },
  porsche: {
    name: 'Porsche 911 GT3 RS (992)',
    brand: 'Porsche',
    price: '$241,300',
    hp: 518,
    zeroToSixty: '3.0s',
    topSpeed: '184 MPH',
    engine: '4.0L Naturally Aspirated Flat-6',
    nurburgring: '6:49.32',
    maintenanceAnnual: '$2,200 - $4,000 / year',
    vsBlackSeries: 'The Porsche 911 GT3 RS ($241,300, 518 HP, 6:49.32 Nürburgring) focuses on aerodynamic downforce (860kg). However, the Mercedes-AMG GT Black Series ($325,000) delivers a massive 720 HP flat-plane V8 biturbo and held the Nürburgring production car record at 6:43.61.'
  },
  tesla: {
    name: 'Tesla Model S Plaid',
    brand: 'Tesla',
    price: '$89,990',
    hp: 1020,
    zeroToSixty: '1.99s',
    topSpeed: '200 MPH',
    engine: 'Tri-Motor Electric AWD',
    nurburgring: '7:25.23',
    maintenanceAnnual: '$800 - $1,500 / year',
    vsEQS: 'While Tesla Model S Plaid ($89,990, 1020 HP) excels in straight-line 0-60 acceleration (1.99s), the Mercedes-AMG EQS 53 4MATIC+ ($147,500, 751 HP) offers handcrafted luxury, 56-inch MBUX Hyperscreen, active rear-axle steering, sound insulation, and track-ready cooling stability.'
  },
  rolls: {
    name: 'Rolls-Royce Phantom VIII',
    brand: 'Rolls-Royce',
    price: '$493,000',
    hp: 563,
    zeroToSixty: '5.1s',
    topSpeed: '155 MPH',
    engine: '6.75L Twin-Turbo V12',
    nurburgring: 'N/A (Luxury Focus)',
    maintenanceAnnual: '$4,000 - $8,000 / year',
    vsMaybach: 'The Rolls-Royce Phantom ($493,000) is a timeless icon. However, the Mercedes-Maybach S 680 4MATIC ($234,000) offers equivalent twin-turbo V12 grandeur (621 HP), hand-painted MANUFAKTUR finishes, active road noise cancellation, and superior MBUX AI tech at half the price.'
  },
  lamborghini: {
    name: 'Lamborghini Revuelto',
    brand: 'Lamborghini',
    price: '$604,000',
    hp: 1001,
    zeroToSixty: '2.5s',
    topSpeed: '217 MPH',
    engine: '6.5L Naturally Aspirated V12 Hybrid',
    nurburgring: '6:54.00',
    maintenanceAnnual: '$4,500 - $7,500 / year',
    vsG63: 'Lamborghini Revuelto ($604,000, 1001 HP V12 Hybrid) is a hyper-aerodynamic wedge supercar. If you seek extreme luxury off-road presence, the Mercedes-AMG G 63 4x4² ($349,000, 585 HP V8 Biturbo) with portal axles and 13.8" ground clearance reigns supreme.'
  }
};

// AI Engine Response Generator
async function generateAIStudioResponse(userMessage, currentCarId) {
  const q = userMessage.toLowerCase().trim();

  // 1. Cross-Brand Competitor & Price Comparisons
  if (q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('ferrari') || q.includes('porsche') || q.includes('tesla') || q.includes('rolls') || q.includes('lamborghini')) {
    if (q.includes('ferrari') || q.includes('sf90') || (q.includes('amg-one') && q.includes('compare'))) {
      const c = COMPETITOR_DB.ferrari;
      return {
        reply: `### ⚔️ AI Studio Comparison: Mercedes-AMG ONE vs. ${c.name}\n\n` +
          `| Parameter | **Mercedes-AMG ONE** | **${c.name}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **MSRP Price** | **$2,720,000** | ${c.price} |\n` +
          `| **Powertrain** | 1.6L F1 V6 Turbo + 4 Motors | ${c.engine} |\n` +
          `| **Horsepower** | **1,063 HP** | 986 HP |\n` +
          `| **0-60 MPH** | 2.9s (F1 Launch) | 2.0s |\n` +
          `| **Top Speed** | **218 MPH** | 211 MPH |\n` +
          `| **Chassis** | Bare Carbon Monocoque | Aluminum Spaceframe |\n\n` +
          `**Product Analyst Insight:** ${c.vsAMGOne}`,
        action: { type: 'switch_car', targetCarId: 'amg-one', label: 'View 3D AMG ONE' }
      };
    }

    if (q.includes('porsche') || q.includes('gt3') || q.includes('911') || (q.includes('black series') && q.includes('compare'))) {
      const c = COMPETITOR_DB.porsche;
      return {
        reply: `### 🏁 AI Studio Comparison: AMG GT Black Series vs. ${c.name}\n\n` +
          `| Parameter | **AMG GT Black Series** | **${c.name}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **MSRP Price** | **$325,000** | ${c.price} |\n` +
          `| **Horsepower** | **720 HP** (V8 Flat-Plane) | 518 HP (Flat-6) |\n` +
          `| **0-60 MPH** | 3.1s | 3.0s |\n` +
          `| **Top Speed** | **202 MPH** | 184 MPH |\n` +
          `| **Nürburgring Time** | **6:43.61 (Record holder)** | 6:49.32 |\n\n` +
          `**Product Analyst Insight:** ${c.vsBlackSeries}`,
        action: { type: 'switch_car', targetCarId: 'amg-gt-black-series', label: 'View AMG GT Black Series' }
      };
    }

    if (q.includes('tesla') || q.includes('plaid') || (q.includes('eqs') && q.includes('compare'))) {
      const c = COMPETITOR_DB.tesla;
      return {
        reply: `### ⚡ AI Studio Comparison: AMG EQS 53 Electric vs. ${c.name}\n\n` +
          `| Parameter | **Mercedes-AMG EQS 53** | **${c.name}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **MSRP Price** | $147,500 | **${c.price}** |\n` +
          `| **Horsepower** | 751 HP (RACE START) | **1,020 HP** |\n` +
          `| **Interior Tech** | **56" MBUX Hyperscreen** | 17" Center Touchscreen |\n` +
          `| **Steering / Handling** | **10° Rear Axle Steering** | Standard AWD |\n` +
          `| **Build & Comfort** | Hand-stitched Nappa & Dolby Atmos | Minimalist Interior |\n\n` +
          `**Product Analyst Insight:** ${c.vsEQS}`,
        action: { type: 'switch_car', targetCarId: 'amg-eqs-53', label: 'View 3D EQS 53 Electric' }
      };
    }

    if (q.includes('rolls') || q.includes('phantom') || q.includes('maybach')) {
      const c = COMPETITOR_DB.rolls;
      return {
        reply: `### 👑 AI Studio Comparison: Mercedes-Maybach S 680 vs. ${c.name}\n\n` +
          `| Parameter | **Mercedes-Maybach S 680** | **${c.name}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **MSRP Price** | **$234,000 (Best Value)** | ${c.price} |\n` +
          `| **Engine** | **6.0L Biturbo V12 (621 HP)** | 6.75L Twin-Turbo V12 (563 HP) |\n` +
          `| **0-60 MPH** | **4.4s** | 5.1s |\n` +
          `| **Rear Cabin Tech** | First-Class Reclining Seats & MBUX | Individual Theater Seating |\n` +
          `| **Acoustics** | Active Road Noise Compensation | Silent Seal Foam Tires |\n\n` +
          `**Product Analyst Insight:** ${c.vsMaybach}`,
        action: { type: 'switch_car', targetCarId: 'maybach-s-680', label: 'View Maybach S 680' }
      };
    }
  }

  // 2. Cost, Maintenance & Financial Inquiries
  if (q.includes('maintenance') || q.includes('service') || q.includes('upkeep') || q.includes('repair')) {
    return {
      reply: `### 🔧 Annual Maintenance & Total Ownership Cost Analysis\n\n` +
        `- **Mercedes-AMG ONE**: Special F1 powertrain service required every 31,000 miles (Engine rebuild at AMG Affalterbach). Annual inspection: ~$8,500.\n` +
        `- **AMG GT Black Series**: Annual oil change, telemetry check & carbon brake inspection: **$2,400 - $3,800 / year**.\n` +
        `- **AMG EQS 53 Electric**: Low maintenance (no engine oil), brake fluid & battery coolant flush: **$600 - $1,100 / year**.\n` +
        `- **Maybach S 680 V12**: V12 spark plugs, active hydraulic suspension fluid: **$2,800 - $4,200 / year**.\n\n` +
        `*Would you like to calculate custom loan/lease financing or trade-in valuation?*`,
      action: { type: 'open_finance', label: 'Open Financial Studio' }
    };
  }

  if (q.includes('price') || q.includes('cost') || q.includes('msrp') || q.includes('how much') || q.includes('finance') || q.includes('lease')) {
    return {
      reply: `### 💵 Fleet Pricing & Finance Overview\n\n` +
        `- **Mercedes-AMG ONE**: $2,720,000 (Collector Allocation)\n` +
        `- **Mercedes-AMG G 63 4x4²**: $349,000 (Est. ~$4,200/mo lease)\n` +
        `- **Mercedes-AMG GT Black Series**: $325,000 (Est. ~$3,900/mo lease)\n` +
        `- **Mercedes-Maybach S 680 V12**: $234,000 (Est. ~$2,850/mo lease)\n` +
        `- **Mercedes-AMG SL 63 Roadster**: $183,000 (Est. ~$2,150/mo lease)\n` +
        `- **Mercedes-AMG EQS 53 Electric**: $147,500 (Est. ~$1,720/mo lease)\n\n` +
        `Use our **Financial Studio** tab to customize down payments, APR interest rates, or calculate trade-in quotes!`,
      action: { type: 'open_finance', label: 'Open Financial & Lease Calculator' }
    };
  }

  // 3. Technical Engineering / Speed Questions
  if (q.includes('fastest') || q.includes('0-60') || q.includes('acceleration') || q.includes('top speed')) {
    return {
      reply: `### 🚀 Acceleration & Top Speed Leaderboard\n\n` +
        `1. **Mercedes-AMG ONE**: 0–60 in **2.9s**, Top Speed **218 MPH** (F1 V6 Hybrid)\n` +
        `2. **Mercedes-AMG GT Black Series**: 0–60 in **3.1s**, Top Speed **202 MPH** (Flat-Plane V8)\n` +
        `3. **Mercedes-AMG EQS 53**: 0–60 in **3.4s**, Top Speed **155 MPH** (751 HP Dual Motor)\n` +
        `4. **Mercedes-AMG SL 63 Roadster**: 0–60 in **3.5s**, Top Speed **196 MPH** (577 HP V8)\n` +
        `5. **Mercedes-Maybach S 680**: 0–60 in **4.4s**, Top Speed **155 MPH** (621 HP V12)\n` +
        `6. **Mercedes-AMG G 63 4x4²**: 0–60 in **4.5s**, Top Speed **130 MPH** (Portal Axle Super-SUV)\n`,
      action: { type: 'open_compare', label: 'Open Full Comparison Matrix' }
    };
  }

  if (q.includes('f1') || q.includes('formula 1') || q.includes('turbo') || q.includes('engine')) {
    return {
      reply: `### ⚙️ Mercedes-AMG F1 Engineering Breakdown\n\n` +
        `The **Mercedes-AMG ONE** features the exact **1.6L turbocharged V6 engine with 4 electric motors** from Lewis Hamilton's championship-winning Formula 1 car:\n` +
        `- **MGU-H (Motor Generator Unit - Heat)**: 122 HP electric motor spools the turbocharger instantly at zero RPM to eliminate turbo lag.\n` +
        `- **MGU-K (Kinetic)**: 163 HP motor connected to the crankshaft for kinetic energy recovery under braking.\n` +
        `- **Front Axle Dual Electric Motors**: 326 HP providing fully variable torque vectoring.`,
      action: { type: 'switch_car', targetCarId: 'amg-one', label: 'Launch 3D AMG ONE Stage' }
    };
  }

  // 4. Default Assistant Response
  return {
    reply: `### 🤖 Mercedes-AMG & Maybach AI Studio Assistant\n\n` +
      `I am your intelligent automotive concierge. I can answer inquiries regarding:\n` +
      `- **Cross-Brand Comparisons**: Ferrari SF90, Porsche 911 GT3 RS, Tesla Plaid, Rolls-Royce Phantom.\n` +
      `- **Performance Telemetry**: 0-60 times, horsepower, Nürburgring lap times.\n` +
      `- **Pricing & Maintenance**: MSRP, lease options, annual service costs.\n` +
      `- **3D Stage Controls**: Switch vehicles or customize options in real-time.`,
    action: { type: 'open_compare', label: 'Explore Model Comparison Matrix' }
  };
}

// POST /api/chat
chatRouter.post('/', async (req, res) => {
  try {
    const { message, currentCarId, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message string required.' });
    }

    const aiResult = await generateAIStudioResponse(message, currentCarId || 'amg-one');

    // Persist chat lead interaction
    try {
      const activeSessionId = sessionId || `SESSION-${Date.now()}`;
      await LeadModel.findOneAndUpdate(
        { sessionId: activeSessionId },
        {
          $push: {
            messages: [
              { sender: 'user', text: message, timestamp: new Date() },
              { sender: 'assistant', text: aiResult.reply, timestamp: new Date() },
            ],
          },
          $set: { inquiredCarId: currentCarId },
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      // Non-blocking
    }

    res.json({
      success: true,
      data: {
        reply: aiResult.reply,
        action: aiResult.action,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI Assistant error', error: error.message });
  }
});
