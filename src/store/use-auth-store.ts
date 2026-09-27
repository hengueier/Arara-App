import { create } from 'zustand';

import type { Empresa } from '@/api/schemas';
import { clearToken, readToken, saveToken } from '@/store/token-storage';

const TOKEN_KEY = 'arara_mobile_token';

type AuthState = {
  token: string | null;
  pessoaId: string | null;
  nome: string | null;
  user: string | null;
  empresas: Empresa[];
  hydrated: boolean;
  setSession: (payload: {
    token: string;
    pessoaId: string;
    nome?: string | null;
    user: string;
    empresas: Empresa[];
  }) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  setEmpresas: (empresas: Empresa[]) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  pessoaId: null,
  nome: null,
  user: null,
  empresas: [],
  hydrated: false,

  setSession: async ({ token, pessoaId, nome, user, empresas }) => {
    await saveToken(TOKEN_KEY, token);
    set({ token, pessoaId, nome: nome ?? null, user, empresas });
  },

  clearSession: async () => {
    await clearToken(TOKEN_KEY);
    set({ token: null, pessoaId: null, nome: null, user: null, empresas: [] });
  },

  hydrate: async () => {
    try {
      const token = await readToken(TOKEN_KEY);
      set({ token: token ?? null, hydrated: true });
    } catch {
      set({ token: null, hydrated: true });
    }
  },

  setEmpresas: (empresas) => set({ empresas }),
}));
