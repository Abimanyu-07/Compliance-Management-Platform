import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-slate-900 text-slate-50 shadow-xs',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200/80',
    outline: 'text-slate-950 border border-slate-200',
    success: 'border-transparent bg-emerald-100 text-emerald-800 font-medium',
    destructive: 'border-transparent bg-red-100 text-red-800 font-medium',
    warning: 'border-transparent bg-amber-100 text-amber-900 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
