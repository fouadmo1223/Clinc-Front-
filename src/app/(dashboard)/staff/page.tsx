'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { StaffMember, Branch, StaffRole } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';
import { toast } from '@/hooks/use-toast';

const roles: StaffRole[] = ['RECEPTIONIST', 'NURSE', 'ACCOUNTANT'];

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    fullName: z.string().min(2, t.common.minLength(2)),
    role: z.enum(['RECEPTIONIST', 'NURSE', 'ACCOUNTANT']),
    email: z.string().email(t.common.invalidEmail),
    phone: z.string().min(6, t.common.minLength(6)),
    branchIds: z.array(z.string()).min(1, t.common.selectAtLeastOne),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function StaffPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StaffMember | null>(null);
  const schema = React.useMemo(() => buildSchema(t), [t]);

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get<StaffMember[]>('/staff?includeInactive=true'),
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get<Branch[]>('/branches'),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ fullName: '', role: 'RECEPTIONIST', email: '', phone: '', branchIds: [] });
    setOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    reset({
      fullName: member.fullName,
      role: member.role,
      email: member.email,
      phone: member.phone,
      branchIds: member.branchIds,
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => api.post<StaffMember>('/staff', values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      toast.success(t.toasts.staffAdded, t.toasts.staffInviteSent(data.email));
    },
    onError: () => toast.error(t.common.error),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const { email, ...rest } = values;
      return api.patch<StaffMember>(`/staff/${editing?._id}`, rest);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      toast.success(t.toasts.staffUpdated, data.fullName);
    },
    onError: () => toast.error(t.common.error),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(t.toasts.staffDeactivated);
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
          <h1 className="text-lg font-semibold tracking-tight">{t.staff.title}</h1>
          <p className="text-sm text-muted-foreground">{t.staff.subtitle}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.staff.add}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : !staff || staff.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Users className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.staff.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.staff.fullName}</th>
                <th>{t.staff.role}</th>
                <th>{t.staff.email}</th>
                <th>{t.staff.phone}</th>
                <th>{t.common.active}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id} className="cursor-pointer" onClick={() => openEdit(member)}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={member.fullName} />
                      {member.fullName}
                    </div>
                  </td>
                  <td className="text-muted-foreground">{t.staff.roles[member.role]}</td>
                  <td className="text-muted-foreground">{member.email}</td>
                  <td className="tabular-nums text-muted-foreground">{member.phone}</td>
                  <td>
                    <Badge variant={member.isActive ? 'success' : 'neutral'}>
                      {member.isActive ? t.common.active : t.common.inactive}
                    </Badge>
                  </td>
                  <td className="text-end">
                    {member.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deactivateMutation.mutate(member._id);
                        }}
                      >
                        {t.common.deactivate}
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
            <DialogTitle>{editing ? t.staff.editTitle : t.staff.addTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t.staff.fullName}</Label>
              <Input id="fullName" error={!!errors.fullName} {...register('fullName')} />
              <FieldError>{errors.fullName?.message}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="role">{t.staff.role}</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {t.staff.roles[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t.staff.phone}</Label>
                <Input id="phone" error={!!errors.phone} {...register('phone')} />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.staff.email}</Label>
              <Input id="email" type="email" disabled={!!editing} error={!!errors.email} {...register('email')} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div className="space-y-1.5">
              <Label>{t.staff.branchesLabel}</Label>
              <Controller
                control={control}
                name="branchIds"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {(branches ?? []).map((branch) => {
                      const checked = field.value?.includes(branch._id);
                      return (
                        <button
                          type="button"
                          key={branch._id}
                          onClick={() =>
                            field.onChange(
                              checked
                                ? field.value.filter((id: string) => id !== branch._id)
                                : [...(field.value ?? []), branch._id],
                            )
                          }
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            checked
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {branch.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
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
