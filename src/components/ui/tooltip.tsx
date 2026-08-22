'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        'z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md',
        'data-[state=delayed-open]:animate-fade-in data-[state=instant-open]:animate-fade-in',
        'data-[side=top]:origin-bottom data-[side=bottom]:origin-top data-[side=start]:origin-end data-[side=end]:origin-start',
        className,
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-foreground" width={10} height={5} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Icon-button tooltip shorthand: wrap a trigger with a label, no separate
 * provider/content boilerplate at call sites. Also stamps aria-label onto
 * the trigger — Radix only wires aria-describedby, which isn't enough to
 * give an icon-only button (no visible text) an accessible name.
 */
function IconTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{React.cloneElement(children, { 'aria-label': label })}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, IconTooltip };

