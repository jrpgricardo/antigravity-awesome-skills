import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { ServiceCatalogItem } from '@/types';

interface ServiceState {
  services: ServiceCatalogItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;

  fetchServices: (onlyActive?: boolean) => Promise<void>;
  createService: (data: Partial<ServiceCatalogItem>) => Promise<string | null>;
  updateService: (id: string, data: Partial<ServiceCatalogItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchServices: async (onlyActive = false) => {
    set({ isLoading: true, error: null });
    let query = supabase
      .from('service_catalog')
      .select('*')
      .order('category')
      .order('name');

    if (onlyActive) query = query.eq('is_active', true);

    const { data, error } = await query;
    const services = (data as ServiceCatalogItem[]) ?? [];
    const categories = [...new Set(services.map((s) => s.category))];

    set({
      services,
      categories,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createService: async (data) => {
    set({ isLoading: true, error: null });
    const { data: service, error } = await supabase
      .from('service_catalog')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }

    set({ isLoading: false });
    await get().fetchServices();
    return (service as ServiceCatalogItem).id;
  },

  updateService: async (id, data) => {
    const { error } = await supabase.from('service_catalog').update(data).eq('id', id);
    if (!error) await get().fetchServices();
    set({ error: error?.message ?? null });
  },

  deleteService: async (id) => {
    const { error } = await supabase.from('service_catalog').delete().eq('id', id);
    if (!error) {
      set({ services: get().services.filter((s) => s.id !== id) });
    }
    set({ error: error?.message ?? null });
  },

  toggleActive: async (id) => {
    const service = get().services.find((s) => s.id === id);
    if (!service) return;
    await get().updateService(id, { is_active: !service.is_active });
  },
}));
