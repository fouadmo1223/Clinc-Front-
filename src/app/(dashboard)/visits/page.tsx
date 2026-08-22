'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, ClipboardList } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { Visit, Doctor, Branch, Patient, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { toast } from '@/hooks/use-toast';

interface VisitForm {
  patientId: string;
  doctorId: string;
  branchId: string;
  date: string;
  chiefComplaint: string;
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  diagnosis: string;
  examinationNotes: string;
  treatmentPlan: string;
}

function emptyForm(defaults: Partial<VisitForm> = {}): VisitForm {
  return {
    patientId: '',
    doctorId: '',
    branchId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    chiefComplaint: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    diagnosis: '',
    examinationNotes: '',
    treatmentPlan: '',
    ...defaults,
  };
}

export default function VisitsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<VisitForm>(emptyForm());
  const [doctorFilter, setDoctorFilter] = React.useState<string>('all');

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: () => api.get<Doctor[]>('/doctors') });
  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => api.get<Branch[]>('/branches') });

  const listUrl = `/visits${doctorFilter !== 'all' ? `?doctorId=${doctorFilter}` : ''}`;
  const { data, isLoading } = useQuery({
    queryKey: ['visits', doctorFilter],
    queryFn: () => api.get<PaginatedResult<Visit>>(listUrl),
  });
  const visits = data?.items ?? [];

  const doctor = React.useMemo(() => doctors?.find((d) => d._id === form.doctorId), [doctors, form.doctorId]);
  const doctorBranches = React.useMemo(
    () => (branches ?? []).filter((b) => doctor?.branchIds.includes(b._id)),
    [branches, doctor],
  );

  React.useEffect(() => {
    if (doctorBranches.length === 1 && !form.branchId) setForm((f) => ({ ...f, branchId: doctorBranches[0]._id }));
  }, [doctorBranches, form.branchId]);

  const appointmentId = searchParams.get('appointmentId');
  const prefillHandled = React.useRef(false);
  React.useEffect(() => {
    if (prefillHandled.current) return;
    const doctorId = searchParams.get('doctorId');
    const branchId = searchParams.get('branchId');
    const patientId = searchParams.get('patientId');
    if (doctorId || branchId || patientId) {
      prefillHandled.current = true;
      setForm((f) => ({ ...f, doctorId: doctorId ?? f.doctorId, branchId: branchId ?? f.branchId, patientId: patientId ?? f.patientId }));
      setOpen(true);
    }
  }, [searchParams]);

  const [prefillPatient, setPrefillPatient] = React.useState<Patient | null>(null);
  React.useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId) api.get<Patient>(`/patients/${patientId}`).then(setPrefillPatient).catch(() => undefined);
  }, [searchParams]);

  const openNew = () => {
    setForm(emptyForm());
    setPrefillPatient(null);
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Visit>('/visits', {
        patientId: form.patientId,
        doctorId: form.doctorId,
        branchId: form.branchId,
        appointmentId: appointmentId ?? undefined,
        date: form.date,
        chiefComplaint: form.chiefComplaint || undefined,
        vitals: {
          bloodPressureSystolic: form.bpSystolic ? Number(form.bpSystolic) : undefined,
          bloodPressureDiastolic: form.bpDiastolic ? Number(form.bpDiastolic) : undefined,
          heartRate: form.heartRate ? Number(form.heartRate) : undefined,
          temperatureCelsius: form.temperature ? Number(form.temperature) : undefined,
          weightKg: form.weight ? Number(form.weight) : undefined,
          heightCm: form.height ? Number(form.height) : undefined,
        },
        diagnosis: form.diagnosis || undefined,
        examinationNotes: form.examinationNotes || undefined,
        treatmentPlan: form.treatmentPlan || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpen(false);
      toast.success(t.toasts.visitSaved);
      router.push(`/visits/${data._id}`);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const canSave = !!form.patientId && !!form.doctorId && !!form.branchId && !!form.date;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.visits.title}</h1>
          <p className="text-sm text-muted-foreground">{t.visits.subtitle}</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          {t.visits.newVisit}
        </Button>
      </div>

      <Select value={doctorFilter} onValueChange={setDoctorFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.appointments.allDoctors}</SelectItem>
          {(doctors ?? []).map((d) => (
            <SelectItem key={d._id} value={d._id}>{d.fullName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : visits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <ClipboardList className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.visits.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.visits.date}</th>
                <th>{t.visits.patient}</th>
                <th>{t.visits.doctor}</th>
                <th>{t.visits.diagnosis}</th>
                <th>{t.visits.status}</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit._id} className="cursor-pointer" onClick={() => router.push(`/visits/${visit._id}`)}>
                  <td className="tabular-nums text-muted-foreground">{new Date(visit.date).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={visit.patientName ?? '?'} />
                      {visit.patientName}
                    </div>
                  </td>
                  <td className="text-muted-foreground">{visit.doctorName}</td>
                  <td className="text-muted-foreground">{visit.diagnosis || '—'}</td>
                  <td>
                    <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'info'}>{t.visits.statuses[visit.status]}</Badge>
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
            <DialogTitle>{t.visits.newVisitTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.visits.patient}</Label>
              {prefillPatient ? (
                <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted px-3 text-sm">
                  <AvatarInitials name={prefillPatient.fullName} className="h-5 w-5 text-[10px]" />
                  {prefillPatient.fullName}
                </div>
              ) : (
                <PatientCombobox value={form.patientId} onChange={(id) => setForm((f) => ({ ...f, patientId: id }))} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.visits.doctor}</Label>
                <Select value={form.doctorId} onValueChange={(v) => setForm((f) => ({ ...f, doctorId: v, branchId: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(doctors ?? []).map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.visits.branch}</Label>
                <Select value={form.branchId} onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))} disabled={!form.doctorId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {doctorBranches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.visits.date}</Label>
              <DatePicker value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} className="w-40" />
            </div>

            <div className="space-y-1.5">
              <Label>{t.visits.chiefComplaint}</Label>
              <Input value={form.chiefComplaint} onChange={(e) => setForm((f) => ({ ...f, chiefComplaint: e.target.value }))} />
            </div>

            <div className="space-y-2 rounded-md border border-border p-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t.visits.vitals}</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-1">
                  <Input type="number" placeholder="120" value={form.bpSystolic} onChange={(e) => setForm((f) => ({ ...f, bpSystolic: e.target.value }))} />
                  <span className="text-muted-foreground">/</span>
                  <Input type="number" placeholder="80" value={form.bpDiastolic} onChange={(e) => setForm((f) => ({ ...f, bpDiastolic: e.target.value }))} />
                </div>
                <Input type="number" placeholder={t.visits.heartRate} value={form.heartRate} onChange={(e) => setForm((f) => ({ ...f, heartRate: e.target.value }))} />
                <Input type="number" placeholder={t.visits.temperature} value={form.temperature} onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))} />
                <Input type="number" placeholder={t.visits.weight} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
                <Input type="number" placeholder={t.visits.height} value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.visits.diagnosis}</Label>
              <Input value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.visits.examinationNotes}</Label>
              <Textarea value={form.examinationNotes} onChange={(e) => setForm((f) => ({ ...f, examinationNotes: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.visits.treatmentPlan}</Label>
              <Textarea value={form.treatmentPlan} onChange={(e) => setForm((f) => ({ ...f, treatmentPlan: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="button" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!canSave}>
              {t.visits.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
