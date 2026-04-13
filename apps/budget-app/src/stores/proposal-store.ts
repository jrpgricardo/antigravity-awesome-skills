import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  Proposal,
  ProposalItem,
  ProposalBlock,
  ProposalStatus,
  ProposalVersion,
  ProposalComment,
  ProposalView,
  DigitalSignature,
} from '@/types';
import { calculateItemTotal } from '@/utils/currency';

interface ProposalState {
  proposals: Proposal[];
  currentProposal: Proposal | null;
  versions: ProposalVersion[];
  comments: ProposalComment[];
  views: ProposalView[];
  signature: DigitalSignature | null;
  isLoading: boolean;
  error: string | null;

  // CRUD
  fetchProposals: (filters?: { status?: ProposalStatus; client_id?: string }) => Promise<void>;
  fetchProposal: (id: string) => Promise<void>;
  fetchProposalByToken: (token: string) => Promise<void>;
  createProposal: (data: Partial<Proposal>, items: Partial<ProposalItem>[]) => Promise<string | null>;
  updateProposal: (id: string, data: Partial<Proposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;

  // Items
  addItem: (proposalId: string, item: Partial<ProposalItem>) => Promise<void>;
  updateItem: (itemId: string, data: Partial<ProposalItem>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  reorderItems: (proposalId: string, itemIds: string[]) => Promise<void>;

  // Status & Workflow
  sendProposal: (id: string) => Promise<void>;
  markViewed: (id: string) => Promise<void>;
  approveProposal: (id: string) => Promise<void>;
  rejectProposal: (id: string) => Promise<void>;

  // Versions (Phase 2)
  fetchVersions: (proposalId: string) => Promise<void>;
  createVersion: (proposalId: string, summary: string) => Promise<void>;

  // Comments (Phase 2)
  fetchComments: (proposalId: string) => Promise<void>;
  addComment: (proposalId: string, comment: Partial<ProposalComment>) => Promise<void>;

  // Views (Phase 3)
  fetchViews: (proposalId: string) => Promise<void>;
  recordView: (proposalId: string, duration: number) => Promise<void>;

  // Signature (Phase 2)
  fetchSignature: (proposalId: string) => Promise<void>;
  signProposal: (proposalId: string, data: Partial<DigitalSignature>) => Promise<void>;

  // Builder state
  setBlocks: (blocks: ProposalBlock[]) => void;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  proposals: [],
  currentProposal: null,
  versions: [],
  comments: [],
  views: [],
  signature: null,
  isLoading: false,
  error: null,

  fetchProposals: async (filters) => {
    set({ isLoading: true, error: null });
    let query = supabase
      .from('proposals')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.client_id) query = query.eq('client_id', filters.client_id);

    const { data, error } = await query;
    set({
      proposals: (data as Proposal[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  fetchProposal: async (id) => {
    set({ isLoading: true, error: null });
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*, client:clients(*), items:proposal_items(*)')
      .eq('id', id)
      .single();

    if (proposal) {
      const { data: items } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', id)
        .order('sort_order');
      (proposal as Proposal).items = (items as ProposalItem[]) ?? [];
    }

    set({
      currentProposal: proposal as Proposal | null,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  fetchProposalByToken: async (token) => {
    set({ isLoading: true, error: null });
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*, client:clients(*), organization:organizations(*)')
      .eq('public_token', token)
      .single();

    if (proposal) {
      const { data: items } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', (proposal as Proposal).id)
        .order('sort_order');
      (proposal as Proposal).items = (items as ProposalItem[]) ?? [];
    }

    set({
      currentProposal: proposal as Proposal | null,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createProposal: async (data, items) => {
    set({ isLoading: true, error: null });
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert(data)
      .select()
      .single();

    if (error || !proposal) {
      set({ isLoading: false, error: error?.message ?? 'Erro ao criar proposta' });
      return null;
    }

    // Insert items
    if (items.length > 0) {
      const itemsWithProposal = items.map((item, index) => ({
        ...item,
        proposal_id: (proposal as Proposal).id,
        sort_order: index,
        total: calculateItemTotal(
          item.unit_price ?? 0,
          item.quantity ?? 1,
          item.discount ?? 0
        ),
      }));
      await supabase.from('proposal_items').insert(itemsWithProposal);
    }

    set({ isLoading: false });
    await get().fetchProposals();
    return (proposal as Proposal).id;
  },

  updateProposal: async (id, data) => {
    const { error } = await supabase.from('proposals').update(data).eq('id', id);
    if (!error) {
      await get().fetchProposal(id);
    }
    set({ error: error?.message ?? null });
  },

  deleteProposal: async (id) => {
    await supabase.from('proposal_items').delete().eq('proposal_id', id);
    await supabase.from('proposals').delete().eq('id', id);
    set({ proposals: get().proposals.filter((p) => p.id !== id) });
  },

  addItem: async (proposalId, item) => {
    const total = calculateItemTotal(
      item.unit_price ?? 0,
      item.quantity ?? 1,
      item.discount ?? 0
    );
    await supabase.from('proposal_items').insert({
      ...item,
      proposal_id: proposalId,
      total,
    });
    await get().fetchProposal(proposalId);
  },

  updateItem: async (itemId, data) => {
    if (data.unit_price !== undefined || data.quantity !== undefined || data.discount !== undefined) {
      const current = get().currentProposal?.items?.find((i) => i.id === itemId);
      if (current) {
        data.total = calculateItemTotal(
          data.unit_price ?? current.unit_price,
          data.quantity ?? current.quantity,
          data.discount ?? current.discount
        );
      }
    }
    await supabase.from('proposal_items').update(data).eq('id', itemId);
    if (get().currentProposal) {
      await get().fetchProposal(get().currentProposal!.id);
    }
  },

  removeItem: async (itemId) => {
    await supabase.from('proposal_items').delete().eq('id', itemId);
    if (get().currentProposal) {
      await get().fetchProposal(get().currentProposal!.id);
    }
  },

  reorderItems: async (proposalId, itemIds) => {
    const updates = itemIds.map((id, index) =>
      supabase.from('proposal_items').update({ sort_order: index }).eq('id', id)
    );
    await Promise.all(updates);
    await get().fetchProposal(proposalId);
  },

  sendProposal: async (id) => {
    await supabase
      .from('proposals')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id);
    await get().fetchProposal(id);
  },

  markViewed: async (id) => {
    const proposal = get().currentProposal;
    if (proposal && !proposal.viewed_at) {
      await supabase
        .from('proposals')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('id', id);
    }
  },

  approveProposal: async (id) => {
    await supabase
      .from('proposals')
      .update({ status: 'approved', responded_at: new Date().toISOString() })
      .eq('id', id);
    await get().fetchProposal(id);
  },

  rejectProposal: async (id) => {
    await supabase
      .from('proposals')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', id);
    await get().fetchProposal(id);
  },

  // Phase 2: Versions
  fetchVersions: async (proposalId) => {
    const { data } = await supabase
      .from('proposal_versions')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('version_number', { ascending: false });
    set({ versions: (data as ProposalVersion[]) ?? [] });
  },

  createVersion: async (proposalId, summary) => {
    const proposal = get().currentProposal;
    if (!proposal) return;
    const versionNumber = (get().versions[0]?.version_number ?? 0) + 1;
    await supabase.from('proposal_versions').insert({
      proposal_id: proposalId,
      version_number: versionNumber,
      snapshot: proposal as unknown as Record<string, unknown>,
      change_summary: summary,
      created_by: proposal.created_by,
    });
    await supabase.from('proposals').update({ version: versionNumber }).eq('id', proposalId);
    await get().fetchVersions(proposalId);
  },

  // Phase 2: Comments
  fetchComments: async (proposalId) => {
    const { data } = await supabase
      .from('proposal_comments')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true });
    set({ comments: (data as ProposalComment[]) ?? [] });
  },

  addComment: async (proposalId, comment) => {
    await supabase.from('proposal_comments').insert({
      ...comment,
      proposal_id: proposalId,
    });
    await get().fetchComments(proposalId);
  },

  // Phase 3: Views
  fetchViews: async (proposalId) => {
    const { data } = await supabase
      .from('proposal_views')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('viewed_at', { ascending: false });
    set({ views: (data as ProposalView[]) ?? [] });
  },

  recordView: async (proposalId, duration) => {
    await supabase.from('proposal_views').insert({
      proposal_id: proposalId,
      duration_seconds: duration,
      ip_address: 'client',
      user_agent: navigator.userAgent,
    });
  },

  // Phase 2: Signature
  fetchSignature: async (proposalId) => {
    const { data } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('proposal_id', proposalId)
      .single();
    set({ signature: data as DigitalSignature | null });
  },

  signProposal: async (proposalId, data) => {
    await supabase.from('digital_signatures').insert({
      ...data,
      proposal_id: proposalId,
      user_agent: navigator.userAgent,
    });
    await get().fetchSignature(proposalId);
  },

  setBlocks: (blocks) => {
    const current = get().currentProposal;
    if (current) {
      set({ currentProposal: { ...current, blocks } });
    }
  },
}));
