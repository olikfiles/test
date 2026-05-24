'use client';

import { StorefrontHeader } from './StorefrontHeader';
import { BentoHighlights } from './BentoHighlights';
import { MenuGrid } from './MenuGrid';
import { FeaturedGrid } from './FeaturedGrid';
import { StickyCartBar } from './StickyCartBar';
import { menuData } from '@/lib/menuData';
import Link from 'next/link';

export function Storefront() {
  const allItems = Object.values(menuData).flat();

  // Collect 3 items for the Bento Grid (e.g. from Chef's Recommended or Popular)
  const bentoItems = allItems.filter(item => item.isChefRecommended || item.isPopular).slice(0, 3);

  // Group sections dynamically
  const chefsRecommended = allItems.filter(item => item.isChefRecommended);
  const popularItems = allItems.filter(item => item.isPopular);

  // Sections to show compactly
  const compactSections = ["Mains", "Starters & Sides", "Drinks", "Curated Sets"];

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <StorefrontHeader />

      {bentoItems.length === 3 && <BentoHighlights items={bentoItems} />}

      <div className="space-y-4 mt-8">
        {chefsRecommended.length > 0 && <FeaturedGrid category="Chef's Recommended" items={chefsRecommended} layoutType="2x2" />}
        {popularItems.length > 0 && <FeaturedGrid category="Popular" items={popularItems} layoutType="1x4" />}
      </div>

      <div className="mt-12 border-t border-gray-100 pt-12 pb-12 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Explore the Full Menu</h2>
            <p className="text-gray-500">Discover all our offerings, from starters to curated sets.</p>
          </div>

          <div className="space-y-4 opacity-80 scale-[0.98] origin-top transition-all duration-500 hover:opacity-100 hover:scale-100 border-x border-gray-200/50 px-2 md:px-8 py-4 bg-white/50 rounded-3xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)]">
            {compactSections.map((cat) => (
              menuData[cat] && menuData[cat].length > 0 ? <MenuGrid key={cat} category={cat} items={menuData[cat].slice(0, 2)} /> : null
            ))}
          </div>
        </div>
      </div>

      <StickyCartBar />
    </div>
  );
}
