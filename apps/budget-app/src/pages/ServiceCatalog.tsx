import { useEffect, useState } from 'react';
import { getCurrentOrganization } from '@/lib/supabase';
import { useServices } from '@/hooks/useServices';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';
import { PRICING_TYPES } from '@/lib/constants';
import { Plus } from 'lucide-react';

export function ServiceCatalog() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { services, loading } = useServices(organizationId);

  useEffect(() => {
    getCurrentOrganization().then((org) => {
      if (org) setOrganizationId(org.id);
    });
  }, []);

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
        <Button>
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
                <Card key={service.id} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
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
                    <p className="text-sm text-gray-700 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {PRICING_TYPES[service.pricing_type]}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(service.default_price)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
