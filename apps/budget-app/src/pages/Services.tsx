import { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useServiceStore } from '@/stores/service-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';
import { getPricingTypeName, getUnitLabel } from '@/utils/calculations';
import type { PricingType, ServiceCatalogItem } from '@/types';

const pricingOptions = [
  { value: 'hourly', label: 'Por Hora' },
  { value: 'fixed', label: 'Preco Fixo' },
  { value: 'monthly_retainer', label: 'Retainer Mensal' },
  { value: 'per_sprint', label: 'Por Sprint' },
  { value: 'custom', label: 'Personalizado' },
];

export function Services() {
  const { services, categories, isLoading, fetchServices, createService, updateService, deleteService } = useServiceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: '',
    pricing_type: 'fixed' as PricingType,
    default_price: 0,
    unit_label: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCategory = !filterCategory || s.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const resetForm = () => {
    setForm({
      name: '', category: '', pricing_type: 'fixed', default_price: 0,
      unit_label: '', description: '', is_active: true,
    });
    setEditingService(null);
  };

  const openEdit = (service: ServiceCatalogItem) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      pricing_type: service.pricing_type,
      default_price: service.default_price,
      unit_label: service.unit_label ?? '',
      description: service.description ?? '',
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      await updateService(editingService.id, form);
    } else {
      await createService(form);
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogo de Servicos</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Novo Servico
        </Button>
      </div>

      <div className="card">
        <div className="card-header flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-48"
          >
            <option value="">Todas categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum servico cadastrado"
            description="Crie seu catalogo de servicos para usar nas propostas."
            action={
              <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Adicionar Servico
              </Button>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Servico</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Preco</th>
                <th>Status</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge>{service.category}</Badge>
                  </td>
                  <td className="text-gray-600">{getPricingTypeName(service.pricing_type)}</td>
                  <td className="font-medium">
                    {formatCurrency(service.default_price)}
                    <span className="text-xs text-gray-400 ml-1">
                      /{service.unit_label || getUnitLabel(service.pricing_type)}
                    </span>
                  </td>
                  <td>
                    <Badge variant={service.is_active ? 'active' : 'cancelled'}>
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(service)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteService(service.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Servico' : 'Novo Servico'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Servico"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Desenvolvimento de API"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Categoria"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ex: Desenvolvimento"
              required
            />
            <Select
              label="Tipo de Preco"
              value={form.pricing_type}
              onChange={(e) => setForm({ ...form, pricing_type: e.target.value as PricingType })}
              options={pricingOptions}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preco Padrao"
              type="number"
              value={form.default_price.toString()}
              onChange={(e) => setForm({ ...form, default_price: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
            <Input
              label="Unidade"
              value={form.unit_label}
              onChange={(e) => setForm({ ...form, unit_label: e.target.value })}
              placeholder={getUnitLabel(form.pricing_type)}
            />
          </div>
          <Textarea
            label="Descricao"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descricao detalhada do servico..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingService ? 'Salvar' : 'Criar Servico'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
