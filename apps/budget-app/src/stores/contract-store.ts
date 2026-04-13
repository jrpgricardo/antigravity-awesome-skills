import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Contract, ContractTemplate, ContractStatus } from '@/types';

interface ContractState {
  contracts: Contract[];
  currentContract: Contract | null;
  contractTemplates: ContractTemplate[];
  isLoading: boolean;
  error: string | null;

  fetchContracts: (filters?: { status?: ContractStatus; client_id?: string }) => Promise<void>;
  fetchContract: (id: string) => Promise<void>;
  createContract: (data: Partial<Contract>) => Promise<string | null>;
  updateContract: (id: string, data: Partial<Contract>) => Promise<void>;
  signContract: (id: string, signedBy: string) => Promise<void>;

  // Contract Templates
  fetchContractTemplates: () => Promise<void>;
  createContractTemplate: (data: Partial<ContractTemplate>) => Promise<string | null>;
  updateContractTemplate: (id: string, data: Partial<ContractTemplate>) => Promise<void>;
  deleteContractTemplate: (id: string) => Promise<void>;
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  currentContract: null,
  contractTemplates: [],
  isLoading: false,
  error: null,

  fetchContracts: async (filters) => {
    set({ isLoading: true, error: null });
    let query = supabase
      .from('contracts')
      .select('*, client:clients(*), proposal:proposals(title)')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.client_id) query = query.eq('client_id', filters.client_id);

    const { data, error } = await query;
    set({
      contracts: (data as Contract[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  fetchContract: async (id) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('contracts')
      .select('*, client:clients(*), proposal:proposals(*), invoices:invoices(*)')
      .eq('id', id)
      .single();

    set({
      currentContract: data as Contract | null,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createContract: async (data) => {
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    await get().fetchContracts();
    return (contract as Contract).id;
  },

  updateContract: async (id, data) => {
    const { error } = await supabase.from('contracts').update(data).eq('id', id);
    if (!error) await get().fetchContract(id);
    set({ error: error?.message ?? null });
  },

  signContract: async (id, signedBy) => {
    await supabase
      .from('contracts')
      .update({
        status: 'active',
        signed_at: new Date().toISOString(),
        signed_by: signedBy,
      })
      .eq('id', id);
    await get().fetchContract(id);
  },

  // Contract Templates
  fetchContractTemplates: async () => {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    set({
      contractTemplates: (data as ContractTemplate[]) ?? [],
      error: error?.message ?? null,
    });
  },

  createContractTemplate: async (data) => {
    const { data: template, error } = await supabase
      .from('contract_templates')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    await get().fetchContractTemplates();
    return (template as ContractTemplate).id;
  },

  updateContractTemplate: async (id, data) => {
    const { error } = await supabase.from('contract_templates').update(data).eq('id', id);
    if (!error) await get().fetchContractTemplates();
    set({ error: error?.message ?? null });
  },

  deleteContractTemplate: async (id) => {
    await supabase.from('contract_templates').update({ is_active: false }).eq('id', id);
    await get().fetchContractTemplates();
  },
}));
