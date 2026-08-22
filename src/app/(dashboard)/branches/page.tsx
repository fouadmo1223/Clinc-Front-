'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { Branch } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';
import { toast } from '@/hooks/use-toast';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    name: z.string().min(2, t.common.minLength(2)),
    nameAr: z.string().min(2, t.common.minLength(2)),
    address: z.string().min(3, t.common.minLength(3)),
    city: z.string().optional(),
    phone: z.string().min(6, t.common.minLength(6)),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function BranchesPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Branch | null>(null);
  const schema = React.useMemo(() => buildSchema(t), [t]);

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get<Branch[]>('/branches?includeInactive=true'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', nameAr: '', address: '', city: '', phone: '' });
    setOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    reset({
      name: branch.name,
      nameAr: branch.nameAr,
      address: branch.address,
      city: branch.city ?? '',
      phone: branch.phone,
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => api.post<Branch>('/branches', values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setOpen(false);
      toast.success(t.toasts.branchAdded, data.name);
    },
    onError: () => toast.error(t.common.error),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => api.patch<Branch>(`/branches/${editing?._id}`, values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setOpen(false);
      toast.success(t.toasts.branchUpdated, data.name);
    },
    onError: () => toast.error(t.common.error),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success(t.toasts.branchDeactivated);
    },
    onError: () => toast.error(t.common.error),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/branches/${id}`, { isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success(t.toasts.branchUpdated);
    },
    onError: () => toast.error(t.common.error),
  });

  const onSubmit = (values: FormValues) => {
    if (editing) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.branches.title}</h1>
          <p className="text-sm text-muted-foreground">{t.branches.subtitle}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.branches.add}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : !branches || branches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Building2 className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.branches.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.branches.name}</th>
                <th>{t.branches.address}</th>
                <th>{t.branches.phone}</th>
                <th>{t.branches.status}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch._id} className="cursor-pointer" onClick={() => openEdit(branch)}>
                  <td className="font-medium">{branch.name}</td>
                  <td className="text-muted-foreground">
                    {branch.address}
                    {branch.city ? `, ${branch.city}` : ''}
                  </td>
                  <td className="tabular-nums text-muted-foreground">{branch.phone}</td>
                  <td>
                    <Badge variant={branch.isActive ? 'success' : 'neutral'}>
                      {branch.isActive ? t.common.active : t.common.inactive}
                    </Badge>
                  </td>
                  <td className="text-end">
                    {branch.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deactivateMutation.mutate(branch._id);
                        }}
                      >
                        {t.common.deactivate}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          activateMutation.mutate(branch._id);
                        }}
                      >
                        {t.common.activate}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t.branches.editTitle : t.branches.addTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t.branches.name}</Label>
                <Input id="name" error={!!errors.name} {...register('name')} />
                <FieldError>{errors.name?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nameAr">{t.branches.nameAr}</Label>
                <Input id="nameAr" dir="rtl" error={!!errors.nameAr} {...register('nameAr')} />
                <FieldError>{errors.nameAr?.message}</FieldError>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">{t.branches.address}</Label>
              <Input id="address" error={!!errors.address} {...register('address')} />
              <FieldError>{errors.address?.message}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">{t.branches.city}</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t.branches.phone}</Label>
                <Input id="phone" error={!!errors.phone} {...register('phone')} />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" loading={saving}>
                {editing ? t.common.save : t.common.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
