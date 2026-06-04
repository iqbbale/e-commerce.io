import api from '../utils/api.utils';
import { authStorage, userStorage } from '../utils/storage.utils';
import { ILoginForm, IRegisterForm, IUser, IApiResponse } from '../types';

interface AuthData {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: async (data: IRegisterForm): Promise<AuthData> => {
    const response = await api.post<IApiResponse<AuthData>>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });
    const authData = response.data.data!;
    authStorage.save(authData.user, authData.accessToken, authData.refreshToken);
    return authData;
  },

  login: async (data: ILoginForm): Promise<AuthData> => {
    const response = await api.post<IApiResponse<AuthData>>('/auth/login', data);
    const authData = response.data.data!;
    authStorage.save(authData.user, authData.accessToken, authData.refreshToken);
    return authData;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      authStorage.clear();
    }
  },

  getMe: async (): Promise<IUser> => {
    const response = await api.get<IApiResponse<IUser>>('/auth/me');
    const user = response.data.data!;
    userStorage.setUser(user);
    return user;
  },

  updateProfile: async (data: Partial<IUser>): Promise<IUser> => {
    const response = await api.put<IApiResponse<IUser>>('/users/profile', data);
    const user = response.data.data!;
    userStorage.setUser(user);
    return user;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/users/change-password', { currentPassword, newPassword });
  },
};
