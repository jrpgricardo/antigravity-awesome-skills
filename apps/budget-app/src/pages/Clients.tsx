import { useEffect, useState } from 'react';
import { getCurrentOrganization } from '@/lib/supabase';
import { useClients } from '@/hooks/useClients';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function Clients() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { clients, loading } = useClients(organizationId);

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
          <h1 className="text-3xl font-bold mb-2">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e informações de contato</p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardBody>
          {clients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Empresa</th>
                    <th className="text-left py-3 px-4">Contato</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Telefone</th>
                    <th className="text-left py-3 px-4">CNPJ</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{client.company_name}</td>
                      <td className="py-3 px-4">{client.contact_name}</td>
                      <td className="py-3 px-4">{client.email}</td>
                      <td className="py-3 px-4">{client.phone || '-'}</td>
                      <td className="py-3 px-4">{client.cnpj || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
