import { create } from "zustand";
import { IUser, ICart, ICartItem } from "../types";
import { authStorage, userStorage, tokenStorage } from "./storage.utils";

// ===== AUTH STORE =====
interface AuthStore {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initialize: () => void;
  updateUser: (updates: Partial<IUser>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    // Simpan ke localStorage DULU
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    userStorage.setUser(user);
    // Lalu update Zustand state
    set({ user, isAuthenticated: true, isLoading: false });
    console.log("[AUTH] setAuth called, role:", user.role);
  },

  logout: () => {
    authStorage.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    try {
      const user = userStorage.getUser();
      const token = tokenStorage.getAccessToken();
      if (user && token) {
        set({ user, isAuthenticated: true, isLoading: false });
        console.log("[AUTH] Restored session:", user.email, user.role);
      } else {
        set({ isLoading: false });
      }
    } catch {
      authStorage.clear();
      set({ isLoading: false });
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      userStorage.setUser(updated);
      set({ user: updated });
    }
  },
}));

// ===== CART STORE =====
interface CartStore {
  cart: ICart | null;
  isOpen: boolean;
  itemCount: number;
  setCart: (cart: ICart | null) => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isOpen: false,
  itemCount: 0,

  setCart: (cart) => {
    const count = cart?.items.reduce((s, i) => s + i.quantity, 0) || 0;
    set({ cart, itemCount: count });
  },

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  closeCart: () => set({ isOpen: false }),
  openCart: () => set({ isOpen: true }),

  getTotal: () =>
    get().cart?.items.reduce(
      (sum: number, item: ICartItem) => sum + item.price * item.quantity,
      0,
    ) || 0,
}));
