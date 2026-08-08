import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, DollarSign, Filter, Sparkles } from 'lucide-react';

export const ExecutiveDashboardSection: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .catch(() => fetch('http://localhost:5000/api/analytics').then((res) => res.json()))
      .then((resData) => {
        if (resData && resData.success) {
          setData(resData.data);
        }
      })
      .catch(() => {
        // Mock fallback data
        setData({
          totalPipelineRevenue: 14250000,
          conversionRate: 24.8,
          totalViews: 18450,
          activeLeadsCount: 4,
          leadList: [
            { _id: '1', fullName: 'Lord Harrison Sterling', email: 'harrison@sterlingcap.com', phone: '+1 212-555-0199', carName: 'Mercedes-AMG ONE', preferredDate: '2026-08-15', status: 'VIP Confirmed' },
            { _id: '2', fullName: 'Dr. Elena Rostova', email: 'elena.r@neurodynamics.io', phone: '+1 415-555-0184', carName: 'Mercedes-AMG GT Black Series', preferredDate: '2026-08-18', status: 'Pending' },
            { _id: '3', fullName: 'Marcus Vance', email: 'marcus@vanceventures.co', phone: '+1 310-555-0142', carName: 'Mercedes-Maybach S 680 4MATIC', preferredDate: '2026-08-20', status: 'VIP Confirmed' },
            { _id: '4', fullName: 'Sophia Chen', email: 'sophia@apexcloud.org', phone: '+1 650-555-0177', carName: 'Mercedes-AMG EQS 53 4MATIC+', preferredDate: '2026-08-22', status: 'Pending' }
          ],
          modelDemand: [
            { name: 'Mercedes-AMG ONE', builds: 42, share: 35 },
            { name: 'Mercedes-AMG GT Black Series', builds: 31, share: 26 },
            { name: 'Mercedes-Maybach S 680', builds: 24, share: 20 },
            { name: 'Mercedes-AMG EQS 53', builds: 23, share: 19 }
          ]
        });
      });
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (!data) return;
    const updatedLeads = data.leadList.map((lead: any) =>
      lead._id === id ? { ...lead, status: newStatus } : lead
    );
    setData({ ...data, leadList: updatedLeads });
  };

  const filteredLeads = data?.leadList.filter((lead: any) => {
    if (filterStatus === 'all') return true;
    return lead.status.toLowerCase().includes(filterStatus.toLowerCase());
  }) || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Executive Dealership Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
          EXECUTIVE DEALER <span className="text-cyan-400">ANALYTICS & CRM</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base">
          Real-time dealership executive overview: Monitor configured revenue pipelines, VIP test drive reservations, and collector demand.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Metric 1 */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>Pipeline Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">
            ${(data?.totalPipelineRevenue / 1000000 || 14.25).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last quarter</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">
            {data?.conversionRate || 24.8}%
          </div>
          <div className="text-[11px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>High intent collector traffic</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>VIP Test Drives</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">
            {data?.activeLeadsCount || 4} <span className="text-xs text-neutral-400 font-mono">Booked</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 font-mono">
            Active track sessions
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>3D Studio Impressions</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">
            {(data?.totalViews || 18450).toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 font-mono">
            Global showroom sessions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lead CRM Table */}
        <div className="lg:col-span-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>VIP Test Drive Leads Pipeline</span>
            </h3>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              {['all', 'confirmed', 'pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider transition ${
                    filterStatus === st
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Requested Model</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-4 font-semibold text-white">
                      <div>{lead.fullName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{lead.email}</div>
                    </td>
                    <td className="py-4 text-emerald-400 font-mono font-medium">{lead.carName}</td>
                    <td className="py-4 text-neutral-400 font-mono">{lead.preferredDate}</td>
                    <td className="py-4 text-right">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`bg-neutral-950 border px-3 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none ${
                          lead.status.includes('Confirmed')
                            ? 'border-emerald-500/50 text-emerald-400'
                            : 'border-amber-500/50 text-amber-400'
                        }`}
                      >
                        <option value="VIP Confirmed">VIP Confirmed</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Demand Share */}
        <div className="lg:col-span-4 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Configurator Demand Share</span>
          </h3>

          <div className="space-y-4">
            {data?.modelDemand.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold truncate max-w-[180px]">{item.name}</span>
                  <span className="text-cyan-400 font-bold">{item.share}%</span>
                </div>
                <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
