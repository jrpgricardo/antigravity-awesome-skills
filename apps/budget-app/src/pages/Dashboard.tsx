import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentOrganization } from '@/lib/supabase';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PROPOSAL_STATUSES } from '@/lib/constants';
import { formatCurrency } from '@/utils/currency';
import { FileText, Users, Briefcase, TrendingUp } from 'lucide-react';

export function Dashboard() {
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

  const metrics = {
    total: proposals.length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    pending: proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length,
    totalValue: proposals
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + p.total_value, 0),
  };

  const conversionRate = metrics.total > 0 ? (metrics.approved / metrics.total) * 100 : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas propostas e métricas</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Propostas</p>
                <p className="text-3xl font-bold mt-1">{metrics.total}</p>
              </div>
              <FileText className="text-primary-600" size={40} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{metrics.approved}</p>
              </div>
              <TrendingUp className="text-green-600" size={40} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{metrics.pending}</p>
              </div>
              <FileText className="text-yellow-600" size={40} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <TrendingUp className="text-primary-600" size={40} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Ações Rápidas</h2>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Link to="/proposals/new">
              <Button>Nova Proposta</Button>
            </Link>
            <Link to="/clients">
              <Button variant="secondary">Gerenciar Clientes</Button>
            </Link>
            <Link to="/services">
              <Button variant="secondary">Catálogo de Serviços</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Propostas Recentes</h2>
        </CardHeader>
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
                    <th className="text-left py-3 px-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.slice(0, 10).map((proposal) => (
                    <tr key={proposal.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/proposals/${proposal.id}/edit`}
                          className="text-primary-600 hover:underline"
                        >
                          {proposal.title}
                        </Link>
                      </td>
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
                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
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
