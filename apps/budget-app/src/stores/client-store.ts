import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types';

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;

  fetchClients: (onlyActive?: boolean) => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<string | null>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,

  fetchClients: async (onlyActive = false) => {
    set({ isLoading: true, error: null });
    let query = supabase
      .from('clients')
      .select('*')
      .order('company_name');

    if (onlyActive) query = query.eq('is_active', true);

    const { data, error } = await query;
    set({
      clients: (data as Client[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  fetchClient: async (id) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    set({
      currentClient: data as Client | null,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createClient: async (data) => {
    set({ isLoading: true, error: null });
    const { data: client, error } = await supabase
      .from('clients')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }

    set({ isLoading: false });
    await get().fetchClients();
    return (client as Client).id;
  },

  updateClient: async (id, data) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (!error) await get().fetchClients();
    set({ error: error?.message ?? null });
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      set({ clients: get().clients.filter((c) => c.id !== id) });
    }
    set({ error: error?.message ?? null });
  },

  toggleActive: async (id) => {
    const client = get().clients.find((c) => c.id === id);
    if (!client) return;
    await get().updateClient(id, { is_active: !client.is_active });
  },
}));
