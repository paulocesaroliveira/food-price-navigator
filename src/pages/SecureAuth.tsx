import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { PasswordStrengthIndicator } from "@/components/security/PasswordStrengthIndicator";
import { useAuthRateLimit } from "@/hooks/useRateLimit";
import { EnhancedSecurityHeaders } from "@/components/security/EnhancedSecurityHeaders";

const SecureAuth = () => {
  const { user, signInWithPassword, signUp, loading } = useSecureAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rate limiting for auth attempts - using the hook directly without RateLimiter component
  const { checkRateLimit, isLimited, getRemainingTime } = useAuthRateLimit();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const isPasswordStrong = (password: string) => {
    return password.length >= 12 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  const validateForm = () => {
    if (!checkRateLimit()) {
      return false;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        toast({
          title: "Erro",
          description: "Nome completo é obrigatório.",
          variant: "destructive",
        });
        return false;
      }
      if (!storeName.trim()) {
        toast({
          title: "Erro",
          description: "Nome da loja é obrigatório.",
          variant: "destructive",
        });
        return false;
      }
      if (!isPasswordStrong(password)) {
        toast({
          title: "Senha muito fraca",
          description: "A senha deve atender a todos os critérios de segurança.",
          variant: "destructive",
        });
        return false;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setAuthLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password, {
          data: {
            full_name: fullName,
            store_name: storeName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        });
      } else {
        result = await signInWithPassword(email, password);
      }
      
      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else if (result.error.message.includes('Account locked')) {
          toast({
            title: "Conta bloqueada",
            description: "Muitas tentativas falharam. Aguarde antes de tentar novamente.",
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
        if (isSignUp) {
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
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <EnhancedSecurityHeaders />
      <div className="min-h-screen bg-gradient-to-br from-food-light via-white to-food-cardlight flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-10 w-10 text-food-coral" />
              <span className="text-3xl font-bold text-food-textlight">TastyHub</span>
            </div>
            <p className="text-food-secondaryLight">
              {isSignUp ? "Crie sua conta segura" : "Acesso seguro à sua conta"}
            </p>
          </div>

          <Card className="border-food-borderLight shadow-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-food-textlight flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                {isSignUp ? "Criar Conta Segura" : "Login Seguro"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Security Status */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Conexão segura ativa • Dados criptografados</span>
                </div>
              </div>

              {/* Rate limit warning */}
              {isLimited && (
                <Alert className="mb-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Muitas tentativas. Aguarde {getRemainingTime()}s antes de tentar novamente.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-food-textlight font-medium">
                        Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        className="border-food-borderLight focus:border-food-coral"
                        required
                        disabled={authLoading || isLimited}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="storeName" className="text-food-textlight font-medium">
                        Nome da Loja
                      </Label>
                      <Input
                        id="storeName"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Digite o nome da sua loja"
                        className="border-food-borderLight focus:border-food-coral"
                        required
                        disabled={authLoading || isLimited}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-food-textlight font-medium">
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="border-food-borderLight focus:border-food-coral"
                        required
                        disabled={authLoading || isLimited}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email" className="text-food-textlight font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="border-food-borderLight focus:border-food-coral"
                    required
                    disabled={authLoading || isLimited}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-food-textlight font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="border-food-borderLight focus:border-food-coral pr-10"
                      required
                      disabled={authLoading || isLimited}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-food-secondaryLight hover:text-food-textlight"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {isSignUp && (
                  <>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-food-textlight font-medium">
                        Confirmar Senha
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="border-food-borderLight focus:border-food-coral"
                        required
                        disabled={authLoading || isLimited}
                      />
                    </div>

                    {password && (
                      <PasswordStrengthIndicator password={password} />
                    )}
                  </>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-food-coral hover:bg-food-amber transition-colors text-white font-medium py-3" 
                  disabled={authLoading || isLimited || (isSignUp && !isPasswordStrong(password))}
                >
                  {authLoading ? "Processando..." : isSignUp ? "Criar Conta Segura" : "Entrar"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-food-coral hover:text-food-amber text-sm font-medium"
                  disabled={authLoading}
                >
                  {isSignUp ? "Já tem uma conta? Entrar" : "Não tem uma conta? Criar conta segura"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SecureAuth;
