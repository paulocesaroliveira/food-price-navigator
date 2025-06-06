
import React from 'react';

// Utility functions for input sanitization
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '') // Remove event handlers (single quotes)
    .replace(/[<>]/g, (match) => {
      return match === '<' ? '&lt;' : '&gt;';
    })
    .trim();
};

export const sanitizeNumber = (input: string | number): number => {
  if (typeof input === 'number') return isFinite(input) ? input : 0;
  
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
};

export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const cleaned = input.toLowerCase().trim();
  
  return emailRegex.test(cleaned) ? cleaned : '';
};

export const sanitizePhone = (input: string): string => {
  if (!input) return '';
  
  // Remove all non-digit characters except + at the beginning
  const cleaned = input.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  
  // Limit length to reasonable phone number size
  return cleaned.slice(0, 15);
};

export const sanitizeFileName = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>:"/\\|?*]/g, '') // Remove unsafe file characters
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
    .slice(0, 255); // Limit length
};

export const validateAndSanitize = {
  text: sanitizeText,
  number: sanitizeNumber,
  email: sanitizeEmail,
  phone: sanitizePhone,
  fileName: sanitizeFileName,
  
  // SQL injection prevention
  sqlSafe: (input: string): string => {
    if (!input) return '';
    return input.replace(/['";\\]/g, '');
  },
  
  // XSS prevention for rich text
  richText: (input: string): string => {
    if (!input) return '';
    
    const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    return input.replace(tagRegex, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
  }
};

// React component for safe text rendering
interface SafeTextProps {
  children: string;
  type?: 'text' | 'email' | 'phone' | 'richText';
  className?: string;
}

export const SafeText: React.FC<SafeTextProps> = ({ 
  children, 
  type = 'text', 
  className 
}) => {
  let sanitized: string;
  
  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(children);
      break;
    case 'phone':
      sanitized = sanitizePhone(children);
      break;
    case 'richText':
      sanitized = validateAndSanitize.richText(children);
      return (
        <div 
          className={className}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      );
    default:
      sanitized = sanitizeText(children);
  }
  
  return <span className={className}>{sanitized}</span>;
};

export default SafeText;
