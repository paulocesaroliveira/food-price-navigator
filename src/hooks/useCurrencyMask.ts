
import { useState, useCallback } from 'react';

export const useCurrencyMask = (initialValue: number = 0) => {
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  const [displayValue, setDisplayValue] = useState(() => formatCurrency(initialValue));

  const parseCurrency = useCallback((value: string): number => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Se não há dígitos, retorna 0
    if (!numericValue) return 0;
    
    // Converte para centavos (últimos 2 dígitos são centavos)
    const parsed = parseFloat(numericValue) / 100;
    
    return parsed;
  }, []);

  const handleChange = useCallback((value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Se não há dígitos, limpa o campo
    if (!numericValue) {
      setDisplayValue('');
      return 0;
    }
    
    // Converte para número (em centavos)
    const parsed = parseFloat(numericValue) / 100;
    
    // Formata como currency
    const formatted = formatCurrency(parsed);
    
    setDisplayValue(formatted);
    return parsed;
  }, [formatCurrency]);

  const setValue = useCallback((value: number) => {
    const formatted = formatCurrency(value);
    setDisplayValue(formatted);
  }, [formatCurrency]);

  return {
    displayValue,
    setValue,
    handleChange,
    parseCurrency,
    formatCurrency,
  };
};
