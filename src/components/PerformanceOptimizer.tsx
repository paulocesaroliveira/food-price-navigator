
import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Otimizar carregamento de recursos
    const optimizeResources = () => {
      // Adicionar preload para fontes críticas
      const linkFont = document.createElement('link');
      linkFont.rel = 'preload';
      linkFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      linkFont.as = 'style';
      linkFont.onload = () => {
        linkFont.rel = 'stylesheet';
      };
      document.head.appendChild(linkFont);

      // Adicionar prefetch para recursos importantes
      const linkPrefetch = document.createElement('link');
      linkPrefetch.rel = 'prefetch';
      linkPrefetch.href = '/favicon.ico';
      document.head.appendChild(linkPrefetch);

      // Otimizar imagens lazy loading
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img: any) => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      }
    };

    // Implementar debounce para scroll events
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Lógica de scroll otimizada
      }, 10);
    };

    // Otimizar eventos de resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Lógica de resize otimizada
      }, 150);
    };

    // Configurar observers para performance
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observar imagens lazy
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Executar otimizações
    optimizeResources();

    // Adicionar event listeners otimizados
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

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
