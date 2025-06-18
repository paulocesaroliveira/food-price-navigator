
import { useEffect } from 'react';

export const EnhancedSecurityHeaders = () => {
  useEffect(() => {
    // Generate a secure nonce for CSP
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    
    const setMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const setHttpEquivTag = (httpEquiv: string, content: string) => {
      let tag = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.httpEquiv = httpEquiv;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Enhanced Content Security Policy para melhor performance
    setHttpEquivTag('Content-Security-Policy', 
      "default-src 'self'; " +
      `script-src 'self' 'nonce-${nonce}' https://cdn.gpteng.co https://jbkuvytrvfywsnslvjos.supabase.co; ` +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://jbkuvytrvfywsnslvjos.supabase.co wss://jbkuvytrvfywsnslvjos.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "object-src 'none'; " +
      "upgrade-insecure-requests;"
    );

    // Headers de segurança para performance
    setHttpEquivTag('X-Frame-Options', 'DENY');
    setHttpEquivTag('X-Content-Type-Options', 'nosniff');
    setHttpEquivTag('X-XSS-Protection', '1; mode=block');
    setHttpEquivTag('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Referrer Policy otimizada
    setMetaTag('referrer', 'strict-origin-when-cross-origin');

    // Enhanced Permissions Policy
    setHttpEquivTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
      'accelerometer=(), gyroscope=(), magnetometer=(), serial=(), ' +
      'bluetooth=(), midi=(), push=(), notifications=()'
    );

    // CSRF token seguro
    const csrfToken = 'csrf-' + crypto.getRandomValues(new Uint32Array(4)).join('-');
    sessionStorage.setItem('csrf-token', csrfToken);
    setMetaTag('csrf-token', csrfToken);

    // Resource hints para performance
    setMetaTag('dns-prefetch', 'https://fonts.googleapis.com');
    setMetaTag('dns-prefetch', 'https://fonts.gstatic.com');
    setMetaTag('preconnect', 'https://jbkuvytrvfywsnslvjos.supabase.co');

    console.log('Enhanced security headers configured with performance optimizations');
  }, []);

  return null;
};
