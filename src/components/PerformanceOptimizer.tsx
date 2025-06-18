
import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Otimizar carregamento de recursos críticos
    const optimizeResources = () => {
      // Preload de fontes críticas com display swap
      const linkFont = document.createElement('link');
      linkFont.rel = 'preload';
      linkFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      linkFont.as = 'style';
      linkFont.crossOrigin = 'anonymous';
      linkFont.onload = () => {
        linkFont.rel = 'stylesheet';
      };
      document.head.appendChild(linkFont);

      // Prefetch recursos importantes
      const resources = ['/favicon.ico'];
      resources.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });

      // Lazy loading de imagens
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img: any) => {
          img.src = img.dataset.src;
          img.loading = 'lazy';
          img.removeAttribute('data-src');
        });
      }
    };

    // Debounce para eventos de scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Lógica de scroll otimizada
      }, 16); // ~60fps
    };

    // Throttle para eventos de resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Lógica de resize otimizada
      }, 250);
    };

    // Intersection Observer para lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.loading = 'lazy';
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observar imagens lazy
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Executar otimizações
    optimizeResources();

    // Event listeners otimizados
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;
