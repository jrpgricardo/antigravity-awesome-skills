import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCurrentOrganization } from '@/lib/supabase';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useProposals } from '@/hooks/useProposals';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ProposalItemRow } from '@/components/proposals/ProposalItemRow';
import { proposalSchema } from '@/utils/validators';
import { calculateProposalTotal } from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { Plus } from 'lucide-react';
import type { ProposalFormData, ProposalItemFormData, PricingType } from '@/types';

export function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { clients } = useClients(organizationId);
  const { services } = useServices(organizationId);
  const { createProposal, updateProposal, getProposalWithItems } = useProposals(organizationId);
  const [items, setItems] = useState<ProposalItemFormData[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      client_id: '',
      valid_until: '',
      introduction: '',
      terms: '',
      notes: '',
      items: [],
    },
  });

  useEffect(() => {
    getCurrentOrganization().then((org) => {
      if (org) setOrganizationId(org.id);
    });
  }, []);

  useEffect(() => {
    if (id && organizationId) {
      loadProposal();
    }
  }, [id, organizationId]);

  useEffect(() => {
    setValue('items', items);
  }, [items, setValue]);

  const loadProposal = async () => {
    if (!id) return;
    try {
      const proposal = await getProposalWithItems(id);
      setValue('title', proposal.title);
      setValue('client_id', proposal.client_id);
      setValue('valid_until', proposal.valid_until || '');
      setValue('introduction', proposal.introduction || '');
      setValue('terms', proposal.terms || '');
      setValue('notes', proposal.notes || '');
      setItems(proposal.items || []);
    } catch (error) {
      console.error('Error loading proposal:', error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        pricing_type: 'fixed',
        unit_price: 0,
        quantity: 1,
        discount: 0,
      },
    ]);
  };

  const addServiceAsItem = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    setItems([
      ...items,
      {
        service_id: serviceId,
        description: service.name,
        pricing_type: service.pricing_type,
        unit_price: service.default_price,
        quantity: 1,
        discount: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof ProposalItemFormData, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (!user || items.length === 0) return;

    setLoading(true);
    try {
      const proposalData = {
        ...data,
        items,
      };

      if (id) {
        await updateProposal(id, proposalData);
      } else {
        await createProposal(proposalData, user.id);
      }

      navigate('/proposals');
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Erro ao salvar proposta. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateProposalTotal(items);

  const clientOptions = [
    { value: '', label: 'Selecione um cliente' },
    ...clients.map((c) => ({ value: c.id, label: c.company_name })),
  ];

  const serviceOptions = [
    { value: '', label: 'Selecione um serviço' },
    ...services.filter((s) => s.active).map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {id ? 'Editar Proposta' : 'Nova Proposta'}
        </h1>
        <p className="text-gray-600">
          {id ? 'Edite as informações da proposta' : 'Crie uma nova proposta comercial para seu cliente'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-6xl">
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Informações Básicas</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Título da Proposta *"
                  {...register('title')}
                  placeholder="Ex: Desenvolvimento de Site Institucional"
                  error={errors.title?.message}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="client_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Cliente *"
                        {...field}
                        options={clientOptions}
                        error={errors.client_id?.message}
                      />
                    )}
                  />
                  <Input
                    type="date"
                    label="Válido até"
                    {...register('valid_until')}
                    error={errors.valid_until?.message}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Itens da Proposta</h2>
                <div className="flex gap-2">
                  <Select
                    options={serviceOptions}
                    onChange={(e) => {
                      if (e.target.value) {
                        addServiceAsItem(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="min-w-[200px]"
                  />
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus size={18} className="mr-1" />
                    Item Customizado
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum item adicionado. Adicione itens do catálogo ou crie items customizados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-2">Descrição</th>
                        <th className="text-left py-3 px-2">Tipo</th>
                        <th className="text-left py-3 px-2">Preço Unit.</th>
                        <th className="text-left py-3 px-2">Qtd</th>
                        <th className="text-left py-3 px-2">Desc. (%)</th>
                        <th className="text-right py-3 px-2">Total</th>
                        <th className="py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <ProposalItemRow
                          key={index}
                          item={item}
                          index={index}
                          onChange={updateItem}
                          onRemove={removeItem}
                        />
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={5} className="text-right py-4 px-2 font-bold text-lg">
                          Valor Total:
                        </td>
                        <td className="text-right py-4 px-2 font-bold text-xl text-primary-600">
                          {formatCurrency(total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              {errors.items && (
                <p className="mt-2 text-sm text-red-600">{errors.items.message}</p>
              )}
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Detalhes Adicionais</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Textarea
                  label="Introdução"
                  {...register('introduction')}
                  rows={4}
                  placeholder="Texto introdutório da proposta..."
                  error={errors.introduction?.message}
                />
                <Textarea
                  label="Termos e Condições"
                  {...register('terms')}
                  rows={4}
                  placeholder="Termos e condições da proposta..."
                  error={errors.terms?.message}
                />
                <Textarea
                  label="Observações Internas"
                  {...register('notes')}
                  rows={3}
                  placeholder="Notas internas (não aparecem na proposta para o cliente)..."
                  error={errors.notes?.message}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/proposals')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? 'Salvando...' : id ? 'Atualizar Proposta' : 'Criar Proposta'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
