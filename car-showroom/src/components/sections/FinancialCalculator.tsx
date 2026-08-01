import React, { useState } from 'react';
import { MERCEDES_FLEET } from '../../data/content';
import { Calculator, DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react';

export const FinancialCalculatorSection: React.FC = () => {
  // Financing State
  const [selectedCarId, setSelectedCarId] = useState<string>('amg-gt-black-series');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(5.9);
  const [financeMode, setFinanceMode] = useState<'loan' | 'lease'>('lease');

  // Trade-In State
  const [tradeYear, setTradeYear] = useState<string>('2022');
  const [tradeMake, setTradeMake] = useState<string>('Porsche');
  const [tradeModel, setTradeModel] = useState<string>('911 Carrera S');
  const [tradeMileage, setTradeMileage] = useState<string>('24000');
  const [tradeCondition, setTradeCondition] = useState<string>('excellent');
  const [tradeResult, setTradeResult] = useState<any | null>(null);
  const [isTradeLoading, setIsTradeLoading] = useState<boolean>(false);

  const selectedCar = MERCEDES_FLEET.find(c => c.id === selectedCarId) || MERCEDES_FLEET[1];

  // Calculation Math
  const msrp = selectedCar.basePriceRaw;
  const downPayment = (msrp * downPaymentPercent) / 100;
  const tradeCredit = tradeResult ? tradeResult.equityCredit : 0;
  const netLoanAmount = Math.max(0, msrp - downPayment - tradeCredit);

  let monthlyPayment = 0;
  if (financeMode === 'loan') {
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate > 0) {
      monthlyPayment = Math.round((netLoanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)));
    } else {
      monthlyPayment = Math.round(netLoanAmount / termMonths);
    }
  } else {
    // Lease calculation estimate (residual value ~55%)
    const residualValue = msrp * 0.55;
    const depreciationFee = (netLoanAmount - residualValue) / termMonths;
    const moneyFactor = interestRate / 2400;
    const financeFee = (netLoanAmount + residualValue) * moneyFactor;
    monthlyPayment = Math.max(800, Math.round(depreciationFee + financeFee));
  }

  const handleCalculateTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTradeLoading(true);

    try {
      let response;
      try {
        response = await fetch('/api/trade-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: tradeYear,
            make: tradeMake,
            model: tradeModel,
            mileage: tradeMileage,
            condition: tradeCondition,
            originalMSRP: 140000
          }),
        });
        if (!response.ok) throw new Error();
      } catch (e) {
        response = await fetch('http://localhost:5000/api/trade-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: tradeYear,
            make: tradeMake,
            model: tradeModel,
            mileage: tradeMileage,
            condition: tradeCondition,
            originalMSRP: 140000
          }),
        });
      }
      const data = await response.json();
      if (data.success) {
        setTradeResult(data.data);
      }
    } catch (err) {
      // Offline calculation fallback
      const estVal = Math.round(140000 * Math.pow(0.85, 2026 - parseInt(tradeYear)) * 0.9);
      setTradeResult({
        estimatedValue: estVal,
        equityCredit: Math.round(estVal * 0.95),
        tradeInAllowanceBonus: 2500,
        details: { year: tradeYear, make: tradeMake, model: tradeModel }
      });
    } finally {
      setIsTradeLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-4">
          <Calculator className="w-3.5 h-3.5" />
          <span>Franchise Financial Studio</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
          LEASE, LOAN & <span className="text-emerald-400">TRADE-IN</span> CALCULATOR
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base">
          Customize structured payment terms, down payments, and instant trade-in appraisal equity toward your next AMG flagship.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial Loan / Lease Studio */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Structured Financing Estimator</span>
            </h3>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFinanceMode('lease')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  financeMode === 'lease' ? 'bg-emerald-400 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Lease
              </button>
              <button
                onClick={() => setFinanceMode('loan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  financeMode === 'loan' ? 'bg-emerald-400 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Loan Purchase
              </button>
            </div>
          </div>

          {/* Target Car Select */}
          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Select Vehicle Allocation
            </label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
            >
              {MERCEDES_FLEET.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} — {car.price}
                </option>
              ))}
            </select>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-neutral-400">Down Payment ({downPaymentPercent}%)</span>
              <span className="text-emerald-400 font-bold">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Term Months */}
          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Term Length (Months)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[24, 36, 48, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setTermMonths(m)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition ${
                    termMonths === m
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {m} Mos
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-neutral-400">Estimated APR Interest Rate</span>
              <span className="text-emerald-400 font-bold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="1.9"
              max="12.9"
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Calculation Breakdown Card */}
          <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-neutral-500 uppercase">Estimated Monthly Payment ({financeMode})</span>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-400">
                ${monthlyPayment.toLocaleString()} <span className="text-xs font-mono text-neutral-400">/ mo</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Excludes local luxury taxes and dealer destination fee.</p>
            </div>
            <button className="w-full sm:w-auto px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition">
              Apply For Franchise Credit
            </button>
          </div>
        </div>

        {/* Right: Vehicle Trade-In Valuation Evaluator */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-4">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <span>Instant Trade-In Valuation</span>
          </h3>

          <form onSubmit={handleCalculateTradeIn} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Year</label>
                <input
                  type="number"
                  value={tradeYear}
                  onChange={(e) => setTradeYear(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Make</label>
                <input
                  type="text"
                  value={tradeMake}
                  onChange={(e) => setTradeMake(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Model Trim</label>
              <input
                type="text"
                value={tradeModel}
                onChange={(e) => setTradeModel(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Mileage</label>
                <input
                  type="number"
                  value={tradeMileage}
                  onChange={(e) => setTradeMileage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Condition</label>
                <select
                  value={tradeCondition}
                  onChange={(e) => setTradeCondition(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isTradeLoading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition"
            >
              {isTradeLoading ? 'Calculating Valuation...' : 'Get Instant Trade-In Quote'}
            </button>
          </form>

          {/* Trade-In Results Display */}
          {tradeResult && (
            <div className="bg-neutral-950 rounded-2xl border border-cyan-500/30 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Estimated Market Value</span>
                <span className="text-white font-mono font-bold">${tradeResult.estimatedValue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Trade-In Credit Towards AMG</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">${tradeResult.equityCredit?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Quote guaranteed for 7 days with free VIP enclosed transport pick up.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
