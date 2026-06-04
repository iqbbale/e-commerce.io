import api from "../utils/api.utils";
import {
  IApiResponse,
  IProduct,
  IProductFilter,
  ICart,
  IOrder,
  ICheckoutForm,
  ICategory,
  IReview,
} from "../types";

// ===== PRODUCT SERVICE =====
export const productService = {
  getAll: async (filters: IProductFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "")
        params.append(key, String(value));
    });
    const response = await api.get<IApiResponse<IProduct[]>>(
      `/products?${params}`,
    );
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<IApiResponse<IProduct>>(`/products/${slug}`);
    return response.data.data!;
  },

  getFeatured: async () => {
    const response =
      await api.get<IApiResponse<IProduct[]>>("/products/featured");
    return response.data.data || [];
  },

  create: async (data: Partial<IProduct>) => {
    const response = await api.post<IApiResponse<IProduct>>("/products", data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<IProduct>) => {
    const response = await api.put<IApiResponse<IProduct>>(
      `/products/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

// ===== CATEGORY SERVICE =====
export const categoryService = {
  getAll: async () => {
    const response = await api.get<IApiResponse<ICategory[]>>("/categories");
    return response.data.data || [];
  },

  create: async (data: Partial<ICategory>) => {
    const response = await api.post<IApiResponse<ICategory>>(
      "/categories",
      data,
    );
    return response.data.data!;
  },

  update: async (id: string, data: Partial<ICategory>) => {
    const response = await api.put<IApiResponse<ICategory>>(
      `/categories/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

// ===== CART SERVICE =====
export const cartService = {
  get: async () => {
    const response = await api.get<IApiResponse<ICart>>("/cart");
    return response.data.data;
  },

  add: async (productId: string, quantity: number, variant?: string) => {
    const response = await api.post<IApiResponse<ICart>>("/cart/add", {
      productId,
      quantity,
      variant,
    });
    return response.data.data!;
  },

  update: async (productId: string, quantity: number) => {
    const response = await api.put<IApiResponse<ICart>>(
      `/cart/item/${productId}`,
      { quantity },
    );
    return response.data.data!;
  },

  remove: async (productId: string) => {
    const response = await api.delete<IApiResponse<ICart>>(
      `/cart/item/${productId}`,
    );
    return response.data.data!;
  },

  clear: async () => {
    await api.delete("/cart/clear");
  },
};

// ===== ORDER SERVICE =====
export const orderService = {
  create: async (
    data: ICheckoutForm & {
      items: { productId: string; quantity: number; variant?: string }[];
    },
  ) => {
    const response = await api.post<IApiResponse<IOrder>>("/orders", data);
    return response.data.data!;
  },

  getMyOrders: async (
    params: { page?: number; limit?: number; status?: string } = {},
  ) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(
      ([k, v]) => v !== undefined && query.append(k, String(v)),
    );
    const response = await api.get<IApiResponse<IOrder[]>>(
      `/orders/my-orders?${query}`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<IApiResponse<IOrder>>(`/orders/${id}`);
    return response.data.data!;
  },

  uploadPaymentProof: async (id: string, paymentProof: string) => {
    const response = await api.patch<IApiResponse<IOrder>>(
      `/orders/${id}/payment-proof`,
      { paymentProof },
    );
    return response.data.data!;
  },

  // Admin
  getAll: async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(
      ([k, v]) => v !== undefined && query.append(k, String(v)),
    );
    const response = await api.get<IApiResponse<IOrder[]>>(`/orders?${query}`);
    return response.data;
  },

  updateStatus: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch<IApiResponse<IOrder>>(
      `/orders/${id}/status`,
      data,
    );
    return response.data.data!;
  },
};

// ===== REVIEW SERVICE =====
export const reviewService = {
  getByProduct: async (productId: string) => {
    const response = await api.get<IApiResponse<IReview[]>>(
      `/reviews/product/${productId}`,
    );
    return response.data.data || [];
  },

  create: async (data: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) => {
    const response = await api.post<IApiResponse<IReview>>("/reviews", data);
    return response.data.data!;
  },
};

// ===== DASHBOARD SERVICE =====
export const dashboardService = {
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data.data;
  },

  getMonthlyRevenue: async (year?: number) => {
    const response = await api.get(
      `/dashboard/revenue/monthly${year ? `?year=${year}` : ""}`,
    );
    return response.data.data;
  },

  getDailyRevenue: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append("year", String(year));
    if (month) params.append("month", String(month));
    const response = await api.get(`/dashboard/revenue/daily?${params}`);
    return response.data.data;
  },

  getTopProducts: async () => {
    const response = await api.get("/dashboard/products/top");
    return response.data.data;
  },

  getOrderStatusDistribution: async () => {
    const response = await api.get("/dashboard/orders/status-distribution");
    return response.data.data;
  },

  getYearlyComparison: async () => {
    const response = await api.get("/dashboard/revenue/yearly");
    return response.data.data;
  },
};

// ===== USER SERVICE (Admin) =====
export const userService = {
  getAll: async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(
      ([k, v]) => v !== undefined && query.append(k, String(v)),
    );
    const response = await api.get(`/admin/users?${query}`);
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  toggleWishlist: async (productId: string) => {
    const response = await api.post(`/users/wishlist/${productId}`);
    return response.data;
  },
};
