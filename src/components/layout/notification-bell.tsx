'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocale } from '@/lib/i18n/locale-context';
import type { AppNotification, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function timeAgo(iso: string, locale: 'en' | 'ar') {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return locale === 'ar' ? `منذ ${minutes} د` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return locale === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return locale === 'ar' ? `منذ ${days} ي` : `${days}d ago`;
}

export function NotificationBell() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30_000,
  });

  const { data } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => api.get<PaginatedResult<AppNotification>>('/notifications?limit=8'),
    enabled: open,
  });

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const openNotification = async (n: AppNotification) => {
    if (!n.isRead) {
      await api.patch(`/notifications/${n._id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const count = unread?.count ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative" aria-label={t.notifications.title}>
          <Bell className="h-3.5 w-3.5" />
          {count > 0 && (
            <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">{t.notifications.title}</span>
          {count > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
              {t.notifications.markAllRead}
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {!data || data.items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t.notifications.empty}</p>
          ) : (
            data.items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => openNotification(n)}
                className="flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-start last:border-b-0 hover:bg-secondary"
              >
                <div className="flex items-center gap-1.5">
                  {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className="text-sm font-medium">{n.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt, locale)}</span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
