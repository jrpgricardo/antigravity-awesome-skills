import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Save, Send, Eye } from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { useClientStore } from '@/stores/client-store';
import { useServiceStore } from '@/stores/service-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency, calculateItemTotal, calculateProposalTotals } from '@/utils/currency';
import { getPricingTypeName } from '@/utils/calculations';
import type { PricingType } from '@/types';

interface ItemRow {
  id: string;
  service_id: string | null;
  description: string;
  pricing_type: PricingType;
  unit_price: number;
  quantity: number;
  discount: number;
  total: number;
}

function newItemRow(): ItemRow {
  return {
    id: crypto.randomUUID(),
    service_id: null,
    description: '',
    pricing_type: 'fixed',
    unit_price: 0,
    quantity: 1,
    discount: 0,
    total: 0,
  };
}

export function ProposalBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentProposal, fetchProposal, createProposal, updateProposal, sendProposal } = useProposalStore();
  const { clients, fetchClients } = useClientStore();
  const { services, fetchServices } = useServiceStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [items, setItems] = useState<ItemRow[]>([newItemRow()]);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    fetchClients(true);
    fetchServices(true);
    if (id) fetchProposal(id);
  }, [id, fetchClients, fetchServices, fetchProposal]);

  useEffect(() => {
    if (currentProposal && isEditing) {
      setTitle(currentProposal.title);
      setDescription(currentProposal.description ?? '');
      setClientId(currentProposal.client_id);
      setValidUntil(currentProposal.valid_until ?? '');
      setDiscountPercentage(currentProposal.discount_percentage);
      setDiscountValue(currentProposal.discount_value);
      if (currentProposal.items && currentProposal.items.length > 0) {
        setItems(
          currentProposal.items.map((item) => ({
            id: item.id,
            service_id: item.service_id,
            description: item.description,
            pricing_type: item.pricing_type,
            unit_price: item.unit_price,
            quantity: item.quantity,
            discount: item.discount,
            total: item.total,
          }))
        );
      }
    }
  }, [currentProposal, isEditing]);

  const updateItem = (index: number, field: keyof ItemRow, value: string | number | null) => {
    setItems((prev) => {
      const updated = [...prev];
      (updated[index] as Record<string, unknown>)[field] = value;
      updated[index].total = calculateItemTotal(
        updated[index].unit_price,
        updated[index].quantity,
        updated[index].discount
      );
      return updated;
    });
  };

  const addItemFromService = (serviceId: string, index: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        service_id: service.id,
        description: service.name + (service.description ? ` - ${service.description}` : ''),
        pricing_type: service.pricing_type,
        unit_price: service.default_price,
        total: calculateItemTotal(service.default_price, updated[index].quantity, updated[index].discount),
      };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = calculateProposalTotals(items, discountPercentage, discountValue);

  const handleSave = async (andSend = false) => {
    if (!clientId || !title || items.length === 0) return;
    setIsSaving(true);

    const proposalData = {
      client_id: clientId,
      title,
      description: description || null,
      valid_until: validUntil || null,
      discount_percentage: discountPercentage,
      discount_value: discountValue,
      total_value: totals.totalValue,
      final_value: totals.finalValue,
      created_by: user?.id,
      organization_id: user?.organization_id,
    };

    const itemsData = items.map((item, index) => ({
      service_id: item.service_id,
      description: item.description,
      pricing_type: item.pricing_type,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount: item.discount,
      total: item.total,
      sort_order: index,
    }));

    if (isEditing && id) {
      await updateProposal(id, proposalData);
      // TODO: update items individually
      if (andSend) await sendProposal(id);
      navigate(`/proposals/${id}`);
    } else {
      const newId = await createProposal(proposalData, itemsData);
      if (newId) {
        if (andSend) await sendProposal(newId);
        navigate(`/proposals/${newId}`);
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Proposta' : 'Nova Proposta'}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/proposals')}>
            Cancelar
          </Button>
          <Button variant="ghost" onClick={() => handleSave(false)} isLoading={isSaving}>
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} isLoading={isSaving}>
            <Send className="w-4 h-4" />
            Salvar e Enviar
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card card-body space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Informacoes Basicas</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Titulo da Proposta"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Desenvolvimento de App Mobile"
            required
          />
          <Select
            label="Cliente"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            options={clients.map((c) => ({ value: c.id, label: c.company_name }))}
            placeholder="Selecione um cliente"
          />
        </div>
        <Textarea
          label="Descricao"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descricao geral da proposta..."
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Valida ate"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <Input
            label="Desconto (%)"
            type="number"
            value={discountPercentage.toString()}
            onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
          />
          <Input
            label="Desconto (R$)"
            type="number"
            value={discountValue.toString()}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Itens da Proposta</h2>
          <Button size="sm" variant="secondary" onClick={() => setItems([...items, newItemRow()])}>
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Servico / Descricao</th>
                <th className="w-32">Tipo</th>
                <th className="w-28">Preco Unit.</th>
                <th className="w-20">Qtd</th>
                <th className="w-20">Desc %</th>
                <th className="w-28 text-right">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  </td>
                  <td>
                    <div className="space-y-1">
                      <select
                        className="input text-xs"
                        value={item.service_id ?? ''}
                        onChange={(e) => addItemFromService(e.target.value, index)}
                      >
                        <option value="">Selecionar do catalogo...</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        className="input text-sm"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Descricao do item"
                      />
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-gray-500">
                      {getPricingTypeName(item.pricing_type)}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input text-sm"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input text-sm"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      min="0.01"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input text-sm"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                  <td>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.totalValue)}</span>
              </div>
              {(discountPercentage > 0 || discountValue > 0) && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(totals.totalValue - totals.finalValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(totals.finalValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
