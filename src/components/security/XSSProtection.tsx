
import React from 'react';

// Enhanced XSS protection utilities
export const sanitizeHTML = (input: string): string => {
  if (!input) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.textContent = input;
  
  return temp.innerHTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#61;');
};

export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  // Remove javascript: and data: protocols
  const cleaned = url.replace(/^\s*(javascript|data|vbscript):/i, '');
  
  // Ensure URL starts with http, https, or is relative
  if (!/^(https?:\/\/|\/|#|\?)/i.test(cleaned)) {
    return '#';
  }
  
  return cleaned;
};

export const sanitizeProps = (props: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Sanitize string values
      if (key.toLowerCase().includes('href') || key.toLowerCase().includes('src')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.toLowerCase().includes('html')) {
        sanitized[key] = sanitizeHTML(value);
      } else {
        sanitized[key] = sanitizeHTML(value);
      }
    } else if (typeof value === 'function') {
      // Wrap event handlers to prevent XSS
      sanitized[key] = (...args: any[]) => {
        try {
          return value(...args);
        } catch (error) {
          console.error('XSS Protection: Blocked potentially malicious event handler');
          return null;
        }
      };
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

interface SafeComponentProps {
  children: React.ReactNode;
  allowedTags?: string[];
}

export const SafeComponent: React.FC<SafeComponentProps> = ({ 
  children, 
  allowedTags = ['div', 'span', 'p', 'a', 'img', 'button'] 
}) => {
  // Validate that children don't contain dangerous content
  const validateChildren = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return sanitizeHTML(node);
    }
    
    if (React.isValidElement(node)) {
      const elementType = typeof node.type === 'string' ? node.type : node.type.name;
      
      if (!allowedTags.includes(elementType)) {
        console.warn(`XSS Protection: Blocked potentially unsafe element: ${elementType}`);
        return null;
      }
      
      const sanitizedProps = sanitizeProps(node.props);
      return React.cloneElement(node, sanitizedProps);
    }
    
    if (Array.isArray(node)) {
      return node.map(validateChildren);
    }
    
    return node;
  };
  
  return <>{validateChildren(children)}</>;
};

// Hook for safe user input handling
export const useSafeInput = () => {
  const sanitizeInput = React.useCallback((input: string, options: {
    allowHTML?: boolean;
    maxLength?: number;
    stripTags?: boolean;
  } = {}) => {
    if (!input) return '';
    
    let sanitized = input.trim();
    
    // Apply length limit
    if (options.maxLength) {
      sanitized = sanitized.slice(0, options.maxLength);
    }
    
    // Strip HTML tags if requested
    if (options.stripTags) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Apply HTML sanitization unless explicitly allowed
    if (!options.allowHTML) {
      sanitized = sanitizeHTML(sanitized);
    }
    
    return sanitized;
  }, []);
  
  return { sanitizeInput };
};
