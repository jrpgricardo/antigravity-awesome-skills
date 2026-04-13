import { useEffect, useState } from 'react';
import { Library, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTemplateStore } from '@/stores/template-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ContentBlock } from '@/types';

export function ContentLibrary() {
  const { contentBlocks, isLoading, fetchContentBlocks, createContentBlock, updateContentBlock, deleteContentBlock } = useTemplateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState({ title: '', category: '', content: '', tags: '' });

  useEffect(() => { fetchContentBlocks(); }, [fetchContentBlocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    if (editing) {
      await updateContentBlock(editing.id, data);
    } else {
      await createContentBlock(data);
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  const openEdit = (block: ContentBlock) => {
    setEditing(block);
    setForm({ title: block.title, category: block.category, content: block.content, tags: block.tags.join(', ') });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Conteudo</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: '', category: '', content: '', tags: '' }); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Novo Bloco
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : contentBlocks.length === 0 ? (
        <EmptyState icon={Library} title="Biblioteca vazia" description="Crie blocos de conteudo reutilizaveis para suas propostas (termos, SLAs, escopos)." />
      ) : (
        <div className="space-y-3">
          {contentBlocks.map((block) => (
            <div key={block.id} className="card card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{block.title}</h3>
                    <Badge>{block.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{block.content}</p>
                  {block.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {block.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => openEdit(block)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteContentBlock(block.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar Bloco' : 'Novo Bloco'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Titulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Termos, SLA, Escopo" required />
          </div>
          <Textarea label="Conteudo" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[200px]" required />
          <Input label="Tags (separadas por virgula)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="contrato, termos, sla" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
