'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Lock, FileText, Upload, Trash2, Download } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Patient, ClinicDocument, DocumentCategory } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FieldError } from '@/components/ui/field-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  if (value === undefined) return undefined;
  if (!value.trim()) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export default function PatientDetailPage() {
  const { t, dir } = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canSeeMedical = hasPermission('patients.medical.read');
  const canEditMedical = hasPermission('patients.medical.update');
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => api.get<Patient>(`/patients/${id}`),
  });

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (patient) {
      reset({
        fullName: patient.fullName,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth?.slice(0, 10) ?? '',
        address: patient.address ?? '',
        nationalId: patient.nationalId ?? '',
        emergencyContactName: patient.emergencyContactName ?? '',
        emergencyContactPhone: patient.emergencyContactPhone ?? '',
        notes: patient.notes ?? '',
        allergies: patient.allergies?.join(', ') ?? '',
        chronicConditions: patient.chronicConditions?.join(', ') ?? '',
        currentMedications: patient.currentMedications?.join(', ') ?? '',
      });
    }
  }, [patient, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.patch<Patient>(`/patients/${id}`, {
        ...values,
        allergies: canEditMedical ? toList(values.allergies) : undefined,
        chronicConditions: canEditMedical ? toList(values.chronicConditions) : undefined,
        currentMedications: canEditMedical ? toList(values.currentMedications) : undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['patients', id], data);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t.toasts.patientUpdated, data.fullName);
    },
    onError: () => toast.error(t.common.error),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t.toasts.patientDeactivated);
      router.push('/patients');
    },
    onError: () => toast.error(t.common.error),
  });

  const activateMutation = useMutation({
    mutationFn: () => api.patch(`/patients/${id}`, { isActive: true }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
      toast.success(t.toasts.patientUpdated, (data as { fullName?: string })?.fullName);
    },
    onError: () => toast.error(t.common.error),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.get<ClinicDocument[]>(`/documents?patientId=${id}`),
  });

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = React.useState<DocumentCategory>('OTHER');
  const [uploadNotes, setUploadNotes] = React.useState('');

  const openUpload = () => {
    setUploadFile(null);
    setUploadCategory('OTHER');
    setUploadNotes('');
    setUploadOpen(true);
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('file', uploadFile!);
      formData.append('patientId', id);
      formData.append('category', uploadCategory);
      if (uploadNotes) formData.append('notes', uploadNotes);
      return api.upload<ClinicDocument>('/documents', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      setUploadOpen(false);
      toast.success(t.toasts.documentUploaded);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => api.delete(`/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success(t.toasts.documentDeleted);
    },
    onError: () => toast.error(t.common.error),
  });

  if (isLoading || !patient) {
    return (
      <div className="max-w-7xl space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-56" />
        <Card>
          <CardContent className="space-y-3 pt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="h-3.5 w-3.5" />
          {t.patients.backToList}
        </Link>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight">{patient.fullName}</h1>
          <Badge variant={patient.isActive ? 'success' : 'neutral'}>
            {patient.isActive ? t.common.active : t.common.inactive}
          </Badge>
          {patient.isActive ? (
            <Button variant="outline" size="sm" onClick={() => deactivateMutation.mutate()}>
              {t.common.deactivate}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => activateMutation.mutate()}>
              {t.common.activate}
            </Button>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <span dir="ltr">{patient.phone}</span>
          {age !== null ? ` · ${age} ${t.patients.age.toLowerCase()}` : ''}
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => updateMutation.mutate(v), onFormInvalid(t.common.formInvalid))}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.patients.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        <SelectValue placeholder="—">
                          {field.value === 'MALE'
                            ? t.patients.genderMale
                            : field.value === 'FEMALE'
                              ? t.patients.genderFemale
                              : undefined}
                        </SelectValue>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="address">{t.patients.address}</Label>
                <Input id="address" {...register('address')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nationalId">{t.patients.nationalId}</Label>
                <Input id="nationalId" dir="ltr" {...register('nationalId')} />
              </div>
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
            <div className="space-y-1.5">
              <Label htmlFor="notes">{t.patients.notes}</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.patients.medicalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            {!canSeeMedical ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                {t.patients.medicalHidden}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="allergies">{t.patients.allergies}</Label>
                  <Input
                    id="allergies"
                    disabled={!canEditMedical}
                    placeholder={t.patients.listArrayHint}
                    {...register('allergies')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chronicConditions">{t.patients.chronicConditions}</Label>
                  <Input
                    id="chronicConditions"
                    disabled={!canEditMedical}
                    placeholder={t.patients.listArrayHint}
                    {...register('chronicConditions')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currentMedications">{t.patients.currentMedications}</Label>
                  <Input
                    id="currentMedications"
                    disabled={!canEditMedical}
                    placeholder={t.patients.listArrayHint}
                    {...register('currentMedications')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
            {t.common.save}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">{t.documents.title}</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={openUpload}>
            <Upload className="h-3.5 w-3.5" />
            {t.documents.upload}
          </Button>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">{t.documents.empty}</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{doc.fileName}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="neutral">{t.documents.categories[doc.category]}</Badge>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="ghost" size="sm">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteDocMutation.mutate(doc._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.documents.uploadTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.documents.file}</Label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="flex h-9 w-full items-center rounded-md border border-input bg-surface text-sm file:me-3 file:h-full file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.documents.category}</Label>
              <Select value={uploadCategory} onValueChange={(v) => setUploadCategory(v as DocumentCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(t.documents.categories) as DocumentCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{t.documents.categories[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.documents.notes}</Label>
              <Textarea value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => uploadMutation.mutate()}
              loading={uploadMutation.isPending}
              disabled={!uploadFile}
            >
              {t.documents.upload}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

