
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Enhanced sanitization utility
export const sanitizeInput = (input: string, options: {
  allowHTML?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
  stripDangerous?: boolean;
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

  // Strip dangerous patterns if requested
  if (options.stripDangerous) {
    // Remove potential XSS vectors
    sanitized = sanitized.replace(
      /(?:on\w+\s*=|javascript:|data:(?!image\/[a-z]+;base64,)|vbscript:|about:|chrome:|resource:)/gi,
      ''
    );
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

  // Enhanced SQL injection prevention
  sanitized = sanitized.replace(
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UNION|UPDATE)\b)|(-{2,})|\/\*|\*\/|;(?=\s*$)/gi,
    ''
  );

  // Remove script tags and javascript: protocols
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  return sanitized;
};

// Validation patterns
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  currency: /^\d+(\.\d{1,2})?$/,
  name: /^[a-zA-ZÀ-ÿ\s'-]{1,50}$/
};

// Enhanced secure input component
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sanitizationOptions?: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
    stripDangerous?: boolean;
  };
  validationPattern?: RegExp;
  onSecureChange?: (sanitizedValue: string, isValid: boolean) => void;
  showValidation?: boolean;
}

export const SecureInput: React.FC<SecureInputProps> = ({ 
  sanitizationOptions = { stripDangerous: true }, 
  validationPattern,
  onSecureChange,
  showValidation = false,
  onChange,
  className = '',
  ...props 
}) => {
  const [isValid, setIsValid] = React.useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue, sanitizationOptions);
    
    // Update the input value with sanitized content
    e.target.value = sanitizedValue;
    
    // Validate if pattern provided
    const valid = validationPattern ? validationPattern.test(sanitizedValue) : true;
    setIsValid(valid);
    
    // Call callbacks
    onChange?.(e);
    onSecureChange?.(sanitizedValue, valid);
  };

  const inputClassName = `${className} ${
    showValidation && !isValid ? 'border-destructive focus:border-destructive' : ''
  }`;

  return <Input {...props} className={inputClassName} onChange={handleChange} />;
};

// Enhanced secure textarea component
interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  sanitizationOptions?: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
    stripDangerous?: boolean;
  };
  validationPattern?: RegExp;
  onSecureChange?: (sanitizedValue: string, isValid: boolean) => void;
  showValidation?: boolean;
}

export const SecureTextarea: React.FC<SecureTextareaProps> = ({ 
  sanitizationOptions = { stripDangerous: true }, 
  validationPattern,
  onSecureChange,
  showValidation = false,
  onChange,
  className = '',
  ...props 
}) => {
  const [isValid, setIsValid] = React.useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue, sanitizationOptions);
    
    // Update the textarea value with sanitized content
    e.target.value = sanitizedValue;
    
    // Validate if pattern provided
    const valid = validationPattern ? validationPattern.test(sanitizedValue) : true;
    setIsValid(valid);
    
    // Call callbacks
    onChange?.(e);
    onSecureChange?.(sanitizedValue, valid);
  };

  const textareaClassName = `${className} ${
    showValidation && !isValid ? 'border-destructive focus:border-destructive' : ''
  }`;

  return <Textarea {...props} className={textareaClassName} onChange={handleChange} />;
};

export default { SecureInput, SecureTextarea, sanitizeInput, ValidationPatterns };
