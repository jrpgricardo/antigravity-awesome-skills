import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSignature, Plus, Search, Eye } from 'lucide-react';
import { useContractStore } from '@/stores/contract-store';
import { useProposalStore } from '@/stores/proposal-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';

export function Contracts() {
  const { user } = useAuthStore();
  const { contracts, isLoading, fetchContracts, createContract } = useContractStore();
  const { proposals, fetchProposals } = useProposalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    proposal_id: '',
    title: '',
    start_date: '',
    end_date: '',
    payment_terms: '',
    delivery_terms: '',
  });

  useEffect(() => {
    fetchContracts();
    fetchProposals({ status: 'approved' });
  }, [fetchContracts, fetchProposals]);

  const filtered = contracts.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proposal = proposals.find((p) => p.id === form.proposal_id);
    await createContract({
      proposal_id: form.proposal_id,
      client_id: proposal?.client_id,
      organization_id: user?.organization_id,
      title: form.title,
      start_date: form.start_date,
      end_date: form.end_date || null,
      total_value: proposal?.final_value ?? 0,
      terms: {
        payment_terms: form.payment_terms,
        delivery_terms: form.delivery_terms,
        warranty_terms: '',
        cancellation_terms: '',
        custom_clauses: [],
      },
      created_by: user?.id,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Contrato
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar contratos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileSignature} title="Nenhum contrato" description="Crie contratos a partir de propostas aprovadas." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Inicio</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contract) => (
                <tr key={contract.id}>
                  <td className="font-medium text-gray-900">{contract.title}</td>
                  <td>{contract.client?.company_name ?? '-'}</td>
                  <td className="font-medium">{formatCurrency(contract.total_value)}</td>
                  <td><StatusBadge status={contract.status} /></td>
                  <td className="text-xs text-gray-500">{new Date(contract.start_date).toLocaleDateString('pt-BR')}</td>
                  <td className="text-right">
                    <Link to={`/contracts/${contract.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Contrato" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Proposta Aprovada"
            value={form.proposal_id}
            onChange={(e) => setForm({ ...form, proposal_id: e.target.value })}
            options={proposals.filter((p) => p.status === 'approved').map((p) => ({ value: p.id, label: `${p.title} - ${formatCurrency(p.final_value)}` }))}
            placeholder="Selecione uma proposta"
          />
          <Input label="Titulo do Contrato" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Inicio" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            <Input label="Data de Fim" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Textarea label="Termos de Pagamento" value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
          <Textarea label="Termos de Entrega" value={form.delivery_terms} onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Contrato</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
