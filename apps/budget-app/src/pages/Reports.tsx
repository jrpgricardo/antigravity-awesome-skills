import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useProposalStore } from '@/stores/proposal-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useClientStore } from '@/stores/client-store';
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency';
import { conversionRate } from '@/utils/calculations';

export function Reports() {
  const { proposals, fetchProposals } = useProposalStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { clients, fetchClients } = useClientStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProposals(), fetchInvoices(), fetchClients()])
      .then(() => setIsLoading(false));
  }, [fetchProposals, fetchInvoices, fetchClients]);

  const approved = proposals.filter((p) => p.status === 'approved').length;
  const sent = proposals.filter((p) => ['sent', 'viewed', 'approved', 'rejected'].includes(p.status)).length;
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const outstanding = invoices.filter((i) => ['sent', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);
  const overdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);
  const avgDealSize = approved > 0 ? proposals.filter((p) => p.status === 'approved').reduce((sum, p) => sum + p.final_value, 0) / approved : 0;

  // Revenue by month
  const revenueByMonth = invoices
    .filter((i) => i.status === 'paid' && i.paid_at)
    .reduce<Record<string, number>>((acc, i) => {
      const month = new Date(i.paid_at!).toISOString().slice(0, 7);
      acc[month] = (acc[month] ?? 0) + i.total_amount;
      return acc;
    }, {});

  // Top clients by value
  const clientRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce<Record<string, number>>((acc, i) => {
      acc[i.client_id] = (acc[i.client_id] ?? 0) + i.total_amount;
      return acc;
    }, {});

  const topClients = Object.entries(clientRevenue)
    .map(([clientId, value]) => ({
      client: clients.find((c) => c.id === clientId),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatorios Financeiros</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-body">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="card card-body">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-sm text-gray-500">A Receber</p>
              <p className="text-xl font-bold">{formatCurrency(outstanding)}</p>
            </div>
          </div>
        </div>
        <div className="card card-body">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><BarChart3 className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Em Atraso</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(overdue)}</p>
            </div>
          </div>
        </div>
        <div className="card card-body">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Ticket Medio</p>
              <p className="text-xl font-bold">{formatCurrency(avgDealSize)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Stats */}
        <div className="card">
          <div className="card-header"><h3 className="text-sm font-semibold">Conversao de Propostas</h3></div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de Propostas</span>
              <span className="font-bold">{proposals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enviadas</span>
              <span className="font-bold">{sent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aprovadas</span>
              <span className="font-bold text-emerald-600">{approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Conversao</span>
              <span className="font-bold text-blue-600">{conversionRate(approved, sent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 rounded-full h-3 transition-all"
                style={{ width: `${conversionRate(approved, sent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="card">
          <div className="card-header"><h3 className="text-sm font-semibold">Receita por Mes</h3></div>
          <div className="card-body">
            {Object.keys(revenueByMonth).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sem dados de receita</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(revenueByMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, value]) => (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-20">{month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                        <div
                          className="bg-blue-500 rounded-full h-6 flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, (value / Math.max(...Object.values(revenueByMonth))) * 100)}%` }}
                        >
                          <span className="text-xs text-white font-medium">{formatCurrencyCompact(value)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="card-header"><h3 className="text-sm font-semibold">Top Clientes por Receita</h3></div>
          <div className="divide-y divide-gray-100">
            {topClients.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Sem dados</p>
            ) : (
              topClients.map((item, index) => (
                <div key={index} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-6">{index + 1}</span>
                    <span className="text-sm font-medium">{item.client?.company_name ?? 'Cliente'}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Status Summary */}
        <div className="card">
          <div className="card-header"><h3 className="text-sm font-semibold">Faturas por Status</h3></div>
          <div className="card-body space-y-3">
            {['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'].map((status) => {
              const count = invoices.filter((i) => i.status === status).length;
              const statusLabels: Record<string, string> = {
                draft: 'Rascunho', sent: 'Enviada', paid: 'Paga',
                partial: 'Parcial', overdue: 'Atrasada', cancelled: 'Cancelada',
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{statusLabels[status]}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
