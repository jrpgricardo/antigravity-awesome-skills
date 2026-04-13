import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Organization } from '@/types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await get().loadSession();
    return { error: null };
  },

  signUp: async (email, password, fullName, orgName) => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) return { error: authError.message };
    if (!authData.user) return { error: 'Falha ao criar usuario' };

    // 2. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, email })
      .select()
      .single();
    if (orgError) return { error: orgError.message };

    // 3. Create user profile
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      organization_id: org.id,
      email,
      full_name: fullName,
      role: 'admin',
    });
    if (userError) return { error: userError.message };

    await get().loadSession();
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, organization: null, isAuthenticated: false });
  },

  loadSession: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      set({ user: null, organization: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single();

    set({
      user: user as User,
      organization: org as Organization,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateOrganization: async (data) => {
    const org = get().organization;
    if (!org) return;

    const { data: updated } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', org.id)
      .select()
      .single();

    if (updated) {
      set({ organization: updated as Organization });
    }
  },
}));
