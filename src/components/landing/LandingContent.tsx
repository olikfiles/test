'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { useOrderStore, OrderMode } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

/* ─── Data ─── */
const signatures = [
  {
    id: 's1',
    name: 'Nordic Margherita',
    description: 'Heritage tomatoes, fresh basil, burnt mozzarella.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 's2',
    name: 'Truffle Forager',
    description: 'Wild mushrooms, black truffle, confit garlic base.',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 's3',
    name: 'Artisan Charcuterie',
    description: 'Cured meats, local cheeses, house-made focaccia.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop',
  },
];

const testimonials = [
  {
    quote: "A masterclass in restraint and flavor. The at-home experience redefines luxury delivery.",
    author: "Elena R.",
    source: "Helsinki Culinary Review",
  },
  {
    quote: "Impeccable from start to finish. Every detail, from the packaging to the garnish, is perfectly considered.",
    author: "Marcus T.",
    source: "Michelin Guide Explorer",
  },
  {
    quote: "The only restaurant that manages to capture the essence of fine dining in a takeaway format.",
    author: "Sophia K.",
    source: "Nordic Lifestyle Magazine",
  }
];

const heroImages = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2000&auto=format&fit=crop',
];

/* ─── Main Component ─── */
export function LandingContent() {
  const router = useRouter();
  const { orderMode, setOrderMode, address, setAddress, restaurantLocation, setRestaurantLocation } = useOrderStore();
  const { addItem } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Set default date to today and time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    
    // Format YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
    
    // Format HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);

    // Testimonial Rotation
    const testimonialInterval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    // Hero Image Rotation
    const heroInterval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(heroInterval);
    };
  }, []);

  const handleStartOrder = () => {
    if (orderMode === 'dine-in') {
      router.push('/reserve');
    } else {
      router.push('/menu');
    }
  };

  const handleOptimisticAdd = (item: any) => {
    addItem({
      id: `${item.id}-${Date.now()}`,
      baseId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ═══════════════════════════════════════════════════════
          HERO — Split-Screen
         ═══════════════════════════════════════════════════════ */}
      <section className="min-h-screen pt-24 flex flex-col lg:flex-row relative">
        
        {/* Ambient Effervescence Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
          {mounted && (
            <>
              {/* Layer 1: Ambient Slow Orbs */}
              <motion.div 
                className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"
                animate={{ 
                  x: [0, 100, 0], 
                  y: [0, 50, 0] 
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-slate-300/20 rounded-full blur-[100px]"
                animate={{ 
                  x: [0, -80, 0], 
                  y: [0, -60, 0] 
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />

              {/* Layer 2: Champagne Bubbles */}
              {[...Array(15)].map((_, i) => {
                const size = Math.random() * 20 + 5;
                const startX = Math.random() * window.innerWidth;
                const duration = Math.random() * 15 + 10;
                
                return (
                  <motion.div
                    key={`bubble-${i}`}
                    className="absolute border border-primary/20 rounded-full bg-transparent"
                    style={{
                      width: size + 'px',
                      height: size + 'px',
                    }}
                    initial={{ 
                      x: startX, 
                      y: window.innerHeight + 100, 
                      opacity: 0 
                    }}
                    animate={{ 
                      y: -100, 
                      opacity: [0, 1, 1, 0],
                      x: [startX, startX + (Math.random() * 100 - 50)]
                    }}
                    transition={{ 
                      duration: duration, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: Math.random() * 15 
                    }}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-20 py-20 lg:py-0 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-display mb-12 text-foreground"
          >
            Exceptional<br />Taste.<br />Your Way.
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-md w-full bg-white/50 backdrop-blur-sm p-2 rounded-3xl"
          >
            {/* Order Mode Toggle - Apple Glassmorphism Style */}
            <div className="flex p-1.5 bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] mb-8 relative">
              {(['dine-in', 'pickup', 'delivery'] as OrderMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  className={`flex-1 py-3.5 text-sm font-semibold rounded-[1.75rem] capitalize transition-all duration-500 ease-out ${
                    orderMode === mode
                      ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-foreground scale-100 ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-foreground scale-[0.98] hover:bg-white/30'
                  }`}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Dynamic Input */}
            <div className="relative mb-8 h-[60px] px-2">
              <AnimatePresence mode="wait">
                {orderMode === 'delivery' && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 px-2"
                  >
                    <input 
                      type="text" 
                      placeholder="Enter your delivery address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg placeholder-gray-400 transition-colors"
                    />
                    <button onClick={handleStartOrder} className="absolute right-2 top-0 text-primary font-medium hover:text-primary/80 transition-colors">
                      Search
                    </button>
                  </motion.div>
                )}
                {orderMode === 'pickup' && (
                  <motion.div
                    key="pickup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 px-2"
                  >
                    <select 
                      value={restaurantLocation || ""}
                      onChange={(e) => setRestaurantLocation(e.target.value)}
                      className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg text-foreground transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Select a store location...</option>
                      <option value="helsinki">Helsinki Central - Pohjoisesplanadi 27</option>
                      <option value="espoo">Espoo - Iso Omena</option>
                    </select>
                  </motion.div>
                )}
                {orderMode === 'dine-in' && (
                  <motion.div
                    key="dine-in"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex gap-4 px-2"
                  >
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-1/2 pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg text-foreground transition-colors cursor-pointer"
                    />
                    <input 
                      type="time" 
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-1/2 pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg text-foreground transition-colors cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={handleStartOrder} className="px-2 inline-flex items-center gap-2 text-lg font-medium group text-foreground">
              {orderMode === 'dine-in' ? 'Reserve a Table' : 'Explore the Menu'}
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto relative bg-gray-100 overflow-hidden">
          <AnimatePresence>
            <motion.img 
              key={heroImageIndex}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              src={heroImages[heroImageIndex]}
              alt="Signature Dish" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CURATED SIGNATURES
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 max-w-7xl mx-auto px-6 w-full relative z-10 bg-background">
        <div className="flex justify-between items-end mb-16">
          <h2 className="font-display font-bold text-4xl text-foreground">Curated Signatures</h2>
          <Link href="/menu" className="text-sm font-medium border-b border-foreground pb-1 text-foreground hover:text-primary transition-colors">
            View Full Menu
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {signatures.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleOptimisticAdd(item)}
            >
              <div className="w-full aspect-square overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                  <p className="font-medium text-foreground">€{item.price.toFixed(2)}</p>
                </div>
                <button
                  className="shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EDITORIAL SPOTLIGHT (TESTIMONIALS)
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white border-y border-gray-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <p className="font-display font-bold text-2xl md:text-4xl text-foreground mb-8 leading-snug">
                &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
              </p>
              <div className="w-12 h-[1px] bg-primary mb-6" />
              <p className="text-xs tracking-[0.2em] font-bold uppercase text-foreground mb-1">
                {testimonials[testimonialIndex].author}
              </p>
              <p className="text-xs text-gray-500 tracking-wider">
                {testimonials[testimonialIndex].source}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === testimonialIndex ? 'bg-primary w-4' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AT HOME EDITORIAL
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-accent overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Asymmetrical Images */}
          <div className="relative h-[600px] w-full">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute left-0 top-0 w-2/3 h-2/3 bg-gray-200 z-10"
            >
               <img src="https://images.unsplash.com/photo-1580959375944-abd7e991f971?q=80&w=800&auto=format&fit=crop" alt="Takeaway packaging" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gray-300 z-20 shadow-2xl"
            >
               <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" alt="Fine dining spread" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6 leading-[1.1]">
              The Restaurant,<br />Transported.
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-md leading-relaxed">
              Experience the pinnacle of our culinary vision from your own dining table. Curated sets, temperature-controlled packaging, and effortless perfection.
            </p>
            <Link href="/menu" className="inline-flex items-center gap-2 text-lg font-medium group text-foreground">
              View the Collection
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════════════════════ */}
      <footer className="bg-foreground text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-1">
              <h3 className="font-display text-2xl font-bold tracking-widest uppercase mb-4">SYÖ & JUO</h3>
              <p className="text-white/60 text-sm">Exceptional dining. Delivered.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-widest text-white/50 uppercase">Explore</h4>
              <ul className="space-y-4 text-white/80 text-sm font-medium">
                <li><Link href="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
                <li><Link href="/reserve" className="hover:text-primary transition-colors">Reserve</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">The Story</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-widest text-white/50 uppercase">Legal</h4>
              <ul className="space-y-4 text-white/80 text-sm font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
