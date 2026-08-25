'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Wallet, Undo2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { Invoice, Payment, InvoiceStatus, PaymentMethod } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailError } from '@/components/layout/detail-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportMenu } from '@/components/ui/export-menu';
import { toast } from '@/hooks/use-toast';

const STATUS_VARIANT: Record<InvoiceStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  UNPAID: 'warning',
  PARTIALLY_PAID: 'info',
  PAID: 'success',
  CANCELLED: 'destructive',
};

export default function InvoiceDetailPage() {
  const { t, dir } = useLocale();
  const { id: invoiceId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState('');
  const [payMethod, setPayMethod] = React.useState<PaymentMethod>('CASH');
  const [payReference, setPayReference] = React.useState('');

  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundAmount, setRefundAmount] = React.useState('');
  const [refundMethod, setRefundMethod] = React.useState<PaymentMethod>('CASH');
  const [refundNotes, setRefundNotes] = React.useState('');

  const { data: invoice, isError } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => api.get<Invoice>(`/invoices/${invoiceId}`),
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', invoiceId],
    queryFn: () => api.get<Payment[]>(`/payments?invoiceId=${invoiceId}`),
  });

  const balanceDue = invoice ? invoice.total - invoice.amountPaid : 0;

  const openPay = () => {
    setPayAmount(balanceDue > 0 ? balanceDue.toFixed(2) : '');
    setPayMethod('CASH');
    setPayReference('');
    setPayOpen(true);
  };

  const openRefund = () => {
    setRefundAmount('');
    setRefundMethod('CASH');
    setRefundNotes('');
    setRefundOpen(true);
  };

  const payMutation = useMutation({
    mutationFn: () =>
      api.post<Payment>('/payments', {
        invoiceId,
        amount: Number(payAmount),
        method: payMethod,
        reference: payReference || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setPayOpen(false);
      toast.success(t.toasts.paymentRecorded);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const refundMutation = useMutation({
    mutationFn: () =>
      api.post<Payment>('/payments/refund', {
        invoiceId,
        amount: Number(refundAmount),
        method: refundMethod,
        notes: refundNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setRefundOpen(false);
      toast.success(t.toasts.refundRecorded);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  if (isError) {
    return <DetailError backHref="/invoices" backLabel={t.invoices.backToInvoices} />;
  }

  if (!invoice) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <BackIcon className="h-3.5 w-3.5" />
          {t.invoices.backToInvoices}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-lg font-semibold tracking-tight">{invoice.patientName}</h1>
        <Badge variant={STATUS_VARIANT[invoice.status]}>{t.invoices.statuses[invoice.status]}</Badge>
        <ExportMenu basePath={`/invoices/${invoiceId}`} fileName={`invoice-${invoiceId}`} />
        {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
          <Button size="sm" onClick={openPay}>
            <Wallet className="h-3.5 w-3.5" />
            {t.invoices.recordPayment}
          </Button>
        )}
        {invoice.amountPaid > 0 && (
          <Button size="sm" variant="outline" onClick={openRefund}>
            <Undo2 className="h-3.5 w-3.5" />
            {t.invoices.refund}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.invoices.item}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.invoices.description}</th>
                  <th>{t.invoices.quantity}</th>
                  <th>{t.invoices.unitPrice}</th>
                  <th>{t.invoices.total}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td className="tabular-nums text-muted-foreground">{item.quantity}</td>
                    <td className="tabular-nums text-muted-foreground">{item.unitPrice.toFixed(2)}</td>
                    <td className="tabular-nums">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.invoices.subtotal}</span>
                <span className="tabular-nums">{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.invoices.discount}</span>
                  <span className="tabular-nums">-{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>{t.invoices.total}</span>
                <span className="tabular-nums">{invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t.invoices.amountPaid}</span>
                <span className="tabular-nums">{invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-primary">
                <span>{t.invoices.balanceDue}</span>
                <span className="tabular-nums">{balanceDue.toFixed(2)}</span>
              </div>
            </div>
            {invoice.notes && <p className="mt-3 border-t border-dashed border-border pt-3 text-xs text-muted-foreground">{invoice.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.invoices.payments}</CardTitle>
          </CardHeader>
          <CardContent>
            {!payments || payments.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">{t.invoices.noPayments}</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                    <div>
                      <span className={p.type === 'REFUND' ? 'font-medium text-destructive' : 'font-medium'}>
                        {p.type === 'REFUND' ? '-' : ''}{p.amount.toFixed(2)}
                      </span>
                      <span className="ms-2 text-xs text-muted-foreground">{t.invoices.methods[p.method]}</span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{new Date(p.paidAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.invoices.recordPaymentTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.invoices.amount}</Label>
              <Input type="number" min={0.01} step={0.01} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.method}</Label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(t.invoices.methods) as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>{t.invoices.methods[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.reference}</Label>
              <Input value={payReference} onChange={(e) => setPayReference(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPayOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => payMutation.mutate()}
              loading={payMutation.isPending}
              disabled={!payAmount || Number(payAmount) <= 0}
            >
              {t.invoices.recordPayment}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.invoices.refundTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.invoices.amount}</Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                max={invoice.amountPaid}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.method}</Label>
              <Select value={refundMethod} onValueChange={(v) => setRefundMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(t.invoices.methods) as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>{t.invoices.methods[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.notes}</Label>
              <Textarea value={refundNotes} onChange={(e) => setRefundNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRefundOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => refundMutation.mutate()}
              loading={refundMutation.isPending}
              disabled={!refundAmount || Number(refundAmount) <= 0 || Number(refundAmount) > invoice.amountPaid}
            >
              {t.invoices.refund}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
