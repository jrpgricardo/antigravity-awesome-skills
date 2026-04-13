import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generatePublicToken } from '@/utils/calculations';
import type { Proposal, ProposalFormData, ProposalItem } from '@/types';

export function useProposals(organizationId: string | null) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    fetchProposals();
  }, [organizationId]);

  const fetchProposals = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: ProposalFormData, createdBy: string) => {
    if (!organizationId) throw new Error('No organization ID');

    // Calculate total from items
    const total = proposalData.items.reduce((sum, item) => {
      const itemTotal = item.unit_price * item.quantity * (1 - item.discount / 100);
      return sum + itemTotal;
    }, 0);

    // Create proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        organization_id: organizationId,
        client_id: proposalData.client_id,
        title: proposalData.title,
        status: 'draft',
        total_value: total,
        valid_until: proposalData.valid_until,
        introduction: proposalData.introduction,
        terms: proposalData.terms,
        notes: proposalData.notes,
        public_token: generatePublicToken(),
        created_by: createdBy,
      })
      .select()
      .single();

    if (proposalError) throw proposalError;

    // Create proposal items
    const itemsToInsert = proposalData.items.map((item, index) => ({
      proposal_id: proposal.id,
      service_id: item.service_id,
      description: item.description,
      pricing_type: item.pricing_type,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount: item.discount,
      total: item.unit_price * item.quantity * (1 - item.discount / 100),
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('proposal_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    await fetchProposals();
    return proposal;
  };

  const updateProposal = async (
    id: string,
    proposalData: Partial<ProposalFormData>
  ) => {
    const { data, error } = await supabase
      .from('proposals')
      .update(proposalData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchProposals();
    return data;
  };

  const updateProposalStatus = async (id: string, status: Proposal['status']) => {
    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchProposals();
    return data;
  };

  const deleteProposal = async (id: string) => {
    // Delete items first (cascade)
    await supabase
      .from('proposal_items')
      .delete()
      .eq('proposal_id', id);

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchProposals();
  };

  const getProposalWithItems = async (id: string) => {
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(*),
        items:proposal_items(
          *,
          service:service_catalog(*)
        )
      `)
      .eq('id', id)
      .single();

    if (proposalError) throw proposalError;
    return proposal;
  };

  const getPublicProposal = async (token: string) => {
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(*),
        items:proposal_items(*)
      `)
      .eq('public_token', token)
      .single();

    if (proposalError) throw proposalError;

    // Mark as viewed if not already
    if (proposal.status === 'sent') {
      await supabase
        .from('proposals')
        .update({ status: 'viewed' })
        .eq('id', proposal.id);
    }

    return proposal;
  };

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    updateProposalStatus,
    deleteProposal,
    getProposalWithItems,
    getPublicProposal,
    refetch: fetchProposals,
  };
}
