import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Edit2, Send, CheckCircle, XCircle, Copy, ExternalLink,
  Clock, MessageSquare, History, Eye,
} from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import { getPricingTypeName, daysUntil } from '@/utils/calculations';

export function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentProposal: proposal,
    versions,
    comments,
    views,
    fetchProposal,
    fetchVersions,
    fetchComments,
    fetchViews,
    sendProposal,
    approveProposal,
    rejectProposal,
    createVersion,
  } = useProposalStore();

  useEffect(() => {
    if (id) {
      fetchProposal(id);
      fetchVersions(id);
      fetchComments(id);
      fetchViews(id);
    }
  }, [id, fetchProposal, fetchVersions, fetchComments, fetchViews]);

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const daysLeft = proposal.valid_until ? daysUntil(proposal.valid_until) : null;

  const handleSend = async () => {
    await sendProposal(proposal.id);
  };

  const handleApprove = async () => {
    await approveProposal(proposal.id);
  };

  const handleReject = async () => {
    await rejectProposal(proposal.id);
  };

  const handleCreateVersion = async () => {
    await createVersion(proposal.id, 'Nova versao');
  };

  const copyLink = () => {
    const url = `${window.location.origin}/p/${proposal.public_token}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {proposal.client?.company_name} | Criada em{' '}
            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
            {proposal.version > 1 && ` | Versao ${proposal.version}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/proposals/${proposal.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit2 className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          {proposal.status === 'draft' && (
            <Button size="sm" onClick={handleSend}>
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={copyLink}>
            <Copy className="w-4 h-4" />
            Link
          </Button>
          <a href={`/p/${proposal.public_token}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
              Visualizar
            </Button>
          </a>
        </div>
      </div>

      {/* Validity Warning */}
      {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
          <Clock className="w-4 h-4" />
          Esta proposta expira em {daysLeft} dia(s)
        </div>
      )}
      {daysLeft !== null && daysLeft < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <Clock className="w-4 h-4" />
          Esta proposta expirou ha {Math.abs(daysLeft)} dia(s)
        </div>
      )}

      {/* Description */}
      {proposal.description && (
        <div className="card card-body">
          <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
        </div>
      )}

      {/* Items Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-900">Itens da Proposta</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Descricao</th>
              <th>Tipo</th>
              <th>Preco Unit.</th>
              <th>Quantidade</th>
              <th>Desconto</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposal.items?.map((item, index) => (
              <tr key={item.id}>
                <td className="text-gray-400">{index + 1}</td>
                <td className="font-medium">{item.description}</td>
                <td className="text-gray-500">{getPricingTypeName(item.pricing_type)}</td>
                <td>{formatCurrency(item.unit_price)}</td>
                <td>{item.quantity}</td>
                <td>{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                <td className="text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(proposal.total_value)}</span>
              </div>
              {(proposal.discount_percentage > 0 || proposal.discount_value > 0) && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(proposal.total_value - proposal.final_value)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(proposal.final_value)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Versions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4" /> Versoes
            </h3>
            <Button size="sm" variant="ghost" onClick={handleCreateVersion}>
              Nova Versao
            </Button>
          </div>
          <div className="divide-y divide-gray-100">
            {versions.map((v) => (
              <div key={v.id} className="px-6 py-3">
                <p className="text-sm font-medium">Versao {v.version_number}</p>
                <p className="text-xs text-gray-500">
                  {new Date(v.created_at).toLocaleDateString('pt-BR')} - {v.change_summary}
                </p>
              </div>
            ))}
            {versions.length === 0 && (
              <p className="px-6 py-4 text-xs text-gray-400">Nenhuma versao anterior</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comentarios
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {comments.map((c) => (
              <div key={c.id} className="px-6 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium">{c.author_name}</p>
                  {c.is_client && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Cliente</span>}
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="px-6 py-4 text-xs text-gray-400">Nenhum comentario</p>
            )}
          </div>
        </div>

        {/* Views */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" /> Visualizacoes ({views.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {views.slice(0, 10).map((v) => (
              <div key={v.id} className="px-6 py-3">
                <p className="text-xs text-gray-500">
                  {new Date(v.viewed_at).toLocaleString('pt-BR')} - {v.duration_seconds}s
                </p>
              </div>
            ))}
            {views.length === 0 && (
              <p className="px-6 py-4 text-xs text-gray-400">Nenhuma visualizacao</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {['sent', 'viewed'].includes(proposal.status) && (
        <div className="card card-body flex items-center justify-center gap-4">
          <Button variant="success" onClick={handleApprove}>
            <CheckCircle className="w-4 h-4" />
            Marcar como Aprovada
          </Button>
          <Button variant="danger" onClick={handleReject}>
            <XCircle className="w-4 h-4" />
            Marcar como Rejeitada
          </Button>
        </div>
      )}
    </div>
  );
}
