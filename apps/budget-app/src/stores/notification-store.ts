import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Notification, ActivityLog } from '@/types';

interface NotificationState {
  notifications: Notification[];
  activities: ActivityLog[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Activity Log
  fetchActivities: (filters?: { proposal_id?: string; contract_id?: string; limit?: number }) => Promise<void>;
  logActivity: (data: Partial<ActivityLog>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  activities: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const notifications = (data as Notification[]) ?? [];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    set({ notifications, unreadCount, isLoading: false });
  },

  markAsRead: async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  markAllAsRead: async () => {
    const unreadIds = get()
      .notifications.filter((n) => !n.is_read)
      .map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    set({
      notifications: get().notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    });
  },

  deleteNotification: async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    const notification = get().notifications.find((n) => n.id === id);
    set({
      notifications: get().notifications.filter((n) => n.id !== id),
      unreadCount: notification && !notification.is_read
        ? get().unreadCount - 1
        : get().unreadCount,
    });
  },

  fetchActivities: async (filters) => {
    set({ isLoading: true });
    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters?.limit ?? 100);

    if (filters?.proposal_id) query = query.eq('proposal_id', filters.proposal_id);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);

    const { data } = await query;
    set({ activities: (data as ActivityLog[]) ?? [], isLoading: false });
  },

  logActivity: async (data) => {
    await supabase.from('activity_log').insert(data);
  },
}));
