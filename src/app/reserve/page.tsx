'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ReservePage() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    date: defaultDate,
    time: defaultTime,
    occasion: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: sbError } = await supabase.from('reservations').insert([
      {
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: form.phone,
        party_size: parseInt(form.guests),
        date: form.date,
        time: form.time,
        occasion: form.occasion,
        notes: form.notes,
        status: 'pending'
      }
    ]);

    if (sbError) {
      setError('Failed to submit reservation. Please try again.');
      console.error(sbError);
    } else {
      setSubmitted(true);
    }
  };

  const inputClass =
    'w-full bg-transparent border-b border-gray-200 focus:border-foreground outline-none py-3 text-base placeholder-gray-400 transition-colors';
  const labelClass = 'block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1';

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

        {/* LEFT — Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground mb-6">Reservations</p>
          <h1 className="font-display font-bold text-5xl lg:text-6xl text-foreground leading-[1.05] pb-2 mb-8">
            Secure your<br />table.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md">
            Dining at SYÖ & JUO is an intimate experience. We seat a limited number of guests each evening to ensure every detail is perfectly considered.
          </p>

          <div className="space-y-8 border-t border-gray-100 pt-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Address</p>
              <a href="https://maps.google.com/?q=Pohjoisesplanadi+27,+Helsinki" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">
                Pohjoisesplanadi 27, 00100 Helsinki
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Dinner Service</p>
              <p className="text-foreground font-medium">Mon–Thu · 17:00 – 22:00</p>
              <p className="text-foreground font-medium">Fri–Sat · 16:00 – 23:30</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Enquiries</p>
              <a href="mailto:reservations@syojuo.fi" className="text-foreground font-medium hover:text-primary transition-colors block">
                reservations@syojuo.fi
              </a>
              <a href="tel:+358401234567" className="text-foreground font-medium hover:text-primary transition-colors block mt-1">
                +358 40 123 4567
              </a>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-accent rounded-3xl p-12 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
              <h2 className="font-display font-bold text-3xl mb-4 pb-1">Reservation Requested</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We'll confirm your table at <strong>{form.date}</strong> at <strong>{form.time}</strong> for <strong>{form.guests} guests</strong> within two hours via email.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to Home
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className={labelClass}>Full Name</label>
                  <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Aino Virtanen" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email Address</label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="aino@example.com" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+358 40 000 0000" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="guests" className={labelClass}>Number of Guests</label>
                  <select id="guests" name="guests" value={form.guests} onChange={handleChange} className={inputClass + ' appearance-none cursor-pointer'}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={String(n)}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                    <option value="large">9+ (Group Enquiry)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date" className={labelClass}>Preferred Date</label>
                  <input id="date" name="date" type="date" required value={form.date} onChange={handleChange} className={inputClass + ' cursor-pointer'} />
                </div>
                <div>
                  <label htmlFor="time" className={labelClass}>Preferred Time</label>
                  <input id="time" name="time" type="time" required value={form.time} onChange={handleChange} className={inputClass + ' cursor-pointer'} />
                </div>
              </div>
              <div>
                <label htmlFor="occasion" className={labelClass}>Special Occasion (Optional)</label>
                <select id="occasion" name="occasion" value={form.occasion} onChange={handleChange} className={inputClass + ' appearance-none cursor-pointer'}>
                  <option value="">None</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="proposal">Proposal</option>
                  <option value="business">Business Dinner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>Dietary Needs or Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Allergies, dietary requirements, or anything we should know..."
                  className="w-full bg-transparent border-b border-gray-200 focus:border-foreground outline-none py-3 text-base placeholder-gray-400 transition-colors resize-none"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-5 bg-primary text-white font-bold text-sm tracking-wide rounded-full hover:bg-primary/90 transition-colors"
              >
                Request Reservation
              </button>
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Your table is not confirmed until you receive an email from us. For same-day requests please call us directly.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
