// Reusable form input component

import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl
            text-white placeholder-white/50 focus:outline-none focus:ring-2
            focus:ring-blue-500 focus:border-transparent transition-all duration-200
            ${error ? 'border-red-400 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-300 text-sm">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
