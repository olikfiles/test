import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customization {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // This might be a composite ID (e.g. 'm1-customized-xyz')
  baseId: string; // The original item ID
  name: string;
  price: number; // The base price
  quantity: number;
  customizations?: Customization[];
  image?: string;
  instructions?: string;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) =>
        set((state) => {
          // If the exact same item (with same customizations, represented by identical id) exists, just increment
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const customizationsTotal = item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0;
          return total + (item.price + customizationsTotal) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'syojuo-cart-storage',
      // We only want to persist items, not the drawer state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
