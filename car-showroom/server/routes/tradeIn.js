import express from 'express';

export const tradeInRouter = express.Router();

// POST /api/trade-in - Calculate estimated vehicle trade-in valuation
tradeInRouter.post('/', (req, res) => {
  try {
    const { year, make, model, mileage, condition, originalMSRP } = req.body;

    const vehicleYear = parseInt(year) || 2021;
    const vehicleMileage = parseInt(mileage) || 30000;
    const msrp = parseFloat(originalMSRP) || 85000;

    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - vehicleYear);

    // Depreciation calculation algorithm
    let ageDepreciation = Math.pow(0.85, age); // 15% drop per year
    let mileageDepreciation = Math.max(0.6, 1 - (vehicleMileage / 200000) * 0.4);

    let conditionFactor = 1.0;
    if (condition === 'excellent') conditionFactor = 1.05;
    if (condition === 'good') conditionFactor = 0.95;
    if (condition === 'fair') conditionFactor = 0.85;

    let estimatedValue = Math.round(msrp * ageDepreciation * mileageDepreciation * conditionFactor);
    estimatedValue = Math.max(5000, estimatedValue);

    const equityCredit = Math.round(estimatedValue * 0.95);

    res.json({
      success: true,
      data: {
        estimatedValue,
        equityCredit,
        tradeInAllowanceBonus: 2500,
        guaranteedQuoteDays: 7,
        details: {
          make: make || 'Porsche',
          model: model || '911 Carrera',
          year: vehicleYear,
          condition: condition || 'excellent',
          mileage: vehicleMileage
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Trade-In valuation error', error: error.message });
  }
});
