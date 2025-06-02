
import { useState, useCallback } from 'react';

export const usePercentageMask = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = useState(initialValue.toString());

  const handleChange = useCallback((value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(',', '.');
    
    // Atualiza o display
    setDisplayValue(cleanValue);
    
    // Retorna o valor numérico
    const numericValue = parseFloat(normalizedValue) || 0;
    return Math.min(numericValue, 100); // Limita a 100%
  }, []);

  const setValue = useCallback((value: number) => {
    setDisplayValue(value.toString());
  }, []);

  return {
    displayValue,
    setValue,
    handleChange,
  };
};
