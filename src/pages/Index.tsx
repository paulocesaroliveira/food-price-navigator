
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  ArrowRight
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Sistema avançado que calcula automaticamente o preço ideal considerando custos, margem de lucro, impostos e taxas de plataforma.",
      gradient: "from-blue-500 to-purple-600",
      action: () => navigate("/pricing"),
      highlight: true
    },
    {
      icon: Package2,
      title: "Controle de Ingredientes",
      description: "Gerencie seus ingredientes, receitas e custos de produção de forma inteligente e automatizada.",
      gradient: "from-green-500 to-emerald-600",
      action: () => navigate("/ingredients")
    },
    {
      icon: Banknote,
      title: "Controle Financeiro",
      description: "Monitore suas receitas, despesas e fluxo de caixa com relatórios detalhados e análises precisas.",
      gradient: "from-orange-500 to-red-600",
      action: () => navigate("/sales")
    },
    {
      icon: ShoppingCart,
      title: "Controle de Vendas",
      description: "Registre vendas, acompanhe performance e gerencie seu negócio com dados em tempo real.",
      gradient: "from-purple-500 to-pink-600",
      action: () => navigate("/sales")
    }
  ];

  const quickActions = [
    {
      icon: ChefHat,
      title: "Receitas",
      description: "Crie e gerencie suas receitas",
      action: () => navigate("/recipes")
    },
    {
      icon: Package2,
      title: "Produtos",
      description: "Organize seus produtos finais",
      action: () => navigate("/products")
    },
    {
      icon: TrendingUp,
      title: "Relatórios",
      description: "Análises e insights do negócio",
      action: () => navigate("/sales")
    },
    {
      icon: Users,
      title: "Revendedores",
      description: "Gerencie sua rede de revenda",
      action: () => navigate("/resellers")
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transforme seu Negócio com
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline sm:ml-3">
              Inteligência
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Precificação inteligente, controle de ingredientes e receitas, gestão financeira completa e controle de vendas e revenda. Tudo em uma plataforma otimizada para mobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              onClick={() => navigate("/pricing")}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Começar Precificação
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-200 hover:bg-blue-50 px-8 py-3"
              onClick={() => navigate("/ingredients")}
            >
              Ver Funcionalidades
            </Button>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden ${
                feature.highlight ? 'lg:col-span-2' : ''
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
                    <CardTitle className="text-xl sm:text-2xl mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                      {feature.highlight && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Destaque
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-center border border-gray-100"
                onClick={action.action}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors mb-3">
                      <action.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Por que escolher nosso sistema?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
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
                title: "Controle Total",
                description: "Gerencie custos, receitas e lucros de forma inteligente"
              }
            ].map((benefit, index) => (
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

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Pronto para otimizar seu negócio?
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Comece agora mesmo a usar nossa plataforma completa de gestão e precificação inteligente.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-3"
              onClick={() => navigate("/pricing")}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Iniciar Precificação Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
