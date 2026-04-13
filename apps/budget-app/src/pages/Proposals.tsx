import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Eye, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';
import type { ProposalStatus } from '@/types';

const statusFilters: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'viewed', label: 'Visualizadas' },
  { value: 'approved', label: 'Aprovadas' },
  { value: 'rejected', label: 'Rejeitadas' },
  { value: 'expired', label: 'Expiradas' },
];

export function Proposals() {
  const { proposals, isLoading, fetchProposals, deleteProposal } = useProposalStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProposals(statusFilter ? { status: statusFilter as ProposalStatus } : undefined);
  }, [fetchProposals, statusFilter]);

  const filtered = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta proposta?')) {
      await deleteProposal(id);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
        <Link to="/proposals/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      <div className="card">
        <div className="card-header flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar propostas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-1">
            {statusFilters.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  statusFilter === sf.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma proposta encontrada"
            description="Crie sua primeira proposta comercial."
            action={
              <Link to="/proposals/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Criar Proposta
                </Button>
              </Link>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Proposta</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proposal) => (
                <tr key={proposal.id}>
                  <td>
                    <Link
                      to={`/proposals/${proposal.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {proposal.title}
                    </Link>
                    {proposal.version > 1 && (
                      <span className="ml-2 text-xs text-gray-400">v{proposal.version}</span>
                    )}
                  </td>
                  <td className="text-gray-600">
                    {proposal.client?.company_name ?? '-'}
                  </td>
                  <td className="font-medium">{formatCurrency(proposal.final_value)}</td>
                  <td>
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="text-gray-500 text-xs">
                    {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/proposals/${proposal.id}`}>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => copyLink(proposal.public_token)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                        title="Copiar link publico"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`/p/${proposal.public_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
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
    </div>
  );
}
