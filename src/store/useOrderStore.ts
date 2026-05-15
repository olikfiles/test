import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderMode = 'delivery' | 'pickup' | 'dine-in';

interface OrderState {
  orderMode: OrderMode;
  address: string;
  restaurantLocation: string;
  estimatedTime: string;
  setOrderMode: (mode: OrderMode) => void;
  setAddress: (address: string) => void;
  setRestaurantLocation: (location: string) => void;
  setEstimatedTime: (time: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orderMode: 'delivery',
      address: '',
      restaurantLocation: 'Helsinki Central',
      estimatedTime: 'ASAP (~35 mins)',

      setOrderMode: (mode) => set({ orderMode: mode }),
      setAddress: (address) => set({ address }),
      setRestaurantLocation: (location) => set({ restaurantLocation: location }),
      setEstimatedTime: (time) => set({ estimatedTime: time }),
    }),
    {
      name: 'syojuo-order-storage',
    }
  )
);
