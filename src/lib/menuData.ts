export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badges?: string[];
  originalPrice?: number; // Added for deals
  isSpecial?: boolean;
  isChefRecommended?: boolean;
  isPopular?: boolean;
}

export const menuData: Record<string, MenuItem[]> = {
  "Mains": [
    {
      id: "m1",
      name: "Dry-Aged Ribeye",
      description: "45-day aged prime ribeye, bone marrow butter, charred broccolini.",
      price: 58.00,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
      isChefRecommended: true,
    },
    {
      id: "m2",
      name: "Duck Breast",
      description: "Roasted duck breast, cherry gastrique, parsnip purée.",
      price: 46.00,
      image: "https://images.unsplash.com/photo-1580959375944-abd7e991f971?q=80&w=800&auto=format&fit=crop",
      isPopular: true,
    },
    {
      id: "m3",
      name: "Truffle Forager Pizza",
      description: "Wild mushrooms, black truffle, confit garlic base, burnt mozzarella.",
      price: 24.00,
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
      badges: ["Signature"],
      isChefRecommended: true,
    },
    {
      id: "m4",
      name: "Pan-Seared Sea Bass",
      description: "Wild-caught sea bass, saffron risotto, fennel confit, citrus beurre blanc.",
      price: 42.0,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      isChefRecommended: true,
    },
    {
      id: "m5",
      name: "Nordic Margherita",
      description: "Heritage tomatoes, fresh basil, burnt mozzarella on sourdough crust.",
      price: 18.00,
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=800&auto=format&fit=crop",
      badges: ["Best Seller"],
      isPopular: true,
    },
    {
      id: "sp2",
      name: "Lunch Deal: Burger & Drink",
      description: "Wagyu smash burger with a drink of your choice.",
      price: 18.00,
      originalPrice: 24.00,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
      badges: ["Lunch Only"],
      isSpecial: true,
    }
  ],
  "Starters & Sides": [
    {
      id: "s1",
      name: "Artisan Charcuterie",
      description: "Cured meats, local cheeses, house-made focaccia.",
      price: 32.00,
      image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop",
      isPopular: true,
    },
    {
      id: "s2",
      name: "Roasted Beetroot Carpaccio",
      description: "Thinly sliced beetroot, goat cheese mousse, candied walnuts.",
      price: 16.0,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
      isChefRecommended: true,
    },
    {
      id: "s3",
      name: "Tuna Tartare",
      description: "Sashimi-grade bluefin tuna, avocado mousse, yuzu kosho.",
      price: 24.0,
      image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?q=80&w=800&auto=format&fit=crop",
      isPopular: true,
    }
  ],
  "Drinks": [
    {
      id: "d1",
      name: "Nordic Berry Spritz",
      description: "Lingonberry, cloudberry, sparkling water, mint.",
      price: 9.0,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    },
  ],
  "Curated Sets": [
    {
      id: "sp1",
      name: "Nordic Tasting Bundle",
      description: "A selection of our best starters, a main, and a dessert. Perfect for two.",
      price: 55.00,
      originalPrice: 70.00,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
      badges: ["20% Off", "Limited Time"],
      isSpecial: true,
    }
  ]
};
