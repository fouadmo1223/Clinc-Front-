'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Contact } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Patient, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';
import { toast } from '@/hooks/use-toast';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    fullName: z.string().min(2, t.common.minLength(2)),
    phone: z.string().min(6, t.common.minLength(6)),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    nationalId: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    notes: z.string().optional(),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    currentMedications: z.string().optional(),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function toList(value?: string): string[] | undefined {
  if (!value?.trim()) return undefined;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function PatientsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canSeeMedical = hasPermission('patients.medical.read');

  const [open, setOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(1);
  const search = useDebouncedValue(searchInput, 350);

  React.useEffect(() => setPage(1), [search]);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () =>
      api.get<PaginatedResult<Patient>>(
        `/patients?page=${page}&limit=15${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
    placeholderData: (prev) => prev,
  });

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    reset({});
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post<Patient>('/patients', {
        ...values,
        allergies: toList(values.allergies),
        chronicConditions: toList(values.chronicConditions),
        currentMedications: toList(values.currentMedications),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setOpen(false);
      toast.success(t.toasts.patientAdded, data.fullName);
    },
    onError: () => toast.error(t.common.error),
  });

  const patients = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.patients.title}</h1>
          <p className="text-sm text-muted-foreground">{t.patients.subtitle}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.patients.add}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.patients.searchPlaceholder}
          className="ps-9"
        />
      </div>

      <div className={`overflow-x-auto rounded-lg border border-border bg-surface ${isPlaceholderData ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Contact className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">
              {search ? t.patients.noSearchResults : t.patients.empty}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.patients.fullName}</th>
                <th>{t.patients.phone}</th>
                <th>{t.patients.gender}</th>
                <th>{t.patients.createdOn}</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id} className="cursor-pointer" onClick={() => router.push(`/patients/${patient._id}`)}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={patient.fullName} />
                      {patient.fullName}
                    </div>
                  </td>
                  <td className="tabular-nums text-muted-foreground">
                    <span dir="ltr">{patient.phone}</span>
                  </td>
                  <td className="text-muted-foreground">
                    {patient.gender === 'MALE'
                      ? t.patients.genderMale
                      : patient.gender === 'FEMALE'
                        ? t.patients.genderFemale
                        : '—'}
                  </td>
                  <td className="tabular-nums text-muted-foreground">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.patients.addTitle}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((v) => createMutation.mutate(v), onFormInvalid(t.common.formInvalid))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t.patients.fullName}</Label>
                <Input id="fullName" error={!!errors.fullName} {...register('fullName')} />
                <FieldError>{errors.fullName?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t.patients.phone}</Label>
                <Input id="phone" dir="ltr" className="text-start" error={!!errors.phone} {...register('phone')} />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gender">{t.patients.gender}</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">{t.patients.genderMale}</SelectItem>
                        <SelectItem value="FEMALE">{t.patients.genderFemale}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth">{t.patients.dateOfBirth}</Label>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => <DatePicker id="dateOfBirth" value={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">{t.patients.address}</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactName">{t.patients.emergencyContactName}</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactPhone">{t.patients.emergencyContactPhone}</Label>
                <Input id="emergencyContactPhone" dir="ltr" {...register('emergencyContactPhone')} />
              </div>
            </div>

            {canSeeMedical && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="allergies">{t.patients.allergies}</Label>
                  <Input id="allergies" placeholder={t.patients.listArrayHint} {...register('allergies')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chronicConditions">{t.patients.chronicConditions}</Label>
                  <Input
                    id="chronicConditions"
                    placeholder={t.patients.listArrayHint}
                    {...register('chronicConditions')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currentMedications">{t.patients.currentMedications}</Label>
                  <Input
                    id="currentMedications"
                    placeholder={t.patients.listArrayHint}
                    {...register('currentMedications')}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notes">{t.patients.notes}</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {t.common.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
