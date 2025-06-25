
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calculator, 
  Package2, 
  ChefHat, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  BarChart3,
  Banknote,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Zap
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePricingClick = () => {
    if (user) {
      navigate("/pricing");
    } else {
      navigate("/auth");
    }
  };

  const handleFeatureClick = (route: string) => {
    if (user) {
      navigate(route);
    } else {
      navigate("/auth");
    }
  };

  const mainFeatures = [
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Sistema avançado que calcula automaticamente o preço ideal considerando todos os custos, margem de lucro, impostos e taxas de plataforma.",
      benefits: ["Cálculo automático de custos", "Margem de lucro otimizada", "Análise de viabilidade"],
      gradient: "from-blue-500 to-purple-600",
      action: handlePricingClick,
      highlight: true
    },
    {
      icon: Package2,
      title: "Controle de Ingredientes e Receitas",
      description: "Gerencie seus ingredientes, receitas e custos de produção de forma inteligente e automatizada.",
      benefits: ["Controle de estoque", "Custo por receita", "Gestão de fornecedores"],
      gradient: "from-green-500 to-emerald-600",
      action: () => handleFeatureClick("/ingredients")
    },
    {
      icon: Banknote,
      title: "Controle Financeiro Completo",
      description: "Monitore suas receitas, despesas e fluxo de caixa com relatórios detalhados e análises precisas.",
      benefits: ["Fluxo de caixa", "Controle de gastos", "Relatórios financeiros"],
      gradient: "from-orange-500 to-red-600",
      action: () => handleFeatureClick("/accounts-payable")
    },
    {
      icon: ShoppingCart,
      title: "Gestão de Vendas e Revenda",
      description: "Registre vendas, gerencie revendedores e acompanhe performance com dados em tempo real.",
      benefits: ["Controle de vendas", "Gestão de revendedores", "Análise de performance"],
      gradient: "from-purple-500 to-pink-600",
      action: () => handleFeatureClick("/sales")
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Precificação Precisa",
      description: "Calcule o preço ideal considerando todos os custos e margem desejada"
    },
    {
      icon: BarChart3,
      title: "Análises Detalhadas",
      description: "Relatórios completos para tomada de decisões estratégicas"
    },
    {
      icon: DollarSign,
      title: "Controle Total de Custos",
      description: "Gerencie custos, receitas e lucros de forma inteligente"
    },
    {
      icon: Zap,
      title: "Otimizado para Mobile",
      description: "Acesse e gerencie seu negócio de qualquer lugar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Sistema Completo de Gestão
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Precificação Inteligente
            </span>
            <br />
            para seu Negócio
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            O sistema mais completo do mercado para <strong>precificação inteligente</strong>, controle de ingredientes e receitas, 
            <strong> gestão financeira</strong> e <strong>controle de vendas e revenda</strong>. Tudo otimizado para mobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              onClick={handlePricingClick}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Começar Precificação Inteligente
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-200 hover:bg-blue-50 px-8 py-4 text-lg"
              onClick={() => handleFeatureClick("/ingredients")}
            >
              Ver Todas as Funcionalidades
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>100% Mobile</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Fácil de Usar</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Suporte Completo</span>
            </div>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa para gerenciar seu negócio
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {mainFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden ${
                  feature.highlight ? 'lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-white'
                }`}
                onClick={feature.action}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shrink-0`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                        {feature.highlight && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-gray-600 text-base leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Por que nosso sistema é a melhor escolha?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg sm:text-xl text-gray-700 italic mb-4">
              "Finalmente encontrei um sistema que realmente me ajuda a precificar meus produtos corretamente. 
              Aumentei minha margem de lucro em 40% no primeiro mês!"
            </blockquote>
            <cite className="text-gray-600 font-medium">
              - Maria Silva, Confeiteira
            </cite>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Pronto para revolucionar seu negócio?
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de empreendedores que já transformaram seus negócios com nossa 
              <strong> precificação inteligente</strong> e sistema completo de gestão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4 text-lg"
                onClick={handlePricingClick}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Começar Agora - É Grátis
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
                onClick={() => handleFeatureClick("/help")}
              >
                Saber Mais
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Sem compromisso • Fácil de usar • Suporte completo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
