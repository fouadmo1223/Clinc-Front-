'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { Invoice, InvoiceStatus, Branch, Patient, PaginatedResult, Visit } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { toast } from '@/hooks/use-toast';

const STATUS_VARIANT: Record<InvoiceStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  UNPAID: 'warning',
  PARTIALLY_PAID: 'info',
  PAID: 'success',
  CANCELLED: 'destructive',
};

interface ItemRow {
  description: string;
  quantity: string;
  unitPrice: string;
}

function emptyItem(): ItemRow {
  return { description: '', quantity: '1', unitPrice: '' };
}

export default function InvoicesPage() {
  const { t } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [open, setOpen] = React.useState(false);
  const [patientId, setPatientId] = React.useState('');
  const [branchId, setBranchId] = React.useState('');
  const [visitId, setVisitId] = React.useState('');
  const [items, setItems] = React.useState<ItemRow[]>([emptyItem()]);
  const [discount, setDiscount] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => api.get<Branch[]>('/branches') });

  const listUrl = `/invoices${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`;
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => api.get<PaginatedResult<Invoice>>(listUrl),
  });
  const invoices = data?.items ?? [];

  const { data: patientVisits } = useQuery({
    queryKey: ['visits', 'by-patient', patientId],
    queryFn: () => api.get<PaginatedResult<Visit>>(`/visits?patientId=${patientId}`),
    enabled: !!patientId && open,
  });

  const openNew = () => {
    setPatientId('');
    setBranchId('');
    setVisitId('');
    setItems([emptyItem()]);
    setDiscount('');
    setNotes('');
    setOpen(true);
  };

  const updateItem = (idx: number, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const subtotal = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const discountValue = Math.min(Number(discount) || 0, subtotal);
  const total = subtotal - discountValue;

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Invoice>('/invoices', {
        patientId,
        branchId,
        visitId: visitId || undefined,
        items: items
          .filter((it) => it.description.trim() && it.unitPrice)
          .map((it) => ({ description: it.description, quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) })),
        discount: discountValue || undefined,
        notes: notes || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpen(false);
      toast.success(t.toasts.invoiceCreated);
      router.push(`/invoices/${data._id}`);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const canCreate =
    !!patientId && !!branchId && items.some((it) => it.description.trim() && Number(it.unitPrice) > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.invoices.title}</h1>
          <p className="text-sm text-muted-foreground">{t.invoices.subtitle}</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          {t.invoices.newInvoice}
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.invoices.allStatuses}</SelectItem>
          {(Object.keys(t.invoices.statuses) as InvoiceStatus[]).map((s) => (
            <SelectItem key={s} value={s}>{t.invoices.statuses[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Receipt className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.invoices.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.invoices.patient}</th>
                <th>{t.invoices.total}</th>
                <th>{t.invoices.balanceDue}</th>
                <th>{t.invoices.status}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="cursor-pointer" onClick={() => router.push(`/invoices/${inv._id}`)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={inv.patientName ?? '?'} />
                      {inv.patientName}
                    </div>
                  </td>
                  <td className="tabular-nums text-muted-foreground">{inv.total.toFixed(2)}</td>
                  <td className="tabular-nums text-muted-foreground">{(inv.total - inv.amountPaid).toFixed(2)}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[inv.status]}>{t.invoices.statuses[inv.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.invoices.newInvoiceTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.invoices.patient}</Label>
              <PatientCombobox value={patientId} onChange={(id) => { setPatientId(id); setVisitId(''); }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.invoices.branch}</Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(branches ?? []).map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.invoices.linkedVisit}</Label>
                <Select value={visitId || 'none'} onValueChange={(v) => setVisitId(v === 'none' ? '' : v)} disabled={!patientId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {(patientVisits?.items ?? []).map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {new Date(v.date).toLocaleDateString()} {v.diagnosis ? `· ${v.diagnosis}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.invoices.item}</Label>
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={t.invoices.description}
                    value={it.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder={t.invoices.quantity}
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder={t.invoices.unitPrice}
                    value={it.unitPrice}
                    onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setItems((prev) => [...prev, emptyItem()])}>
                <Plus className="h-3.5 w-3.5" />
                {t.invoices.addItem}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.invoices.discount}</Label>
                <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div className="flex flex-col justify-end gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.invoices.subtotal}</span>
                  <span className="tabular-nums">{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t.invoices.total}</span>
                  <span className="tabular-nums">{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.invoices.notes}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="button" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!canCreate}>
              {t.invoices.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
