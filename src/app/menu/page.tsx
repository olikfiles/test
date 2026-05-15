'use client';

import { useState } from 'react';
import { FoodCard } from "@/components/menu/FoodCard";
import { ItemCustomizationModal, MenuItemData } from "@/components/menu/ItemCustomizationModal";

const menuData: Record<string, MenuItemData[]> = {
  Starters: [
    {
      id: "s1",
      name: "Burrata & Heritage Tomato",
      description: "Creamy Apulian burrata, heirloom tomatoes, basil oil, aged balsamic, sourdough crisps.",
      price: 18.0,
      image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "s2",
      name: "Tuna Tartare",
      description: "Sashimi-grade bluefin tuna, avocado mousse, yuzu kosho, black sesame, crispy wontons.",
      price: 24.0,
      image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?q=80&w=800&auto=format&fit=crop",
      featured: true,
    },
    {
      id: "s3",
      name: "Roasted Beetroot Carpaccio",
      description: "Thinly sliced beetroot, goat cheese mousse, candied walnuts, micro herbs.",
      price: 16.0,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    },
  ],
  Mains: [
    {
      id: "m1",
      name: "Pan-Seared Sea Bass",
      description: "Wild-caught sea bass, saffron risotto, fennel confit, citrus beurre blanc.",
      price: 42.0,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      featured: true,
    },
    {
      id: "m2",
      name: "Dry-Aged Ribeye",
      description: "45-day aged prime ribeye, bone marrow butter, charred broccolini, truffle jus.",
      price: 58.0,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "m3",
      name: "Handmade Pappardelle",
      description: "Slow-braised lamb ragù, pecorino romano, fresh herbs.",
      price: 32.0,
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "m4",
      name: "Duck Breast",
      description: "Roasted duck breast, cherry gastrique, parsnip purée, crispy shallots.",
      price: 46.0,
      image: "https://images.unsplash.com/photo-1580959375944-abd7e991f971?q=80&w=800&auto=format&fit=crop",
    },
  ],
  "Curated Sets": [
    {
      id: "cs1",
      name: "The Nordic Journey",
      description: "A five-course tasting menu celebrating the best of Scandinavian cuisine.",
      price: 120.0,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
      featured: true,
    },
    {
      id: "cs2",
      name: "The At-Home Experience",
      description: "Our signature three-course set, beautifully packaged for home enjoyment.",
      price: 85.0,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    },
  ],
};

export default function MenuPage() {
  const categories = Object.keys(menuData);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);

  return (
    <>
      <div className="space-y-16 md:space-y-24">
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
