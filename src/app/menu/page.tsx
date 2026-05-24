'use client';

import { useState } from 'react';
import { FoodCard } from "@/components/menu/FoodCard";
import { ItemCustomizationModal, MenuItemData } from "@/components/menu/ItemCustomizationModal";

import { menuData } from "@/lib/menuData";


export default function MenuPage() {
  const categories = Object.keys(menuData);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);

  const allItems = Object.values(menuData).flat();
  const deals = allItems.filter(item => item.isSpecial || item.originalPrice);

  return (
    <>
      <div className="space-y-16 md:space-y-24">
        {deals.length > 0 && (
          <section id="deals" className="scroll-mt-[160px]">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Deals & Specials</h2>
              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                {deals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {deals.map((item) => (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  featured={item.isSpecial}
                  onCustomize={() => setSelectedItem(item as any)}
                />
              ))}
            </div>
          </section>
        )}
        {categories.map((cat) => (
          <section key={cat} id={cat.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-[160px]">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{cat}</h2>
              <span className="bg-accent text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                {menuData[cat].length}
              </span>
            </div>

            {/* Elevated Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {menuData[cat].map((item) => (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  featured={item.featured}
                  onCustomize={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ItemCustomizationModal 
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
