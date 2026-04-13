import { useEffect, useState } from 'react';
import { Receipt, Plus, Search, DollarSign } from 'lucide-react';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useContractStore } from '@/stores/contract-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';

export function Invoices() {
  const { user } = useAuthStore();
  const { invoices, isLoading, fetchInvoices, createInvoice, sendInvoice } = useInvoiceStore();
  const { contracts, fetchContracts } = useContractStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    contract_id: '',
    amount: 0,
    tax_amount: 0,
    due_date: '',
    is_recurring: false,
    recurrence_interval: '' as '' | 'monthly' | 'quarterly' | 'yearly',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_method: '', reference: '' });

  useEffect(() => {
    fetchInvoices();
    fetchContracts({ status: 'active' });
  }, [fetchInvoices, fetchContracts]);

  const filtered = invoices.filter((i) => {
    const matchSearch = i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (i.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contract = contracts.find((c) => c.id === form.contract_id);
    await createInvoice({
      contract_id: form.contract_id,
      client_id: contract?.client_id,
      organization_id: user?.organization_id,
      amount: form.amount,
      tax_amount: form.tax_amount,
      due_date: form.due_date,
      is_recurring: form.is_recurring,
      recurrence_interval: form.recurrence_interval || undefined,
      notes: form.notes || null,
      created_by: user?.id,
    });
    setIsModalOpen(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { addPayment } = useInvoiceStore.getState();
    await addPayment(selectedInvoiceId, paymentForm);
    setIsPaymentModalOpen(false);
  };

  const openPayment = (invoiceId: string, remainingAmount: number) => {
    setSelectedInvoiceId(invoiceId);
    setPaymentForm({ amount: remainingAmount, payment_method: '', reference: '' });
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Faturas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Nova Fatura
        </Button>
      </div>

      <div className="card">
        <div className="card-header flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar faturas..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
            <option value="">Todos status</option>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviada</option>
            <option value="paid">Paga</option>
            <option value="partial">Parcial</option>
            <option value="overdue">Atrasada</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhuma fatura" description="Crie faturas a partir dos contratos ativos." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Pago</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-sm">{invoice.invoice_number}</td>
                  <td>{invoice.client?.company_name ?? '-'}</td>
                  <td className="font-medium">{formatCurrency(invoice.total_amount)}</td>
                  <td className="text-emerald-600">{formatCurrency(invoice.paid_amount)}</td>
                  <td><StatusBadge status={invoice.status} /></td>
                  <td className="text-xs text-gray-500">{new Date(invoice.due_date).toLocaleDateString('pt-BR')}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {invoice.status === 'draft' && (
                        <Button size="sm" variant="ghost" onClick={() => sendInvoice(invoice.id)}>Enviar</Button>
                      )}
                      {['sent', 'partial', 'overdue'].includes(invoice.status) && (
                        <Button size="sm" variant="success" onClick={() => openPayment(invoice.id, invoice.total_amount - invoice.paid_amount)}>
                          <DollarSign className="w-3 h-3" /> Pagar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Fatura" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Contrato"
            value={form.contract_id}
            onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
            options={contracts.filter((c) => c.status === 'active').map((c) => ({ value: c.id, label: `${c.title} - ${formatCurrency(c.total_value)}` }))}
            placeholder="Selecione um contrato"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Valor" type="number" value={form.amount.toString()} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
            <Input label="Impostos" type="number" value={form.tax_amount.toString()} onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
            <Input label="Vencimento" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} className="rounded" />
              Recorrente
            </label>
            {form.is_recurring && (
              <Select
                value={form.recurrence_interval}
                onChange={(e) => setForm({ ...form, recurrence_interval: e.target.value as typeof form.recurrence_interval })}
                options={[{ value: 'monthly', label: 'Mensal' }, { value: 'quarterly', label: 'Trimestral' }, { value: 'yearly', label: 'Anual' }]}
              />
            )}
          </div>
          <Textarea label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Fatura</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Registrar Pagamento">
        <form onSubmit={handlePayment} className="space-y-4">
          <Input label="Valor" type="number" value={paymentForm.amount.toString()} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
          <Input label="Metodo de Pagamento" value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} placeholder="Ex: PIX, Transferencia, Boleto" />
          <Input label="Referencia" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="Numero do comprovante" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="success">Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
