'use client';

import { useState } from 'react';
import { FoodCard } from '@/components/menu/FoodCard';
import { ItemCustomizationModal } from '@/components/menu/ItemCustomizationModal';
import { useMenuCategories } from '@/hooks/useMenu';
import type { MenuItem } from '@/hooks/useMenu';

const TAG_COLORS: Record<string, string> = {
  amber:  'bg-amber-100 text-amber-700',
  green:  'bg-green-100 text-green-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
};

export default function MenuPage() {
  const { data: categories, isLoading, isError } = useMenuCategories();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !categories?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-2xl font-bold mb-2">Menu unavailable</p>
          <p className="text-gray-500">We're having trouble loading the menu. Please try again shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-16 md:space-y-24">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.name.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-[160px]">

            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{cat.name}</h2>
              <span className="bg-accent text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                {cat.items.length}
              </span>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {cat.items.map((item) => (
                <div key={item.id} className="relative">
                  {/* Tag badges */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${TAG_COLORS[tag.color] ?? TAG_COLORS.gray}`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <FoodCard
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    image={item.image_url ?? undefined}
                    featured={item.featured}
                    onCustomize={() => setSelectedItem(item)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <ItemCustomizationModal
        item={selectedItem ? {
          id: selectedItem.id,
          name: selectedItem.name,
          description: selectedItem.description,
          price: selectedItem.price,
          image: selectedItem.image_url ?? undefined,
          featured: selectedItem.featured,
          sizes: selectedItem.sizes,
          removable_ingredients: selectedItem.removable_ingredients,
          addons: selectedItem.addons,
        } : null}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
