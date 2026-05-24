'use client';

import { useCartStore } from '@/store/useCartStore';
import { MenuItem } from '@/lib/menuData';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface BentoHighlightsProps {
  items: MenuItem[];
}

export function BentoHighlights({ items }: BentoHighlightsProps) {
  const { addItem } = useCartStore();

  if (!items || items.length < 3) return null;

  const handleAdd = (item: MenuItem, e: React.MouseEvent) => {
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

  const topItems = items.slice(0, 3);

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl md:text-2xl font-display font-extrabold text-foreground">Menu Highlights</h2>
        <Link href="/menu" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
          Full Menu →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-3 md:gap-4 h-auto md:h-[450px]">
        {/* Large Feature Item */}
        <div className="md:col-span-8 md:row-span-2 relative bg-gray-100 overflow-hidden rounded-3xl group cursor-pointer h-[300px] md:h-auto" onClick={(e) => handleAdd(topItems[0], e)}>
          <img
            src={topItems[0].image}
            alt={topItems[0].name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
            <div className="pb-1">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 inline-block">Highlight</span>
              <h3 className="text-2xl font-display font-bold text-white mb-1">{topItems[0].name}</h3>
              <span className="text-white font-bold">€{topItems[0].price.toFixed(2)}</span>
            </div>
            <button 
              className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-foreground transition-colors shrink-0"
              onClick={(e) => handleAdd(topItems[0], e)}
            >
              <Plus strokeWidth={2.5} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Right Item */}
        <div className="md:col-span-4 md:row-span-1 relative bg-gray-100 overflow-hidden rounded-3xl group cursor-pointer h-[200px] md:h-auto" onClick={(e) => handleAdd(topItems[1], e)}>
          <img
            src={topItems[1].image}
            alt={topItems[1].name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div className="pb-1">
              <h3 className="text-lg font-display font-bold text-white mb-1">{topItems[1].name}</h3>
              <span className="text-white font-bold text-sm">€{topItems[1].price.toFixed(2)}</span>
            </div>
            <button 
              className="w-8 h-8 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-foreground transition-colors shrink-0"
              onClick={(e) => handleAdd(topItems[1], e)}
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Right Item */}
        <div className="md:col-span-4 md:row-span-1 relative bg-gray-100 overflow-hidden rounded-3xl group cursor-pointer h-[200px] md:h-auto" onClick={(e) => handleAdd(topItems[2], e)}>
          <img
            src={topItems[2].image}
            alt={topItems[2].name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div className="pb-1">
              <h3 className="text-lg font-display font-bold text-white mb-1">{topItems[2].name}</h3>
              <span className="text-white font-bold text-sm">€{topItems[2].price.toFixed(2)}</span>
            </div>
            <button 
              className="w-8 h-8 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-foreground transition-colors shrink-0"
              onClick={(e) => handleAdd(topItems[2], e)}
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
