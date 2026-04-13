import { useEffect, useState } from 'react';
import { getCurrentOrganization } from '@/lib/supabase';
import { useServices } from '@/hooks/useServices';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ServiceModal } from '@/components/services/ServiceModal';
import { formatCurrency } from '@/utils/currency';
import { PRICING_TYPES } from '@/lib/constants';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { ServiceCatalog, ServiceFormData } from '@/types';

export function ServiceCatalog() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { services, loading, createService, updateService, deleteService } = useServices(organizationId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalog | null>(null);

  useEffect(() => {
    getCurrentOrganization().then((org) => {
      if (org) setOrganizationId(org.id);
    });
  }, []);

  const handleCreateService = async (data: ServiceFormData) => {
    await createService(data);
  };

  const handleUpdateService = async (data: ServiceFormData) => {
    if (editingService) {
      await updateService(editingService.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteService(id);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceCatalog) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Catálogo de Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos pela sua empresa</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={20} className="mr-2" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <CardBody>
          {services.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum serviço cadastrado. Clique em "Novo Serviço" para começar.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.category}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{service.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-gray-600">
                        {PRICING_TYPES[service.pricing_type]}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(service.default_price)}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => openEditModal(service)}
                      >
                        <Edit size={16} className="mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        service={editingService}
      />
    </div>
  );
}
