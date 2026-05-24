'use client';

import { useCartStore } from '@/store/useCartStore';
import { MenuItem } from '@/lib/menuData';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturedGridProps {
  category: string;
  items: MenuItem[];
  layoutType?: '2x2' | '1x4';
}

export function FeaturedGrid({ category, items, layoutType = '1x4' }: FeaturedGridProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: `${item.id}-${Date.now()}`,
      baseId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  if (!items || items.length === 0) return null;

  const renderCard = (item: MenuItem, i: number) => (
    <motion.div 
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.1 }}
      className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors group flex flex-col shadow-sm"
    >
      <div className="w-full h-[160px] relative overflow-hidden bg-gray-50 cursor-pointer">
        <img 
          src={item.image} 
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {item.badges && item.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            {item.badges.map(badge => (
              <span key={badge} className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-primary text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1 justify-between bg-white">
        <div className="mb-2">
          <h3 className="font-display font-bold text-[15px] text-foreground mb-1 leading-tight line-clamp-1">{item.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground text-sm">€{item.price.toFixed(2)}</span>
            {item.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">€{item.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => handleAddToCart(item, e)}
            className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 text-foreground flex items-center justify-center hover:bg-foreground hover:text-white transition-colors"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="py-6 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Styled Container for Grouping */}
        <div className="border border-gray-200/60 bg-gray-50/30 rounded-3xl p-4 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-display font-extrabold text-foreground">{category}</h2>
            <div className="w-12 h-1 bg-primary/20 rounded-full mt-2"></div>
          </div>
          
          <div className={`grid gap-4 md:gap-6 ${layoutType === '2x2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {items.slice(0, 4).map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
