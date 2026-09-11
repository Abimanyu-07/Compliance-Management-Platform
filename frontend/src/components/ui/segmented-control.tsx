import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Option<T extends string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  description?: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/80',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold transition-all duration-150 cursor-pointer select-none',
              isSelected
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            )}
          >
            {option.icon && <span className={cn(isSelected ? 'text-slate-900' : 'text-slate-400')}>{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
