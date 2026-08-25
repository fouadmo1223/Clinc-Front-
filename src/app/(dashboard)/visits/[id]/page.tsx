'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Plus, Trash2, Pill } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { Visit, Prescription, Medication } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ExportMenu } from '@/components/ui/export-menu';
import { DetailError } from '@/components/layout/detail-error';
import { toast } from '@/hooks/use-toast';

function emptyMedication(): Medication {
  return { name: '', dosage: '', frequency: '', durationDays: undefined, instructions: '' };
}

export default function VisitDetailPage() {
  const { t, dir } = useLocale();
  const { id: visitId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [rxOpen, setRxOpen] = React.useState(false);
  const [medications, setMedications] = React.useState<Medication[]>([emptyMedication()]);
  const [rxNotes, setRxNotes] = React.useState('');

  const { data: visit, isError } = useQuery({
    queryKey: ['visits', visitId],
    queryFn: () => api.get<Visit>(`/visits/${visitId}`),
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', visitId],
    queryFn: () => api.get<Prescription[]>(`/prescriptions?visitId=${visitId}`),
  });

  const openRx = () => {
    setMedications([emptyMedication()]);
    setRxNotes('');
    setRxOpen(true);
  };

  const updateMedication = (idx: number, patch: Partial<Medication>) => {
    setMedications((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const createRxMutation = useMutation({
    mutationFn: () =>
      api.post<Prescription>('/prescriptions', {
        visitId,
        medications: medications
          .filter((m) => m.name.trim())
          .map((m) => ({ ...m, durationDays: m.durationDays ? Number(m.durationDays) : undefined })),
        notes: rxNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', visitId] });
      setRxOpen(false);
      toast.success(t.toasts.prescriptionAdded);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  if (isError) {
    return <DetailError backHref="/visits" backLabel={t.visits.backToVisits} />;
  }

  if (!visit) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const v = visit.vitals;
  const hasVitals = v && Object.values(v).some((val) => val !== undefined && val !== null);

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/visits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <BackIcon className="h-3.5 w-3.5" />
          {t.visits.backToVisits}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-lg font-semibold tracking-tight">{visit.patientName}</h1>
        <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'info'}>{t.visits.statuses[visit.status]}</Badge>
        <span className="text-sm text-muted-foreground">
          {visit.doctorName} · {new Date(visit.date).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.visits.newVisitTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {visit.chiefComplaint && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.visits.chiefComplaint}</p>
                <p className="mt-0.5">{visit.chiefComplaint}</p>
              </div>
            )}
            {hasVitals && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.visits.vitals}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {v?.bloodPressureSystolic && (
                    <Badge variant="neutral">
                      {t.visits.bloodPressure}: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic ?? '—'}
                    </Badge>
                  )}
                  {v?.heartRate && <Badge variant="neutral">{t.visits.heartRate}: {v.heartRate}</Badge>}
                  {v?.temperatureCelsius && <Badge variant="neutral">{t.visits.temperature}: {v.temperatureCelsius}°</Badge>}
                  {v?.weightKg && <Badge variant="neutral">{t.visits.weight}: {v.weightKg}kg</Badge>}
                  {v?.heightCm && <Badge variant="neutral">{t.visits.height}: {v.heightCm}cm</Badge>}
                </div>
              </div>
            )}
            {visit.diagnosis && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.visits.diagnosis}</p>
                <p className="mt-0.5">{visit.diagnosis}</p>
              </div>
            )}
            {visit.examinationNotes && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.visits.examinationNotes}</p>
                <p className="mt-0.5 whitespace-pre-wrap">{visit.examinationNotes}</p>
              </div>
            )}
            {visit.treatmentPlan && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.visits.treatmentPlan}</p>
                <p className="mt-0.5 whitespace-pre-wrap">{visit.treatmentPlan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">{t.visits.prescriptions}</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={openRx}>
              <Plus className="h-3.5 w-3.5" />
              {t.visits.addPrescription}
            </Button>
          </CardHeader>
          <CardContent>
            {!prescriptions || prescriptions.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">{t.visits.noPrescriptions}</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx._id} className="rounded-md border border-border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        {rx.medications.map((med, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <div>
                              <span className="font-medium">{med.name}</span>
                              {med.dosage && <span className="text-muted-foreground"> · {med.dosage}</span>}
                              {med.frequency && <span className="text-muted-foreground"> · {med.frequency}</span>}
                              {med.durationDays && (
                                <span className="text-muted-foreground"> · {med.durationDays} {t.visits.daysUnit}</span>
                              )}
                              {med.instructions && <p className="text-xs text-muted-foreground">{med.instructions}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <ExportMenu basePath={`/prescriptions/${rx._id}`} fileName={`prescription-${rx._id}`} iconOnly />
                    </div>
                    {rx.notes && <p className="mt-2 border-t border-dashed border-border pt-2 text-xs text-muted-foreground">{rx.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rxOpen} onOpenChange={setRxOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.visits.addPrescriptionTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {medications.map((med, idx) => (
              <div key={idx} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t.visits.medication}
                    value={med.name}
                    onChange={(e) => updateMedication(idx, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMedications((prev) => prev.filter((_, i) => i !== idx))}
                    disabled={medications.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder={t.visits.dosage} value={med.dosage} onChange={(e) => updateMedication(idx, { dosage: e.target.value })} />
                  <Input placeholder={t.visits.frequency} value={med.frequency} onChange={(e) => updateMedication(idx, { frequency: e.target.value })} />
                  <Input
                    type="number"
                    placeholder={t.visits.durationDays}
                    value={med.durationDays ?? ''}
                    onChange={(e) => updateMedication(idx, { durationDays: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <Input
                  placeholder={t.visits.instructions}
                  value={med.instructions}
                  onChange={(e) => updateMedication(idx, { instructions: e.target.value })}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setMedications((prev) => [...prev, emptyMedication()])}>
              <Plus className="h-3.5 w-3.5" />
              {t.visits.addMedication}
            </Button>
            <div className="space-y-1.5">
              <Label>{t.visits.notes}</Label>
              <Textarea value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRxOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => createRxMutation.mutate()}
              loading={createRxMutation.isPending}
              disabled={!medications.some((m) => m.name.trim())}
            >
              {t.common.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
