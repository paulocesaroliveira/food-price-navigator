
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags (for development)
    // In production, these should be set by the server
    
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

    // Content Security Policy
    setHttpEquivTag('Content-Security-Policy', 
      "default-src 'self' https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://jbkuvytrvfywsnslvjos.supabase.co; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://jbkuvytrvfywsnslvjos.supabase.co wss://jbkuvytrvfywsnslvjos.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self';"
    );

    // X-Frame-Options
    setHttpEquivTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    setHttpEquivTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    setMetaTag('referrer', 'strict-origin-when-cross-origin');

    // Permissions Policy
    setHttpEquivTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    );

    // CSRF protection token (should be generated server-side in production)
    const csrfToken = localStorage.getItem('csrf-token') || 
                     'csrf-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('csrf-token', csrfToken);
    setMetaTag('csrf-token', csrfToken);

    console.log('Security headers configured');
  }, []);

  return null; // This component doesn't render anything
};
