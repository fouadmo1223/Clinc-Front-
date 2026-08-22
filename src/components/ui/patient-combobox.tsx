'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLocale } from '@/lib/i18n/locale-context';
import type { Patient, PaginatedResult } from '@/types/domain';
import { AvatarInitials } from '@/components/ui/avatar-initials';

export interface PatientComboboxProps {
  value?: string;
  onChange: (patientId: string, patient: Patient) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function PatientCombobox({ value, onChange, id, className, disabled }: PatientComboboxProps) {
  const { t } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [selected, setSelected] = React.useState<Patient | null>(null);

  const { data } = useQuery({
    queryKey: ['patients-combobox', search],
    queryFn: () => api.get<PaginatedResult<Patient>>(`/patients?limit=8${search ? `&search=${encodeURIComponent(search)}` : ''}`),
    enabled: open,
  });

  React.useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  const patients = data?.items ?? [];

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-sm shadow-xs transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <AvatarInitials name={selected.fullName} className="h-5 w-5 text-[10px]" />
              <span className="truncate">{selected.fullName}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{t.appointments.patient}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-lg border border-border bg-surface p-2 shadow-popover data-[state=open]:animate-dialog-in"
        >
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.appointments.patientPlaceholder}
              className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {patients.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">{t.appointments.noPatientResults}</p>
            ) : (
              patients.map((patient) => (
                <button
                  key={patient._id}
                  type="button"
                  onClick={() => {
                    setSelected(patient);
                    onChange(patient._id, patient);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-sm hover:bg-secondary"
                >
                  <AvatarInitials name={patient.fullName} className="h-6 w-6 text-[10px]" />
                  <span className="min-w-0 flex-1 truncate">{patient.fullName}</span>
                  <span dir="ltr" className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {patient.phone}
                  </span>
                  {value === patient._id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
