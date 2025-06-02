
import { useState, useCallback } from 'react';

export const usePercentageMask = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = useState(initialValue.toString());

  const handleChange = useCallback((value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(',', '.');
    
    // Atualiza o display mantendo o valor original
    setDisplayValue(cleanValue);
    
    // Retorna o valor numérico mantendo os decimais
    const numericValue = parseFloat(normalizedValue) || 0;
    return Math.min(numericValue, 100); // Limita a 100%
  }, []);

  const setValue = useCallback((value: number) => {
    // Mantém os decimais no display
    const displayVal = value.toString();
    setDisplayValue(displayVal);
  }, []);

  return {
    displayValue,
    setValue,
    handleChange,
  };
};
