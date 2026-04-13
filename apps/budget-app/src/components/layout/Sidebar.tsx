import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  FileStack,
  BarChart3,
  FileSignature,
  Receipt,
  Settings,
  Bell,
  Library,
  Webhook,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/proposals', icon: FileText, label: 'Propostas' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/services', icon: Package, label: 'Catalogo' },
  { to: '/templates', icon: FileStack, label: 'Templates' },
  { to: '/content-library', icon: Library, label: 'Biblioteca' },
  { to: '/pipeline', icon: BarChart3, label: 'Pipeline' },
  { to: '/contracts', icon: FileSignature, label: 'Contratos' },
  { to: '/invoices', icon: Receipt, label: 'Faturas' },
  { to: '/reports', icon: BarChart3, label: 'Relatorios' },
  { to: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/settings', icon: Settings, label: 'Configuracoes' },
];

export function Sidebar() {
  const { unreadCount } = useNotificationStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">PropostaApp</h1>
        <p className="text-xs text-gray-500 mt-0.5">Orcamentos & Propostas</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <NavLink
          to="/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Bell className="w-5 h-5" />
          Notificacoes
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
