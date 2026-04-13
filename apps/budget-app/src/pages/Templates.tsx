import { useEffect, useState } from 'react';
import { FileStack, Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { useTemplateStore } from '@/stores/template-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Template } from '@/types';

export function Templates() {
  const { templates, isLoading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', default_valid_days: 30 });

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateTemplate(editing.id, form);
    } else {
      await createTemplate(form);
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description ?? '', category: t.category ?? '', default_valid_days: t.default_valid_days });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', category: '', default_valid_days: 30 }); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Novo Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : templates.length === 0 ? (
        <EmptyState icon={FileStack} title="Nenhum template" description="Crie templates reutilizaveis para suas propostas." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card card-body space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  {t.category && <span className="text-xs text-gray-500">{t.category}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteTemplate(t.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Validade: {t.default_valid_days} dias</span>
                <span>Usado {t.usage_count}x</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar Template' : 'Novo Template'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Dias de Validade" type="number" value={form.default_valid_days.toString()} onChange={(e) => setForm({ ...form, default_valid_days: parseInt(e.target.value) || 30 })} />
          <Textarea label="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
