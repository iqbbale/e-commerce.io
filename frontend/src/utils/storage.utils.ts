import { STORAGE_KEYS } from "../constants/env";
import { IUser } from "../types";

// ===== Token Storage =====
export const tokenStorage = {
  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  clearTokens: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

// ===== User Storage =====
export const userStorage = {
  setUser: (user: IUser): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getUser: (): IUser | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  clearUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

// ===== Auth Storage Combined =====
export const authStorage = {
  save: (user: IUser, accessToken: string, refreshToken: string): void => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    userStorage.setUser(user);
  },
  clear: (): void => {
    tokenStorage.clearTokens();
    userStorage.clearUser();
    localStorage.removeItem(STORAGE_KEYS.CART);
  },
  isLoggedIn: (): boolean => {
    return !!tokenStorage.getAccessToken() && !!userStorage.getUser();
  },
};

// ===== Search History =====
export const searchHistoryStorage = {
  get: (): string[] => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || "[]",
      );
    } catch {
      return [];
    }
  },
  add: (query: string): void => {
    const history = searchHistoryStorage.get();
    const updated = [query, ...history.filter((h) => h !== query)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
  },
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  },
};

// ===== Format Helpers =====
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(date);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const calculateDiscount = (
  price: number,
  comparePrice?: number,
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const clsx = (
  ...classes: (string | undefined | false | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
