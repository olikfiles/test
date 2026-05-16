'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  },
  {
    quote: "Dining here is a revelation. It feels like poetry translated into flavors and textures.",
    author: "Lucas M.",
    source: "Gastronomy Today",
  },
  {
    quote: "An absolute triumph. SYÖ & JUO proves that convenience and absolute luxury are not mutually exclusive.",
    author: "Isabella V.",
    source: "The Modern Epicurean",
  }
];

const heroImages = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2000&auto=format&fit=crop',
];

const galleryImages = [
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=800&auto=format&fit=crop',
];

/* ─── Main Component ─── */
export function LandingContent() {
  const router = useRouter();
  const { orderMode, setOrderMode, address, setAddress, restaurantLocation, setRestaurantLocation } = useOrderStore();
  const { addItem } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Testimonial State
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  // Hero State
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
      setSlideDirection(1);
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

  const handleNextTestimonial = () => {
    setSlideDirection(1);
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setSlideDirection(-1);
    setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════
          HERO — Split-Screen
         ═══════════════════════════════════════════════════════ */}
      <section className="min-h-[100vh] pt-24 flex flex-col lg:flex-row relative">

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
                    style={{ width: size + 'px', height: size + 'px' }}
                    initial={{ x: startX, y: window.innerHeight + 100, opacity: 0 }}
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
            className="text-display mb-12 text-foreground pb-2"
          >
            Exceptional<br />Taste.<br />Your Way.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-md w-full"
          >
            {/* Order Mode Toggle - Dark Glassmorphism Style */}
            <div className="flex p-1.5 bg-black/85 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[2rem] mb-8 relative">
              {(['dine-in', 'pickup', 'delivery'] as OrderMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  className={`flex-1 py-3.5 text-sm font-semibold rounded-[1.75rem] capitalize transition-all duration-500 ease-out ${orderMode === mode
                      ? 'bg-white shadow-lg text-black scale-100'
                      : 'text-white/60 hover:text-white scale-[0.98]'
                    }`}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Dynamic Input */}
            <div className="relative mb-8 h-[60px]">
              <AnimatePresence mode="wait">
                {orderMode === 'delivery' && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <input
                      type="text"
                      placeholder="Enter your delivery address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg placeholder-gray-400 transition-colors"
                    />
                    <button onClick={handleStartOrder} className="absolute right-0 top-0 text-primary font-medium hover:text-primary/80 transition-colors">
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
                    className="absolute inset-0"
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
                    className="absolute inset-0 flex gap-4"
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

            <button onClick={handleStartOrder} className="inline-flex items-center gap-2 text-lg font-medium group text-foreground">
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
          THE CRAFT (Bento Box Section)
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="mb-16 max-w-2xl">
            <h2 className="font-display font-bold text-4xl text-foreground mb-6">The Craft</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Every dish is an uncompromising dedication to quality. From hand-foraged Nordic ingredients to the precision of our plating, we bring the Michelin-caliber experience directly to your table, whether you dine with us or at home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-4 h-[600px]">
            {/* Main large image */}
            <div className="md:col-span-8 md:row-span-2 relative bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1200&auto=format&fit=crop"
                alt="Chef plating"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            {/* Top right small image */}
            <div className="md:col-span-4 md:row-span-1 relative bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?q=80&w=800&auto=format&fit=crop"
                alt="Fresh ingredients"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            {/* Bottom right small image */}
            <div className="md:col-span-4 md:row-span-1 relative bg-gray-100 overflow-hidden flex items-center justify-center p-8 bg-accent text-center">
              <div>
                <h3 className="font-display font-bold text-2xl mb-4">Unrivaled Quality.</h3>
                <p className="text-sm text-gray-500">Excellence delivered without compromise. Experience perfection in every bite.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EDITORIAL SPOTLIGHT (TESTIMONIALS SLIDER)
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-accent relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10 min-h-[300px] flex items-center">

          <button
            onClick={handlePrevTestimonial}
            className="absolute left-0 lg:-left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-400 hover:text-foreground"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft strokeWidth={1.5} />
          </button>

          <div className="flex-1 text-center px-12 overflow-hidden relative min-h-[250px] flex flex-col justify-center">
            <AnimatePresence mode="popLayout" custom={slideDirection}>
              <motion.div
                key={testimonialIndex}
                custom={slideDirection}
                initial={(dir) => ({ opacity: 0, x: dir === 1 ? 100 : -100 })}
                animate={{ opacity: 1, x: 0 }}
                exit={(dir) => ({ opacity: 0, x: dir === 1 ? -100 : 100 })}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full flex flex-col items-center absolute"
              >
                <p className="font-display font-bold text-2xl md:text-4xl text-foreground mb-8 leading-normal pb-2">
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
          </div>

          <button
            onClick={handleNextTestimonial}
            className="absolute right-0 lg:-right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-400 hover:text-foreground"
            aria-label="Next Testimonial"
          >
            <ChevronRight strokeWidth={1.5} />
          </button>

          {/* Pagination dots */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSlideDirection(i > testimonialIndex ? 1 : -1);
                  setTestimonialIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === testimonialIndex ? 'bg-primary w-4' : 'bg-gray-300'
                  }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOCIAL GALLERY
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display font-bold text-2xl mb-2 text-foreground">Join the Table</h2>
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">@syojuo</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 w-full">
          {galleryImages.map((src, idx) => (
            <a href="#" key={idx} className="relative aspect-square group overflow-hidden bg-gray-100">
              <img
                src={src}
                alt={`Gallery image ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white w-8 h-8">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CONTACT INFO
         ═══════════════════════════════════════════════════════ */}
      <section id="contact" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 w-full text-center">
          <h2 className="font-display font-bold text-4xl text-foreground mb-16 pb-2">Visit Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-muted-foreground mb-4">Location</h3>
              <a href="https://maps.google.com/?q=Pohjoisesplanadi+27,+Helsinki" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors block">
                Pohjoisesplanadi 27
              </a>
              <p className="text-gray-500 mt-1">00100 Helsinki, Finland</p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-muted-foreground mb-4">Contact</h3>
              <p className="text-foreground font-medium">+358 40 123 4567</p>
              <p className="text-gray-500 mt-1">reservations@syojuo.fi</p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-muted-foreground mb-4">Hours</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-foreground font-medium">Mon - Thu</p>
                  <p className="text-gray-500 text-sm">Lunch: 11:30 - 14:30<br />Dinner: 17:00 - 22:00</p>
                </div>
                <div>
                  <p className="text-foreground font-medium">Fri - Sat</p>
                  <p className="text-gray-500 text-sm">Dinner: 16:00 - 23:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MINIMAL FOOTER
         ═══════════════════════════════════════════════════════ */}
      <footer className="bg-foreground text-white py-8">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-bold text-xl tracking-widest uppercase">
            SYÖ & JUO
          </div>
          <div className="text-white/40 text-xs">
            © {new Date().getFullYear()} Syö & Juo. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs text-white/40 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
