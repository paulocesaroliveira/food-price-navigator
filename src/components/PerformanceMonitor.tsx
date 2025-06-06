
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Database, Wifi } from "lucide-react";

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  queryCount: number;
  networkLatency: number;
  memoryUsage: number;
}

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  onSlowPerformance?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor = ({ 
  showMetrics = false, 
  onSlowPerformance 
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    renderTime: 0,
    queryCount: 0,
    networkLatency: 0,
    memoryUsage: 0
  });

  const [performanceStatus, setPerformanceStatus] = useState<'good' | 'warning' | 'poor'>('good');

  useEffect(() => {
    // Performance monitoring setup
    const startTime = performance.now();

    // Measure page load time
    if (document.readyState === 'complete') {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    }

    // Measure render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({ ...prev, renderTime: entry.duration }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Memory usage monitoring
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize / (1024 * 1024); // MB
        setMetrics(prev => ({ ...prev, memoryUsage: usedMemory }));
      }
    };

    // Network latency estimation
    const measureNetworkLatency = async () => {
      const start = performance.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const latency = performance.now() - start;
        setMetrics(prev => ({ ...prev, networkLatency: latency }));
      } catch (error) {
        console.warn('Could not measure network latency:', error);
      }
    };

    // Query count tracking (simplified)
    let queryCount = 0;
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      queryCount++;
      setMetrics(prev => ({ ...prev, queryCount }));
      return originalFetch(...args);
    };

    // Run measurements
    updateMemoryUsage();
    measureNetworkLatency();

    // Performance monitoring interval
    const interval = setInterval(() => {
      updateMemoryUsage();
      
      // Evaluate performance status
      const currentMetrics = metrics;
      let status: 'good' | 'warning' | 'poor' = 'good';
      
      if (
        currentMetrics.pageLoadTime > 3000 ||
        currentMetrics.renderTime > 100 ||
        currentMetrics.networkLatency > 1000 ||
        currentMetrics.memoryUsage > 100
      ) {
        status = 'warning';
      }
      
      if (
        currentMetrics.pageLoadTime > 5000 ||
        currentMetrics.renderTime > 200 ||
        currentMetrics.networkLatency > 2000 ||
        currentMetrics.memoryUsage > 200
      ) {
        status = 'poor';
      }
      
      setPerformanceStatus(status);
      
      if (status === 'poor' && onSlowPerformance) {
        onSlowPerformance(currentMetrics);
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.fetch = originalFetch;
    };
  }, []);

  if (!showMetrics) return null;

  const getStatusColor = () => {
    switch (performanceStatus) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = () => {
    switch (performanceStatus) {
      case 'good': return 'Excelente';
      case 'warning': return 'Moderado';
      case 'poor': return 'Lento';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Badge className={getStatusColor()}>
            <Activity className="h-3 w-3 mr-1" />
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>Carregamento: {metrics.pageLoadTime.toFixed(0)}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-gray-500" />
            <span>Consultas: {metrics.queryCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-gray-500" />
            <span>Latência: {metrics.networkLatency.toFixed(0)}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-gray-500" />
            <span>Memória: {metrics.memoryUsage.toFixed(1)}MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
