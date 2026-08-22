'use client';

import * as React from 'react';
import { FileDown, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useLocale } from '@/lib/i18n/locale-context';

type ExportFormat = 'pdf' | 'xlsx' | 'csv';

export interface ExportMenuProps {
  /** API path without extension, e.g. `/invoices/${id}` — `/pdf`, `/xlsx`, `/csv` are appended. */
  basePath: string;
  fileName: string;
  label?: string;
  /** Compact icon-only trigger for tight spaces (e.g. a list row) instead of a labeled button. */
  iconOnly?: boolean;
}

export function ExportMenu({ basePath, fileName, label, iconOnly }: ExportMenuProps) {
  const { t } = useLocale();
  const [loading, setLoading] = React.useState(false);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    try {
      const blob = await api.getBlob(`${basePath}/${format}`);
      const url = URL.createObjectURL(blob);
      if (format === 'pdf') {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const menuContent = (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => handleExport('pdf')}>PDF</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Excel</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleExport('csv')}>CSV</DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (iconOnly) {
    return (
      <DropdownMenu>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" loading={loading} aria-label={label ?? t.common.export}>
                <FileDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{label ?? t.common.export}</TooltipContent>
        </Tooltip>
        {menuContent}
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" loading={loading}>
          <FileDown className="h-3.5 w-3.5" />
          {label ?? t.common.export}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  );
}
