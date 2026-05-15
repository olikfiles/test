'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { useOrderStore, OrderMode } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

/* ─── Data ─── */
const signatures = [
  {
    id: 's1',
    name: 'Nordic Margherita',
    description: 'Heritage tomatoes, fresh basil, burnt mozzarella.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 's2',
    name: 'Truffle Forager',
    description: 'Wild mushrooms, black truffle, confit garlic base.',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1544025162-811114cd3543?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 's3',
    name: 'Artisan Charcuterie',
    description: 'Cured meats, local cheeses, house-made focaccia.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop',
  },
];

/* ─── Main Component ─── */
export function LandingContent() {
  const router = useRouter();
  const { orderMode, setOrderMode, address, setAddress } = useOrderStore();
  const { addItem } = useCartStore();
  
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
      <section className="min-h-screen pt-24 flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-20 py-20 lg:py-0">
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
            className="max-w-md w-full"
          >
            {/* Order Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-full mb-6">
              {(['dine-in', 'pickup', 'delivery'] as OrderMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  className={`flex-1 py-3 text-sm font-medium rounded-full capitalize transition-all duration-300 ${
                    orderMode === mode
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-foreground'
                  }`}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Dynamic Input */}
            <div className="relative mb-8">
              {orderMode === 'delivery' && (
                <input 
                  type="text" 
                  placeholder="Enter your address or postal code..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg placeholder-gray-400 transition-colors"
                />
              )}
              {orderMode === 'pickup' && (
                <select className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg text-foreground transition-colors appearance-none">
                  <option value="helsinki">Helsinki Central</option>
                  <option value="espoo">Espoo Iso Omena</option>
                </select>
              )}
              {orderMode === 'dine-in' && (
                <input 
                  type="datetime-local" 
                  className="w-full pb-4 bg-transparent border-b border-gray-300 focus:border-foreground outline-none text-lg text-foreground transition-colors"
                />
              )}
              <button onClick={handleStartOrder} className="absolute right-0 top-0 text-primary font-medium hover:text-primary/80 transition-colors">
                Search
              </button>
            </div>

            <button onClick={handleStartOrder} className="inline-flex items-center gap-2 text-lg font-medium group text-foreground">
              {orderMode === 'dine-in' ? 'Reserve a Table' : 'Explore the Menu'}
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto relative bg-gray-100 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2000&auto=format&fit=crop"
            alt="Signature Dish" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CURATED SIGNATURES
         ═══════════════════════════════════════════════════════ */}
      <section className="py-32 max-w-7xl mx-auto px-6 w-full">
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
               <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop" alt="Takeaway packaging" className="w-full h-full object-cover" />
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
