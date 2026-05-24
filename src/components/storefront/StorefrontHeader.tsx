'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { menuData } from '@/lib/menuData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StorefrontHeader() {
  const { orderMode, setOrderMode } = useOrderStore();
  const { addItem } = useCartStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const isDelivery = orderMode === 'delivery';

  // Get all special items
  const allItems = Object.values(menuData).flat();
  const specials = allItems.filter(item => item.isSpecial);

  useEffect(() => {
    if (specials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [specials.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % specials.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? specials.length - 1 : prev - 1));
  };

  const currentSpecial = specials[currentIndex];

  const handleAddSpecial = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSpecial) return;
    addItem({
      id: `${currentSpecial.id}-${Date.now()}`,
      baseId: currentSpecial.id,
      name: currentSpecial.name,
      price: currentSpecial.price,
      quantity: 1,
      image: currentSpecial.image,
    });
  };

  const handleCardClick = () => {
    router.push('/deals');
  };

  return (
    <div className="pt-32 pb-8 px-4 max-w-6xl mx-auto bg-background">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Left Column: Brand & Fulfillment */}
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">SYÖ & JUO</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-[280px]">Exceptional taste, delivered directly to your table.</p>
          
          <div className="w-full max-w-[280px]">
            {/* Fulfillment Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-full mb-3 relative shadow-inner">
              <button
                onClick={() => setOrderMode('delivery')}
                className={`flex-1 py-2 text-xs font-semibold rounded-full capitalize transition-all duration-300 z-10 ${
                  isDelivery ? 'text-white' : 'text-gray-500 hover:text-foreground'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setOrderMode('pickup')}
                className={`flex-1 py-2 text-xs font-semibold rounded-full capitalize transition-all duration-300 z-10 ${
                  !isDelivery ? 'text-white' : 'text-gray-500 hover:text-foreground'
                }`}
              >
                Takeout
              </button>
              
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-foreground rounded-full"
                initial={false}
                animate={{
                  left: isDelivery ? '4px' : 'calc(50% + 0px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Estimated Time Context */}
            <div className="text-[11px] text-gray-500 font-medium flex justify-center lg:justify-start items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {isDelivery ? (
                <p>Est. Delivery: <span className="text-foreground font-bold">45-60 min</span></p>
              ) : (
                <p>Ready for Pickup: <span className="text-foreground font-bold">15-20 min</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Special Carousel */}
        {specials.length > 0 && (
          <div className="w-full lg:w-2/3 relative h-[250px] md:h-[320px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer" onClick={handleCardClick}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
                <img 
                  src={currentSpecial.image} 
                  alt={currentSpecial.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                    Today's Special
                  </span>
                  {currentSpecial.badges?.map(badge => (
                    <span key={badge} className="px-2 py-0.5 bg-white text-primary text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-5 left-5 right-5 z-20 flex justify-between items-end">
                  <div className="pr-12">
                    <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1 line-clamp-1">{currentSpecial.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">€{currentSpecial.price.toFixed(2)}</span>
                      {currentSpecial.originalPrice && (
                        <span className="text-white/60 line-through text-xs">€{currentSpecial.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleAddSpecial}
                    className="absolute right-0 bottom-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition-colors shadow-lg shrink-0"
                    aria-label="Add special to cart"
                  >
                    <Plus strokeWidth={2.5} className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            {specials.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
