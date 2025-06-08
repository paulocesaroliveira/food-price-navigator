
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const passwordCriteria: PasswordCriteria[] = [
  { label: "Mínimo 12 caracteres", test: (p) => p.length >= 12 },
  { label: "Letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Letra minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "Número", test: (p) => /\d/.test(p) },
  { label: "Caractere especial", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const PasswordStrengthIndicator = ({ password, className }: PasswordStrengthIndicatorProps) => {
  const passedCriteria = passwordCriteria.filter(criteria => criteria.test(password));
  const strength = (passedCriteria.length / passwordCriteria.length) * 100;
  
  const getStrengthLabel = () => {
    if (strength === 0) return { label: "Muito Fraca", color: "destructive" };
    if (strength <= 40) return { label: "Fraca", color: "destructive" };
    if (strength <= 60) return { label: "Média", color: "secondary" };
    if (strength <= 80) return { label: "Boa", color: "default" };
    return { label: "Muito Forte", color: "default" };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Força da senha:</span>
          <Badge variant={strengthInfo.color as any} className="text-xs">
            {strengthInfo.label}
          </Badge>
        </div>
        <Progress 
          value={strength} 
          className="h-2"
          style={{
            '--progress-background': strength <= 40 ? '#ef4444' : 
                                   strength <= 60 ? '#f97316' : 
                                   strength <= 80 ? '#eab308' : '#22c55e'
          } as React.CSSProperties}
        />
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground mb-2">Critérios de segurança:</p>
        {passwordCriteria.map((criteria, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criteria.test(password) ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-red-500" />
            )}
            <span className={criteria.test(password) ? "text-green-700" : "text-gray-500"}>
              {criteria.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
