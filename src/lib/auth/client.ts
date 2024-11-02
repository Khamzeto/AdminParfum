'use client';

import axios from 'axios';

import type { User } from '@/types/user';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  // Базовый URL для API
  private baseUrl = 'https://hltback.parfumetrika.ru/auth';

  // Регистрация
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/admin`, params);
      localStorage.setItem('auth-token', response.data.token); // Сохраняем токен
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Ошибка при регистрации' };
    }
  }

  // Вход через OAuth
  async signInWithOAuth(params: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'OAuth авторизация не реализована' }; // Пока заглушка
  }

  // Вход по паролю
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/admin`, params);
      localStorage.setItem('auth-token', response.data.token); // Сохраняем токен
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Неверные учетные данные' };
    }
  }

  // Сброс пароля
  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    try {
      await axios.post(`${this.baseUrl}/reset-password`, params);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Ошибка при сбросе пароля' };
    }
  }

  // Получение данных пользователя
  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return { data: null };

      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: 'Ошибка при получении данных пользователя' };
    }
  }

  // Выход
  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('auth-token');
    return {};
  }
}

export const authClient = new AuthClient();
