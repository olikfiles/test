'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  featured?: boolean;
  onCustomize: () => void;
}

export function FoodCard({ id, name, description, price, image, featured, onCustomize }: FoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      onClick={onCustomize}
      className="group cursor-pointer h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="w-full aspect-square overflow-hidden bg-gray-100 mb-6 relative shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs font-semibold">
            NO IMAGE
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-foreground text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded shadow-sm">
            Signature
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex justify-between items-start gap-4 flex-1">
        <div className="flex flex-col h-full">
          <h3 className="font-display font-bold text-xl mb-2 text-foreground">{name}</h3>
          <p className="text-sm text-gray-500 mb-2 leading-relaxed line-clamp-2 flex-1">
            {description}
          </p>
          <p className="font-medium text-foreground mt-auto pt-2">€{price.toFixed(2)}</p>
        </div>
        
        {/* Action Button */}
        <button className="shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors mt-1">
          <Plus className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
