import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Invoice, Payment, InvoiceStatus } from '@/types';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  payments: Payment[];
  isLoading: boolean;
  error: string | null;

  fetchInvoices: (filters?: { status?: InvoiceStatus; client_id?: string; contract_id?: string }) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (data: Partial<Invoice>) => Promise<string | null>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  sendInvoice: (id: string) => Promise<void>;
  cancelInvoice: (id: string) => Promise<void>;

  // Payments
  fetchPayments: (invoiceId: string) => Promise<void>;
  addPayment: (invoiceId: string, data: Partial<Payment>) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  payments: [],
  isLoading: false,
  error: null,

  fetchInvoices: async (filters) => {
    set({ isLoading: true, error: null });
    let query = supabase
      .from('invoices')
      .select('*, client:clients(*), contract:contracts(title)')
      .order('due_date', { ascending: true });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.client_id) query = query.eq('client_id', filters.client_id);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);

    const { data, error } = await query;
    set({
      invoices: (data as Invoice[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  fetchInvoice: async (id) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*), contract:contracts(*)')
      .eq('id', id)
      .single();

    set({
      currentInvoice: data as Invoice | null,
      isLoading: false,
      error: error?.message ?? null,
    });

    if (data) {
      await get().fetchPayments(id);
    }
  },

  createInvoice: async (data) => {
    const totalAmount = (data.amount ?? 0) + (data.tax_amount ?? 0);
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({ ...data, total_amount: totalAmount })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    await get().fetchInvoices();
    return (invoice as Invoice).id;
  },

  updateInvoice: async (id, data) => {
    const { error } = await supabase.from('invoices').update(data).eq('id', id);
    if (!error) await get().fetchInvoice(id);
    set({ error: error?.message ?? null });
  },

  sendInvoice: async (id) => {
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', id);
    await get().fetchInvoice(id);
  },

  cancelInvoice: async (id) => {
    await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', id);
    await get().fetchInvoice(id);
  },

  fetchPayments: async (invoiceId) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('paid_at', { ascending: false });

    set({ payments: (data as Payment[]) ?? [] });
  },

  addPayment: async (invoiceId, data) => {
    await supabase.from('payments').insert({
      ...data,
      invoice_id: invoiceId,
    });

    // Update invoice paid amount and status
    const invoice = get().currentInvoice;
    if (invoice) {
      const newPaidAmount = invoice.paid_amount + (data.amount ?? 0);
      const newStatus: InvoiceStatus =
        newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

      await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', invoiceId);
    }

    await get().fetchInvoice(invoiceId);
  },

  deletePayment: async (paymentId) => {
    const payment = get().payments.find((p) => p.id === paymentId);
    if (!payment) return;

    await supabase.from('payments').delete().eq('id', paymentId);

    // Recalculate invoice
    const invoice = get().currentInvoice;
    if (invoice) {
      const newPaidAmount = Math.max(0, invoice.paid_amount - payment.amount);
      const newStatus: InvoiceStatus =
        newPaidAmount === 0 ? 'sent' : newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

      await supabase
        .from('invoices')
        .update({ paid_amount: newPaidAmount, status: newStatus, paid_at: null })
        .eq('id', invoice.id);
    }

    if (invoice) {
      await get().fetchInvoice(invoice.id);
    }
  },
}));
