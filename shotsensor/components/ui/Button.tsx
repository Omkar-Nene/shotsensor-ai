/**
 * Mobile-first Button component
 * Large touch targets (min 44x44px) for mobile usability
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles - large touch targets for mobile
        'relative rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-offset-2',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',

        // Size variants
        {
          'px-4 py-2 text-sm min-h-[44px]': size === 'sm',
          'px-6 py-3 text-base min-h-[48px]': size === 'md',
          'px-8 py-4 text-lg min-h-[56px]': size === 'lg',
        },

        // Color variants
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 active:bg-blue-800':
            variant === 'primary',
          'bg-green-600 text-white hover:bg-green-700 focus:ring-green-300 active:bg-green-800':
            variant === 'secondary',
          'bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 focus:ring-gray-200':
            variant === 'outline',
          'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200':
            variant === 'ghost',
        },

        // Width
        {
          'w-full': fullWidth,
        },

        // Custom className
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
