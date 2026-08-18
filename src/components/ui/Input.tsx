import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  'data-testid'?: string;
  'data-test-id'?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-zinc-500">{label}</label>}
        <input
          ref={ref}
          className={`h-12 rounded-[16px] bg-zinc-50 px-4 py-2 text-sm text-zinc-900 transition-all 
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 
            disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20' : 'border border-transparent focus:border-zinc-200'} ${className}`}
          {...props}
          data-testid={props['data-testid'] || props['data-test-id']}
        />
        {error && <span className="text-xs text-[#ef4444]">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
