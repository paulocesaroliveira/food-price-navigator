
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Enhanced sanitization utility
export const sanitizeInput = (input: string, options: {
  allowHTML?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
} = {}): string => {
  if (!input) return '';

  let sanitized = input.trim();

  // Apply length limit
  if (options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }

  // Filter allowed characters
  if (options.allowedChars) {
    sanitized = sanitized.replace(options.allowedChars, '');
  }

  // HTML sanitization
  if (!options.allowHTML) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remove potential SQL injection patterns
  sanitized = sanitized.replace(
    /(\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|CREATE|ALTER|EXEC)\b)|(-{2,})|\/\*|\*\//gi,
    ''
  );

  // Remove script tags and javascript: protocols
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
};

// Secure Input component
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sanitizationOptions?: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
  };
  onSecureChange?: (sanitizedValue: string) => void;
}

export const SecureInput = ({ 
  sanitizationOptions = {}, 
  onSecureChange,
  onChange,
  ...props 
}: SecureInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value, sanitizationOptions);
    
    // Update the input value with sanitized content
    e.target.value = sanitizedValue;
    
    // Call original onChange if provided
    onChange?.(e);
    
    // Call secure change handler
    onSecureChange?.(sanitizedValue);
  };

  return <Input {...props} onChange={handleChange} />;
};

// Secure Textarea component
interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  sanitizationOptions?: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
  };
  onSecureChange?: (sanitizedValue: string) => void;
}

export const SecureTextarea = ({ 
  sanitizationOptions = {}, 
  onSecureChange,
  onChange,
  ...props 
}: SecureTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value, sanitizationOptions);
    
    // Update the textarea value with sanitized content
    e.target.value = sanitizedValue;
    
    // Call original onChange if provided
    onChange?.(e);
    
    // Call secure change handler
    onSecureChange?.(sanitizedValue);
  };

  return <Textarea {...props} onChange={handleChange} />;
};

// Hook for input sanitization
export const useSanitizedInput = (
  initialValue: string = '',
  sanitizationOptions: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
  } = {}
) => {
  const [value, setValue] = React.useState(() => 
    sanitizeInput(initialValue, sanitizationOptions)
  );

  const setSanitizedValue = React.useCallback((newValue: string) => {
    const sanitized = sanitizeInput(newValue, sanitizationOptions);
    setValue(sanitized);
    return sanitized;
  }, [sanitizationOptions]);

  return [value, setSanitizedValue] as const;
};
