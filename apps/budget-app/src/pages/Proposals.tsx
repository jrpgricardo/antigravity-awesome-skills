import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentOrganization } from '@/lib/supabase';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PROPOSAL_STATUSES } from '@/lib/constants';
import { formatCurrency } from '@/utils/currency';
import { Plus } from 'lucide-react';

export function Proposals() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { proposals, loading } = useProposals(organizationId);

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
          <h1 className="text-3xl font-bold mb-2">Propostas</h1>
          <p className="text-gray-600">Gerencie todas as suas propostas comerciais</p>
        </div>
        <Link to="/proposals/new">
          <Button>
            <Plus size={20} className="mr-2" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      <Card>
        <CardBody>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma proposta criada ainda.{' '}
              <Link to="/proposals/new" className="text-primary-600 hover:underline">
                Criar primeira proposta
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Título</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Validade</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal) => (
                    <tr key={proposal.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{proposal.title}</td>
                      <td className="py-3 px-4">{proposal.client?.company_name}</td>
                      <td className="py-3 px-4">{formatCurrency(proposal.total_value)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            proposal.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : proposal.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : proposal.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {PROPOSAL_STATUSES[proposal.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {proposal.valid_until
                          ? new Date(proposal.valid_until).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/proposals/${proposal.id}/edit`}
                          className="text-primary-600 hover:underline"
                        >
                          Editar
                        </Link>
                      </td>
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
