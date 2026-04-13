import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ServiceCatalog, ServiceFormData } from '@/types';

export function useServices(organizationId: string | null) {
  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    fetchServices();
  }, [organizationId]);

  const fetchServices = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      setServices(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: ServiceFormData) => {
    if (!organizationId) throw new Error('No organization ID');

    const { data, error } = await supabase
      .from('service_catalog')
      .insert({
        ...serviceData,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchServices();
    return data;
  };

  const updateService = async (id: string, serviceData: Partial<ServiceFormData>) => {
    const { data, error } = await supabase
      .from('service_catalog')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchServices();
    return data;
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('service_catalog')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchServices();
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
}
