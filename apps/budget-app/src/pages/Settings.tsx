import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Settings() {
  const { organization, updateOrganization } = useAuthStore();
  const [form, setForm] = useState({
    name: organization?.name ?? '',
    email: organization?.email ?? '',
    phone: organization?.phone ?? '',
    cnpj: organization?.cnpj ?? '',
    website: organization?.website ?? '',
    primary_color: organization?.primary_color ?? '#3B82F6',
    secondary_color: organization?.secondary_color ?? '#1E40AF',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateOrganization(form);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold">Dados da Empresa</h2>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <Input label="Nome da Empresa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>

          <h3 className="text-sm font-semibold text-gray-900 pt-4">Identidade Visual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primaria</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundaria</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" isLoading={isSaving}>Salvar Configuracoes</Button>
            {saved && <span className="text-sm text-emerald-600">Salvo com sucesso!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
