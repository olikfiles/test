'use client';

import { menuData } from '@/lib/menuData';
import { MenuGrid } from '@/components/storefront/MenuGrid';

export default function DealsPage() {
  const allItems = Object.values(menuData).flat();
  const deals = allItems.filter(item => item.isSpecial || item.originalPrice);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 mb-8 text-center">
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Today's Deals</h1>
        <p className="text-gray-500">Exclusive bundles and special pricing available for a limited time.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {deals.length > 0 ? (
          <MenuGrid category="Active Offers" items={deals} />
        ) : (
          <p className="text-center text-gray-500">No deals available today. Check back tomorrow!</p>
        )}
      </div>
    </div>
  );
}
