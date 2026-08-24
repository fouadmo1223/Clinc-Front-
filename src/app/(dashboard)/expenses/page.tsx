'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Wallet, Trash2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { Expense, ExpenseCategory, Branch, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExpenseForm {
  branchId: string;
  category: ExpenseCategory;
  amount: string;
  description: string;
  date: string;
}

function emptyForm(): ExpenseForm {
  return { branchId: '', category: 'OTHER', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') };
}

export default function ExpensesPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<ExpenseForm>(emptyForm());
  const [page, setPage] = React.useState(1);

  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => api.get<Branch[]>('/branches') });
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['expenses', page],
    queryFn: () => api.get<PaginatedResult<Expense> & { totalAmount: number }>(`/expenses?page=${page}&limit=50`),
    placeholderData: (prev) => prev,
  });

  const openCreate = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Expense>('/expenses', {
        branchId: form.branchId,
        category: form.category,
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      toast.success(t.toasts.expenseAdded);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(t.toasts.expenseDeleted);
    },
    onError: () => toast.error(t.common.error),
  });

  const items = data?.items ?? [];
  const totalAmount = data?.totalAmount ?? 0;
  const canCreate = !!form.branchId && !!form.description.trim() && Number(form.amount) > 0 && !!form.date;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.expenses.title}</h1>
          <p className="text-sm text-muted-foreground">{t.expenses.subtitle}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.expenses.add}
        </Button>
      </div>

      <div className={`overflow-x-auto rounded-lg border border-border bg-surface ${isPlaceholderData ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Wallet className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.expenses.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.expenses.date}</th>
                <th>{t.expenses.category}</th>
                <th>{t.expenses.description}</th>
                <th>{t.expenses.amount}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((expense) => (
                <tr key={expense._id}>
                  <td className="tabular-nums text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</td>
                  <td><Badge variant="neutral">{t.expenses.categories[expense.category]}</Badge></td>
                  <td>{expense.description}</td>
                  <td className="tabular-nums font-medium">{expense.amount.toFixed(2)}</td>
                  <td className="text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t.expenses.delete}
                      onClick={() => deleteMutation.mutate(expense._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end font-medium">{t.expenses.total}</td>
                <td className="tabular-nums font-semibold">{totalAmount.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {data.total} · {data.page}/{data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              ›
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.expenses.addTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.expenses.branch}</Label>
                <Select value={form.branchId} onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(branches ?? []).map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.expenses.category}</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as ExpenseCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(t.expenses.categories) as ExpenseCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{t.expenses.categories[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t.expenses.description}</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.expenses.amount}</Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.expenses.date}</Label>
                <DatePicker value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="button" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!canCreate}>
              {t.expenses.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
