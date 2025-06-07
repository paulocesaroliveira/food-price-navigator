
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChefHat, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Auth = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
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
      if (!phone.trim()) {
        toast({
          title: "Erro",
          description: "Telefone é obrigatório.",
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
      if (password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              store_name: storeName,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta e fazer login.",
        });
        
        // Resetar formulário
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setStoreName("");
        setPhone("");
        setIsSignUp(false);
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao FoodPrice.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-food-light via-white to-food-cardlight flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="absolute top-4 left-4 text-food-secondaryLight hover:text-food-textlight"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-10 w-10 text-food-coral" />
            <span className="text-3xl font-bold text-food-textlight">FoodPrice</span>
          </div>
          <p className="text-food-secondaryLight">
            {isSignUp ? "Crie sua conta e comece seu teste gratuito" : "Entre na sua conta"}
          </p>
        </div>

        <Card className="border-food-borderLight shadow-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-food-textlight">
              {isSignUp ? "Criar Conta" : "Entrar"}
            </CardTitle>
            {isSignUp && (
              <p className="text-sm text-food-secondaryLight">
                Teste grátis por 30 dias • Sem cartão de crédito
              </p>
            )}
          </CardHeader>
          <CardContent>
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-food-secondaryLight hover:text-food-textlight"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-food-secondaryLight mt-1">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>
              
              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-food-textlight font-medium">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      className="border-food-borderLight focus:border-food-coral pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-food-secondaryLight hover:text-food-textlight"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-food-coral hover:bg-food-amber transition-colors text-white font-medium py-3" 
                disabled={loading}
              >
                {loading ? "Carregando..." : isSignUp ? "Criar Conta Gratuita" : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setFullName("");
                  setStoreName("");
                  setPhone("");
                }}
                className="text-food-coral hover:text-food-amber text-sm font-medium"
              >
                {isSignUp ? "Já tem uma conta? Entrar" : "Não tem uma conta? Criar conta gratuita"}
              </Button>
            </div>
            
            {isSignUp && (
              <div className="mt-4 pt-4 border-t border-food-borderLight">
                <p className="text-xs text-food-secondaryLight text-center leading-relaxed">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="text-food-coral hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-food-coral hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isSignUp && (
          <div className="mt-6 text-center">
            <div className="grid grid-cols-3 gap-4 text-xs text-food-secondaryLight">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-food-coral/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-food-coral font-bold">1</span>
                </div>
                <span>Criar conta</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-food-coral/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-food-coral font-bold">2</span>
                </div>
                <span>Confirmar email</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-food-coral/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-food-coral font-bold">3</span>
                </div>
                <span>Começar a usar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
