import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';
import { PRICING_TYPES, PROPOSAL_STATUSES } from '@/lib/constants';
import { ProposalPDF } from '@/lib/pdf-generator';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import type { Proposal, ProposalItem } from '@/types';

export function PublicProposal() {
  const { token } = useParams<{ token: string }>();
  const { getPublicProposal, updateProposalStatus } = useProposals(null);
  const [proposal, setProposal] = useState<(Proposal & { items: ProposalItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadProposal();
    }
  }, [token]);

  const loadProposal = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await getPublicProposal(token);
      setProposal(data);
    } catch (err: any) {
      setError(err.message || 'Proposta não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!proposal) return;

    try {
      const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proposta-${proposal.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleApprove = async () => {
    if (!proposal || !confirm('Confirma a aprovação desta proposta?')) return;

    try {
      await updateProposalStatus(proposal.id, 'approved');
      await loadProposal();
      alert('Proposta aprovada com sucesso!');
    } catch (error) {
      console.error('Error approving proposal:', error);
      alert('Erro ao aprovar proposta. Tente novamente.');
    }
  };

  const handleReject = async () => {
    if (!proposal || !confirm('Confirma a rejeição desta proposta?')) return;

    try {
      await updateProposalStatus(proposal.id, 'rejected');
      await loadProposal();
      alert('Proposta rejeitada.');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Erro ao rejeitar proposta. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Carregando proposta...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody>
            <div className="text-center py-8">
              <XCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Proposta não encontrada</h2>
              <p className="text-gray-600">{error || 'Link inválido ou expirado.'}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const canApprove = !['approved', 'rejected'].includes(proposal.status) && !isExpired;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
              <p className="text-gray-600">Proposta Comercial</p>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <span>
                  Data: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                </span>
                {proposal.valid_until && (
                  <span>
                    Válido até: {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded ${
                    proposal.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : proposal.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {PROPOSAL_STATUSES[proposal.status].label}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Informações do Cliente</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Empresa</p>
                <p className="font-medium">{proposal.client?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contato</p>
                <p className="font-medium">{proposal.client?.contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{proposal.client?.email}</p>
              </div>
              {proposal.client?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{proposal.client.phone}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {proposal.introduction && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Introdução</h2>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-wrap">{proposal.introduction}</p>
            </CardBody>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Itens da Proposta</h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4">Descrição</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-right py-3 px-4">Valor Unit.</th>
                    <th className="text-right py-3 px-4">Qtd</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {PRICING_TYPES[item.pricing_type]}
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={4} className="text-right py-4 px-4 font-bold text-lg">
                      Valor Total:
                    </td>
                    <td className="text-right py-4 px-4 font-bold text-2xl text-primary-600">
                      {formatCurrency(proposal.total_value)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardBody>
        </Card>

        {proposal.terms && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Termos e Condições</h2>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-wrap">{proposal.terms}</p>
            </CardBody>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download size={20} className="mr-2" />
            Baixar PDF
          </Button>
          {canApprove && (
            <>
              <Button variant="danger" onClick={handleReject}>
                <XCircle size={20} className="mr-2" />
                Rejeitar
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle size={20} className="mr-2" />
                Aprovar Proposta
              </Button>
            </>
          )}
        </div>

        {isExpired && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">
              Esta proposta expirou em {new Date(proposal.valid_until!).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
