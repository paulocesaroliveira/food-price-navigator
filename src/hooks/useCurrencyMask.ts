
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
    // Remove todos os caracteres não numéricos exceto vírgula
    const numericValue = value.replace(/[^\d,]/g, '');
    
    // Converte vírgula para ponto e transforma em número
    const parsed = parseFloat(numericValue.replace(',', '.')) || 0;
    
    return parsed;
  }, []);

  const handleChange = useCallback((value: string) => {
    // Remove caracteres não numéricos exceto vírgula
    let numericValue = value.replace(/[^\d,]/g, '');
    
    // Garante que só tenha uma vírgula
    const parts = numericValue.split(',');
    if (parts.length > 2) {
      numericValue = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      numericValue = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    const parsed = parseCurrency(numericValue);
    const formatted = formatCurrency(parsed);
    
    setDisplayValue(formatted);
    return parsed;
  }, [formatCurrency, parseCurrency]);

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
