import { useEffect, useState } from 'react';
import { Webhook, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { WebhookConfig } from '@/types';

const availableEvents = [
  'proposal.created', 'proposal.sent', 'proposal.viewed',
  'proposal.approved', 'proposal.rejected',
  'contract.created', 'contract.signed',
  'invoice.created', 'invoice.paid',
];

export function Webhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ url: '', events: [] as string[] });

  const fetchWebhooks = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('webhook_configs').select('*').order('created_at');
    setWebhooks((data as WebhookConfig[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('webhook_configs').insert(form);
    setIsModalOpen(false);
    fetchWebhooks();
  };

  const toggleEvent = (event: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('webhook_configs').update({ is_active: !isActive }).eq('id', id);
    fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    if (confirm('Excluir este webhook?')) {
      await supabase.from('webhook_configs').delete().eq('id', id);
      fetchWebhooks();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <Button onClick={() => { setForm({ url: '', events: [] }); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Novo Webhook
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : webhooks.length === 0 ? (
        <EmptyState icon={Webhook} title="Nenhum webhook" description="Configure webhooks para integrar com sistemas externos." />
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="card card-body">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-mono font-medium text-gray-900">{wh.url}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {wh.events.map((event) => (
                      <Badge key={event}>{event}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(wh.id, wh.is_active)} className="p-1 text-gray-400 hover:text-gray-600">
                    {wh.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => deleteWebhook(wh.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Webhook" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="URL" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://sua-api.com/webhook" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eventos</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded"
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.url || form.events.length === 0}>Criar Webhook</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
