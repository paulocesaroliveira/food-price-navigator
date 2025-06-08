
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useAuthRateLimit } from "@/hooks/useRateLimit";

interface SecureAuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

export const SecureAuthForm = ({ mode, onSuccess, onModeChange }: SecureAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  
  const { checkRateLimit, isLimited, getRemainingTime } = useAuthRateLimit();

  const isPasswordStrong = (password: string) => {
    return password.length >= 12 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    // Check account lockout
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / (1000 * 60));
      toast({
        title: "Conta temporariamente bloqueada",
        description: `Muitas tentativas falharam. Tente novamente em ${remainingMinutes} minutos.`,
        variant: "destructive",
      });
      return;
    }

    if (mode === 'register') {
      if (!isPasswordStrong(password)) {
        toast({
          title: "Senha muito fraca",
          description: "A senha deve atender a todos os critérios de segurança.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "Por favor, confirme sua senha corretamente.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
      }

      if (result.error) {
        console.error('Auth error:', result.error);
        
        // Track failed attempts
        setFailedAttempts(prev => prev + 1);
        
        // Implement progressive lockout
        if (failedAttempts >= 4) {
          const lockoutDuration = Math.pow(2, failedAttempts - 4) * 5 * 60 * 1000; // exponential backoff
          setLockoutTime(Date.now() + lockoutDuration);
        }

        if (result.error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else if (result.error.message.includes('Email not confirmed')) {
          toast({
            title: "Email não confirmado",
            description: "Verifique sua caixa de entrada e confirme seu email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro de autenticação",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        // Reset failed attempts on success
        setFailedAttempts(0);
        setLockoutTime(null);
        
        if (mode === 'register') {
          toast({
            title: "Conta criada com sucesso!",
            description: "Verifique seu email para confirmar a conta.",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
        }
        
        onSuccess?.();
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {mode === 'login' ? 'Login Seguro' : 'Criar Conta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Security warnings */}
        {failedAttempts > 2 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {failedAttempts} tentativas falharam. A conta será bloqueada após 5 tentativas.
            </AlertDescription>
          </Alert>
        )}

        {isLimited && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Muitas tentativas. Aguarde {getRemainingTime()}s antes de tentar novamente.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || isLimited}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isLimited}
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || isLimited}
                  autoComplete="new-password"
                />
              </div>

              {password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || isLimited || (mode === 'register' && !isPasswordStrong(password))}
          >
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              disabled={loading}
            >
              {mode === 'login' 
                ? 'Não tem conta? Criar nova conta' 
                : 'Já tem conta? Fazer login'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
