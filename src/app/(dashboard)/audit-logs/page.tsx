'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { History } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { AuditLog, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/layout/table-skeleton';

export default function AuditLogsPage() {
  const { t } = useLocale();
  const [from, setFrom] = React.useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [to, setTo] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [appliedRange, setAppliedRange] = React.useState({ from, to });
  const [resource, setResource] = React.useState('all');
  const [page, setPage] = React.useState(1);

  const { data: resources } = useQuery({
    queryKey: ['audit-logs', 'resources'],
    queryFn: () => api.get<string[]>('/audit-logs/resources'),
  });

  const params = new URLSearchParams({ from: appliedRange.from, to: appliedRange.to, page: String(page) });
  if (resource !== 'all') params.set('resource', resource);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', appliedRange.from, appliedRange.to, resource, page],
    queryFn: () => api.get<PaginatedResult<AuditLog>>(`/audit-logs?${params.toString()}`),
  });

  const items = data?.items ?? [];

  const STATUS_VARIANT = (code: number) => (code >= 400 ? 'destructive' : code >= 300 ? 'warning' : 'success');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.auditLogs.title}</h1>
        <p className="text-sm text-muted-foreground">{t.auditLogs.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <div className="space-y-1.5">
          <Label>{t.auditLogs.from}</Label>
          <DatePicker value={from} onChange={setFrom} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>{t.auditLogs.to}</Label>
          <DatePicker value={to} onChange={setTo} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>{t.auditLogs.resource}</Label>
          <Select value={resource} onValueChange={(v) => { setResource(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.auditLogs.allResources}</SelectItem>
              {(resources ?? []).map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="secondary" onClick={() => { setAppliedRange({ from, to }); setPage(1); }}>
          {t.auditLogs.apply}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <History className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.auditLogs.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.auditLogs.time}</th>
                <th>{t.auditLogs.user}</th>
                <th>{t.auditLogs.action}</th>
                <th>{t.auditLogs.resource}</th>
                <th>{t.auditLogs.status}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log._id}>
                  <td className="tabular-nums text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="font-medium">{log.userName}</div>
                    <div className="text-xs text-muted-foreground">{log.role}</div>
                  </td>
                  <td>{log.description}</td>
                  <td><Badge variant="neutral">{log.resource}</Badge></td>
                  <td><Badge variant={STATUS_VARIANT(log.statusCode)}>{log.statusCode}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.total} · {data.page}/{data.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  );
}
