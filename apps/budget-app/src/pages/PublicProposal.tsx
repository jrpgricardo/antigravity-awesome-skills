import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, MessageSquare, Download } from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import { getPricingTypeName } from '@/utils/calculations';

export function PublicProposal() {
  const { token } = useParams<{ token: string }>();
  const {
    currentProposal: proposal,
    comments,
    signature,
    fetchProposalByToken,
    markViewed,
    recordView,
    addComment,
    fetchComments,
    fetchSignature,
    signProposal,
    approveProposal,
    rejectProposal,
  } = useProposalStore();

  const viewStartRef = useRef(Date.now());
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showSignForm, setShowSignForm] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', content: '' });
  const [signForm, setSignForm] = useState({ signer_name: '', signer_email: '', ip_address: '' });

  useEffect(() => {
    if (token) {
      fetchProposalByToken(token);
    }
    return () => {
      if (proposal) {
        const duration = Math.round((Date.now() - viewStartRef.current) / 1000);
        recordView(proposal.id, duration);
      }
    };
  }, [token, fetchProposalByToken, recordView, proposal]);

  useEffect(() => {
    if (proposal) {
      markViewed(proposal.id);
      fetchComments(proposal.id);
      fetchSignature(proposal.id);
    }
  }, [proposal, markViewed, fetchComments, fetchSignature]);

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const org = proposal.organization;

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addComment(proposal.id, { ...commentForm, is_client: true });
    setCommentForm({ author_name: '', author_email: '', content: '' });
    setShowCommentForm(false);
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    await signProposal(proposal.id, signForm);
    await approveProposal(proposal.id);
    setShowSignForm(false);
  };

  const handleReject = async () => {
    if (confirm('Tem certeza que deseja rejeitar esta proposta?')) {
      await rejectProposal(proposal.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="py-8 px-6"
        style={{ backgroundColor: org?.primary_color ?? '#3B82F6' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              {org?.logo_url && (
                <img src={org.logo_url} alt={org.name} className="h-10 mb-3" />
              )}
              <h1 className="text-2xl font-bold text-white">{org?.name ?? 'Empresa'}</h1>
            </div>
            <StatusBadge status={proposal.status} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Proposal Info */}
        <div className="card card-body">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{proposal.title}</h2>
          <p className="text-sm text-gray-500 mb-4">
            Preparada para: <strong>{proposal.client?.company_name}</strong>
            {proposal.valid_until && (
              <> | Valida ate: {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}</>
            )}
          </p>
          {proposal.description && (
            <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
          )}
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Escopo e Valores</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Valor Unit.</th>
                <th>Qtd</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-medium text-gray-900">{item.description}</p>
                  </td>
                  <td className="text-gray-500">{getPricingTypeName(item.pricing_type)}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{item.quantity}</td>
                  <td className="text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-200 px-6 py-6">
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
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
                <div className="flex justify-between text-2xl font-bold border-t pt-3">
                  <span>Total</span>
                  <span style={{ color: org?.primary_color ?? '#3B82F6' }}>
                    {formatCurrency(proposal.final_value)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold">Comentarios</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowCommentForm(!showCommentForm)}>
              <MessageSquare className="w-4 h-4" />
              Comentar
            </Button>
          </div>
          {showCommentForm && (
            <form onSubmit={handleComment} className="px-6 py-4 border-b space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Seu nome"
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Seu email"
                  type="email"
                  value={commentForm.author_email}
                  onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                  required
                />
              </div>
              <Textarea
                placeholder="Seu comentario..."
                value={commentForm.content}
                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                required
              />
              <Button size="sm" type="submit">Enviar Comentario</Button>
            </form>
          )}
          <div className="divide-y divide-gray-100">
            {comments.map((c) => (
              <div key={c.id} className="px-6 py-3">
                <p className="text-xs font-medium text-gray-600">{c.author_name}</p>
                <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature / Actions */}
        {proposal.status !== 'approved' && proposal.status !== 'rejected' && (
          <div className="card card-body text-center space-y-4">
            {signature ? (
              <div className="text-emerald-600">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Assinada por {signature.signer_name}</p>
                <p className="text-sm text-gray-500">
                  em {new Date(signature.signed_at).toLocaleString('pt-BR')}
                </p>
              </div>
            ) : showSignForm ? (
              <form onSubmit={handleSign} className="max-w-md mx-auto space-y-3">
                <h3 className="text-lg font-semibold">Assinar e Aprovar Proposta</h3>
                <Input
                  placeholder="Seu nome completo"
                  value={signForm.signer_name}
                  onChange={(e) => setSignForm({ ...signForm, signer_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Seu email"
                  type="email"
                  value={signForm.signer_email}
                  onChange={(e) => setSignForm({ ...signForm, signer_email: e.target.value })}
                  required
                />
                <div className="flex gap-3 justify-center">
                  <Button type="submit" variant="success">
                    <CheckCircle className="w-4 h-4" />
                    Assinar e Aprovar
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowSignForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Button variant="success" size="lg" onClick={() => setShowSignForm(true)}>
                  <CheckCircle className="w-5 h-5" />
                  Aprovar Proposta
                </Button>
                <Button variant="danger" size="lg" onClick={handleReject}>
                  <XCircle className="w-5 h-5" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4">
          Proposta gerada por PropostaApp | {org?.email}
          {org?.phone && ` | ${org.phone}`}
        </footer>
      </div>
    </div>
  );
}
