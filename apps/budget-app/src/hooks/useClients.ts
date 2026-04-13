import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, ClientFormData } from '@/types';

export function useClients(organizationId: string | null) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    fetchClients();
  }, [organizationId]);

  const fetchClients = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organizationId)
        .order('company_name');

      if (error) throw error;
      setClients(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: ClientFormData) => {
    if (!organizationId) throw new Error('No organization ID');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchClients();
    return data;
  };

  const updateClient = async (id: string, clientData: Partial<ClientFormData>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchClients();
    return data;
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchClients();
  };

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}
