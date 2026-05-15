'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";

const categories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "curated-sets", name: "Curated Sets" },
  { id: "wine", name: "Wine & Spirits" },
];

export default function MenuLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { items, getCartTotal, toggleDrawer } = useCartStore();
  
  const itemCount = items.reduce((t, i) => t + i.quantity, 0);
  const total = getCartTotal();

  return (
    <div className="pt-[64px] min-h-screen bg-background relative pb-24 md:pb-0">
      {/* Category Tabs — sticky pill menu */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-3">
          <nav className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {categories.map((cat) => {
              // Very naive active state based on hash would require an intersection observer in page.tsx
              // For now, we'll just style them as pills
              return (
                <Link
                  key={cat.id}
                  href={`/menu#${cat.id}`}
                  className="flex-shrink-0 px-5 py-2 text-sm font-semibold rounded-full bg-accent text-foreground hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-10 md:py-16">
        {children}
      </div>

      {/* Mobile Floating Cart Summary */}
      {itemCount > 0 && (
        <div className="md:hidden fixed bottom-6 left-5 right-5 z-40">
          <button 
            onClick={toggleDrawer}
            className="w-full bg-primary text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                {itemCount}
              </div>
              <span>View Order</span>
            </div>
            <span>€{total.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
