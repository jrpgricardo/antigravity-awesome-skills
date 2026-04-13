import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProposalStore } from '@/stores/proposal-store';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import type { ProposalStatus, Proposal } from '@/types';

const columns: { status: ProposalStatus; label: string; color: string }[] = [
  { status: 'draft', label: 'Rascunho', color: 'border-gray-300' },
  { status: 'sent', label: 'Enviadas', color: 'border-blue-400' },
  { status: 'viewed', label: 'Visualizadas', color: 'border-purple-400' },
  { status: 'approved', label: 'Aprovadas', color: 'border-emerald-400' },
  { status: 'rejected', label: 'Rejeitadas', color: 'border-red-400' },
];

function PipelineCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-900 truncate">{proposal.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{proposal.client?.company_name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-blue-600">
            {formatCurrency(proposal.final_value)}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Pipeline() {
  const { proposals, fetchProposals } = useProposalStore();

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const getProposalsByStatus = (status: ProposalStatus) =>
    proposals.filter((p) => p.status === status);

  const getColumnTotal = (status: ProposalStatus) =>
    getProposalsByStatus(status).reduce((sum, p) => sum + p.final_value, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const items = getProposalsByStatus(col.status);
          return (
            <div key={col.status} className="flex-shrink-0 w-72">
              <div className={`border-t-2 ${col.color} rounded-t-lg`}>
                <div className="bg-white px-4 py-3 rounded-t-lg border-x border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{col.label}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(getColumnTotal(col.status))}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-b-lg border-x border-b border-gray-200 space-y-2 min-h-[200px]">
                {items.map((proposal) => (
                  <PipelineCard key={proposal.id} proposal={proposal} />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">Nenhuma proposta</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
