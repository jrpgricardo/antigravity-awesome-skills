import { useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function Notifications() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notificacoes</h1>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Sem notificacoes" description="Voce sera notificado quando houver atividade nas suas propostas." />
      ) : (
        <div className="card divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n.id} className={`px-6 py-4 flex items-start gap-4 ${n.is_read ? '' : 'bg-blue-50/50'}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="p-1 text-gray-400 hover:text-blue-600" title="Marcar como lida">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
