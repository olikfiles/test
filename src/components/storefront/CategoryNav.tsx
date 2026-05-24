'use client';

import { useState, useEffect } from 'react';

interface CategoryNavProps {
  categories: string[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  // A simple way to handle scrolling to section. In a real app we might use intersection observers.
  const handleScrollTo = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById(`category-${category}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140; // offset for sticky navs
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar py-4 gap-6 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleScrollTo(cat)}
              className={`whitespace-nowrap font-display font-bold text-sm tracking-wide transition-colors relative ${
                activeCategory === cat ? 'text-foreground' : 'text-gray-400 hover:text-foreground'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute -bottom-4 left-0 right-0 h-[2px] bg-foreground rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
