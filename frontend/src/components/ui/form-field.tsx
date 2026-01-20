import { forwardRef } from 'react'
import { Label } from './label'
import { Input, InputProps } from './input'
import { cn } from '@/lib/utils'

export interface FormFieldProps extends InputProps {
  label: string
  error?: string
  required?: boolean
  helperText?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, helperText, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          error={error}
          className={cn(className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-destructive font-medium animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${fieldId}-helper`}
            className="text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
