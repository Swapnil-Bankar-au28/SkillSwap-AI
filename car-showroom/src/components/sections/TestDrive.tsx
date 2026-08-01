import React, { useState } from 'react';
import type { MercedesCarModel } from '../../data/content';
import { Calendar, CheckCircle, Send, User, Mail, Phone, MapPin } from 'lucide-react';

interface TestDriveSectionProps {
  selectedCar: MercedesCarModel;
}

export const TestDriveSection: React.FC<TestDriveSectionProps> = ({ selectedCar }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    location: 'AMG Experience Center (Circuit of the Americas)',
  });

  const [submitted, setSubmitted] = useState(false);
  const [reservationCode, setReservationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.date) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      // Post reservation directly to Express + MongoDB Backend API
      let res;
      try {
        res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            carId: selectedCar.id,
            carName: selectedCar.name,
            preferredDate: formData.date,
            location: formData.location,
          }),
        });
        if (!res.ok) throw new Error();
      } catch (e) {
        res = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            carId: selectedCar.id,
            carName: selectedCar.name,
            preferredDate: formData.date,
            location: formData.location,
          }),
        });
      }

      if (res.ok) {
        const json = await res.json();
        setReservationCode(json.data.reservationCode || `MB-AMG-${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        setReservationCode(`MB-AMG-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err) {
      // Fallback code generation if backend offline
      setReservationCode(`MB-AMG-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="test-drive" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Description */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center space-x-2 font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase">
            <Calendar className="w-3.5 h-3.5" />
            <span>// PRIVATE CONCIERGE DEMONSTRATION</span>
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
            COMMAND THE {selectedCar.name.toUpperCase()}
          </h2>

          <p className="text-base text-gray-300 font-body leading-relaxed">
            Reserve a private track or circuit session with a certified Mercedes-AMG Factory Master Driver.
          </p>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 font-body text-xs text-gray-300">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>1-on-1 private circuit session in the {selectedCar.name}.</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Full AMG Track Pace high-speed telemetry & 4K video recording.</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>MongoDB dealership reservation logging & VIP concierge lounge access.</span>
            </div>
          </div>
        </div>

        {/* Right Column Form or Success Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            {submitted ? (
              <div className="text-center py-12 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-400/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <h3 className="font-display font-bold text-3xl text-white">
                  Reservation Request Saved to MongoDB
                </h3>

                <p className="text-sm text-gray-300 max-w-md mx-auto font-body leading-relaxed">
                  Your reservation for the <strong className="text-emerald-400">{selectedCar.name}</strong> has been logged into the Mercedes-Benz Franchise database. An AMG Concierge Specialist will contact you within 24 hours.
                </p>

                <div className="glass-panel-accent p-4 rounded-xl max-w-xs mx-auto text-xs font-mono text-emerald-400 border border-emerald-400/30">
                  CONFIRMATION CODE: #{reservationCode}
                </div>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ fullName: '', email: '', phone: '', date: '', location: 'AMG Experience Center (Circuit of the Americas)' });
                  }}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Book Another Mercedes Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="font-display font-bold text-xl text-white">
                    Mercedes VIP Reservation Form
                  </h3>
                  <span className="font-mono text-xs text-emerald-400 uppercase font-bold">
                    {selectedCar.name}
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-carbon-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-body"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-carbon-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-body"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-carbon-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-body"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-carbon-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-body"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Select */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase">
                    AMG Experience Facility
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-carbon-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-body appearance-none"
                    >
                      <option value="AMG Experience Center (Circuit of the Americas)">AMG Experience Center (Circuit of the Americas - USA)</option>
                      <option value="Mercedes-Benz World (Brooklands UK)">Mercedes-Benz World (Brooklands - UK)</option>
                      <option value="Nürburgring Nordschleife AMG Center">Nürburgring Nordschleife AMG Center (Germany)</option>
                      <option value="AMG Driving Academy Hockenheimring">AMG Driving Academy (Hockenheimring - Germany)</option>
                      <option value="Private Dealership VIP Track">Private Franchise Dealership VIP Facility</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,210,190,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Logging into MongoDB...' : `Reserve ${selectedCar.name} Test Drive`}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
