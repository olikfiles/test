'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, RotateCcw } from 'lucide-react';

type Step = 'email' | 'code';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus code input when step changes
  useEffect(() => {
    if (step === 'code') setTimeout(() => codeInputRef.current?.focus(), 100);
  }, [step]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to send code');
      }
      setStep('code');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      if (res.ok) {
        router.push('/hq');
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error ?? 'Invalid code');
      }
    } catch (err: any) {
      setError(err.message);
      setCode('');
      codeInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setCode('');
    setLoading(true);
    try {
      await fetch('/api/admin/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-primary/60 transition-colors text-sm';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-3xl text-white tracking-widest uppercase mb-2">
            SYÖ & JUO
          </h1>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase">Operations Portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRequestCode}
                className="space-y-6"
              >
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Sign in</p>
                  <p className="text-white/40 text-xs">Enter your admin email to receive a one-time code.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={inputClass + ' pl-10'}
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending…' : <><span>Send Code</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="code-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyCode}
                className="space-y-6"
              >
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Check your email</p>
                  <p className="text-white/40 text-xs">
                    If <span className="text-white/70">{email}</span> is a registered admin address, a 6-digit code is on its way. It expires in 10 minutes.
                  </p>
                  <p className="text-white/25 text-xs mt-1.5">
                    No email? The address may not be registered, or check your spam folder.
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                    One-time code
                  </label>
                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className={inputClass + ' text-center text-2xl tracking-[0.4em] font-mono'}
                    placeholder="000000"
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Sign In'}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); setCode(''); }}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          This portal is for authorised staff only.
        </p>
      </motion.div>
    </div>
  );
}
