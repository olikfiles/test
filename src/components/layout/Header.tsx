'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { getCartTotal, toggleDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const total = getCartTotal();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/deals', label: 'Deals' },
    { href: '/story', label: 'Our Story' },
    { href: '/reserve', label: 'Reservation' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100'
          : 'bg-transparent border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex-1">
            {/* <Link href="/" className="font-display font-bold text-2xl tracking-widest uppercase">
              SYÖ & JUO
            </Link> */}
          </div>

          {/* Desktop Nav - Centered Frosted Pill */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center gap-8 bg-gray-100/40 backdrop-blur-md border border-gray-200/50 px-8 py-3 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase shadow-sm">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-primary transition-colors text-foreground/80 hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-4 flex-1">
            <button
              onClick={toggleDrawer}
              className="flex items-center gap-4 cursor-pointer group"
              aria-label="Cart"
            >
              {mounted && (
                <div className="hidden md:block text-sm font-medium group-hover:text-primary transition-colors">
                  €{total.toFixed(2)}
                </div>
              )}
              <div className="relative">
                <ShoppingBag className="w-6 h-6 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2" aria-label="Menu">
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="px-5 h-[64px] flex items-center justify-between border-b border-border/40 mt-6">
              <span className="font-display font-bold text-xl tracking-tight">SYÖ & JUO</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 bg-accent rounded-full">
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center items-center gap-8 pb-16">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-3xl font-display font-bold text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
