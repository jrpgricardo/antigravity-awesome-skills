import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { useClientStore } from '@/stores/client-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useNotificationStore } from '@/stores/notification-store';
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency';
import { conversionRate } from '@/utils/calculations';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Proposal } from '@/types';

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="card card-body">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { proposals, fetchProposals } = useProposalStore();
  const { clients, fetchClients } = useClientStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { activities, fetchActivities } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProposals(),
      fetchClients(),
      fetchInvoices(),
      fetchActivities({ limit: 10 }),
    ]).then(() => setIsLoading(false));
  }, [fetchProposals, fetchClients, fetchInvoices, fetchActivities]);

  const approved = proposals.filter((p) => p.status === 'approved').length;
  const sent = proposals.filter((p) => ['sent', 'viewed', 'approved', 'rejected'].includes(p.status)).length;
  const pipelineValue = proposals
    .filter((p) => ['sent', 'viewed'].includes(p.status))
    .reduce((sum, p) => sum + p.final_value, 0);
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const recentProposals = proposals.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/proposals/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={FileText}
          label="Total de Propostas"
          value={proposals.length.toString()}
          subValue={`${sent} enviadas`}
          color="bg-blue-500"
        />
        <MetricCard
          icon={CheckCircle}
          label="Taxa de Conversao"
          value={`${conversionRate(approved, sent)}%`}
          subValue={`${approved} aprovadas`}
          color="bg-emerald-500"
        />
        <MetricCard
          icon={TrendingUp}
          label="Pipeline"
          value={formatCurrencyCompact(pipelineValue)}
          subValue="em negociacao"
          color="bg-purple-500"
        />
        <MetricCard
          icon={DollarSign}
          label="Receita Total"
          value={formatCurrencyCompact(totalRevenue)}
          subValue={`${clients.length} clientes`}
          color="bg-amber-500"
        />
      </div>

      {/* Recent Proposals & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Propostas Recentes</h3>
            <Link to="/proposals" className="text-sm text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProposals.map((proposal: Proposal) => (
              <Link
                key={proposal.id}
                to={`/proposals/${proposal.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {proposal.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {proposal.client?.company_name ?? 'Cliente'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(proposal.final_value)}
                  </span>
                  <StatusBadge status={proposal.status} />
                </div>
              </Link>
            ))}
            {recentProposals.length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-500 text-center">
                Nenhuma proposta ainda. Crie sua primeira!
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Atividade Recente</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="px-6 py-3">
                <p className="text-sm text-gray-700">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-500 text-center">
                Nenhuma atividade recente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card card-body flex items-center gap-3">
          <Eye className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {proposals.filter((p) => p.status === 'viewed').length} Visualizadas
            </p>
            <p className="text-xs text-gray-500">Aguardando resposta</p>
          </div>
        </div>
        <div className="card card-body flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {proposals.filter((p) => p.status === 'draft').length} Rascunhos
            </p>
            <p className="text-xs text-gray-500">Para completar</p>
          </div>
        </div>
        <div className="card card-body flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {invoices.filter((i) => i.status === 'overdue').length} Faturas Atrasadas
            </p>
            <p className="text-xs text-gray-500">Necessitam atencao</p>
          </div>
        </div>
      </div>
    </div>
  );
}
