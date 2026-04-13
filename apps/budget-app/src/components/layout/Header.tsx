import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function Header() {
  const { user, organization, signOut } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-medium text-gray-900">
          {organization?.name ?? 'Minha Empresa'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{user?.full_name ?? 'Usuario'}</span>
        </div>
        <button
          onClick={signOut}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
