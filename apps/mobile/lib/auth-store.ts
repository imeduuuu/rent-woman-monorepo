import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "rw_access_token";
const USER_KEY = "rw_user";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: "MEMBER" | "TALENT" | "ADMIN";
  subscriptionPlan: "FREE" | "PREMIUM" | "ELITE";
  verificationStatus: "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
  avatarKey: string | null;
  city: string | null;
  country: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  signIn: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ token: null, user: null });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userRaw = await SecureStore.getItemAsync(USER_KEY);
      if (token && userRaw) {
        set({ token, user: JSON.parse(userRaw) as AuthUser });
      }
    } finally {
      set({ isLoading: false });
    }
  }
}));
