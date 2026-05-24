'use client';

import { useCartStore } from '@/store/useCartStore';
import { MenuItem } from './../../lib/menuData';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuGridProps {
  category: string;
  items: MenuItem[];
}

export function MenuGrid({ category, items }: MenuGridProps) {
  const { addItem, toggleDrawer } = useCartStore();

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: `${item.id}-${Date.now()}`,
      baseId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    // Open drawer briefly to show confirmation, or rely on Sticky Cart Bar
    // toggleDrawer(); // Optional: might be too intrusive for MVP flow if using sticky bar
  };

  return (
    <div id={`category-${category}`} className="pt-4 pb-6 px-4 max-w-4xl mx-auto scroll-mt-32">
      <h2 className="text-xl font-display font-extrabold text-foreground mb-4">{category}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Details Side */}
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                {item.badges && item.badges.length > 0 && (
                  <div className="flex gap-1 mb-1">
                    {item.badges.map(badge => (
                      <span key={badge} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider rounded-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="font-display font-bold text-base text-foreground mb-0.5 leading-tight">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">€{item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">€{item.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-foreground flex items-center justify-center hover:bg-foreground hover:text-white transition-colors"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Image Side */}
            <div className="w-[100px] md:w-[130px] h-full shrink-0 relative overflow-hidden bg-gray-50">
              <img 
                src={item.image} 
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
