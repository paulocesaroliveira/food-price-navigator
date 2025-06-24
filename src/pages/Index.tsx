
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  Calculator, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  FileText, 
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Heart,
  Star
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

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

  const features = [
    {
      icon: ChefHat,
      title: "Gestão de Receitas",
      description: "Organize suas receitas com cálculo automático de custos por ingrediente",
      color: "text-orange-500",
      benefits: ["Controle de ingredientes", "Cálculo automático de custos", "Gestão de porções"]
    },
    {
      icon: Package,
      title: "Controle de Produtos",
      description: "Gerencie produtos complexos com múltiplas receitas e embalagens",
      color: "text-blue-500",
      benefits: ["Produtos compostos", "Gestão de embalagens", "Custo total automático"]
    },
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Sistema avançado de precificação com margens personalizáveis",
      color: "text-green-500",
      benefits: ["Margens flexíveis", "Custos indiretos", "Análise de lucro"]
    },
    {
      icon: TrendingUp,
      title: "Análise de Vendas",
      description: "Relatórios detalhados para tomada de decisões estratégicas",
      color: "text-purple-500",
      benefits: ["Dashboards visuais", "Métricas de performance", "Histórico completo"]
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha relacionamento próximo com base de clientes",
      color: "text-cyan-500",
      benefits: ["Histórico de pedidos", "Preferências", "Comunicação direta"]
    },
    {
      icon: ShoppingCart,
      title: "Controle de Pedidos",
      description: "Gerencie pedidos desde a criação até a entrega",
      color: "text-red-500",
      benefits: ["Status em tempo real", "Agendamentos", "Controle de pagamentos"]
    }
  ];

  const benefits = [
    "Reduz tempo de precificação em até 90%",
    "Aumenta margem de lucro com preços mais precisos",
    "Elimina erros de cálculo manual",
    "Oferece visão completa do negócio",
    "Interface simples e intuitiva",
    "Suporte técnico especializado"
  ];

  const steps = [
    {
      step: "1",
      title: "Cadastre seus Ingredientes",
      description: "Registre ingredientes com preços e fornecedores para base de cálculos precisos"
    },
    {
      step: "2", 
      title: "Crie suas Receitas",
      description: "Monte receitas definindo quantidades e custos automáticos por porção"
    },
    {
      step: "3",
      title: "Configure seus Produtos", 
      description: "Combine receitas e embalagens para formar produtos completos"
    },
    {
      step: "4",
      title: "Defina sua Precificação",
      description: "Use nossa calculadora avançada para definir preços com margem ideal"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-food-light via-white to-food-cardlight">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-food-borderLight sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-food-coral" />
              <span className="text-2xl font-bold text-food-textlight">TastyHub</span>
              <Badge className="bg-orange-100 text-orange-800 text-xs">BETA</Badge>
            </div>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-food-coral hover:bg-food-amber transition-colors"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-food-coral/10 text-food-coral text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            Sistema em desenvolvimento - Fase Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-food-textlight mb-6 leading-tight">
            Precificação
            <span className="text-food-coral"> Inteligente</span>
            <br />
            para Alimentação
          </h1>
          
          <p className="text-xl text-food-secondaryLight mb-12 max-w-3xl mx-auto leading-relaxed">
            A primeira plataforma brasileira especializada em precificação de alimentos. 
            Calcule custos precisos, defina margens ideais e maximize seus lucros.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="bg-food-coral hover:bg-food-amber text-white px-8 py-4 text-lg shadow-button hover:shadow-hover transition-all"
            >
              Testar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-food-coral text-food-coral hover:bg-food-coral hover:text-white px-8 py-4 text-lg transition-all"
            >
              <Heart className="mr-2 h-5 w-5" />
              Ver Como Funciona
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">
                <Zap className="h-8 w-8 mx-auto mb-2" />
                Rápido
              </div>
              <div className="text-food-secondaryLight">Configure em minutos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">
                <Target className="h-8 w-8 mx-auto mb-2" />
                Preciso
              </div>
              <div className="text-food-secondaryLight">Cálculos exatos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                Completo
              </div>
              <div className="text-food-secondaryLight">Gestão total</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-food-textlight mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-food-secondaryLight max-w-3xl mx-auto">
              Em 4 passos simples, você terá controle total sobre custos e preços
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center border-food-borderLight hover:shadow-hover transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-food-coral rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <CardTitle className="text-lg text-food-textlight">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-food-secondaryLight text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-food-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-food-textlight mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-food-secondaryLight max-w-3xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar seu negócio de alimentação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border-food-borderLight bg-white">
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 mx-auto group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-food-textlight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-food-secondaryLight text-center text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-food-secondaryLight">
                        <CheckCircle className="h-4 w-4 text-food-mint mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-food-textlight mb-6">
                Por que escolher o TastyHub?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-food-mint flex-shrink-0" />
                    <span className="text-food-textlight font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/auth'}
                  className="bg-food-coral hover:bg-food-amber text-white px-8 py-4"
                >
                  Começar Agora Mesmo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-card border-2 border-food-borderLight">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-food-textlight mb-2">Exemplo de Precificação</h3>
                    <p className="text-sm text-food-secondaryLight">Bolo de Chocolate Gourmet</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Custo dos Ingredientes</span>
                    <span className="text-food-coral font-bold">R$ 8,50</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Custo de Embalagem</span>
                    <span className="text-food-coral font-bold">R$ 2,00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Custos Indiretos (20%)</span>
                    <span className="text-food-coral font-bold">R$ 2,10</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Margem de Lucro (60%)</span>
                    <span className="text-food-coral font-bold">R$ 7,56</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-coral rounded-xl text-white">
                    <span className="font-bold">Preço de Venda Final</span>
                    <span className="font-bold text-xl">R$ 20,16</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-food-coral to-food-amber">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para revolucionar sua precificação?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Junte-se aos empreendedores que já estão maximizando seus lucros com o TastyHub
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="bg-white text-food-coral hover:bg-gray-100 px-8 py-4 text-lg shadow-button transition-all"
            >
              Começar Teste Gratuito
              <Clock className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-white/80 mt-6 text-sm">
            ✓ Sem cartão de crédito ✓ Configuração em minutos ✓ Suporte especializado
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-food-textlight text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <ChefHat className="h-8 w-8 text-food-coral" />
            <span className="text-2xl font-bold">TastyHub</span>
            <Badge className="bg-orange-100 text-orange-800 text-xs">BETA</Badge>
          </div>
          <p className="text-gray-400 mb-4">
            A plataforma mais completa para precificação de alimentos no Brasil
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 TastyHub. Todos os direitos reservados. | Sistema em desenvolvimento - Versão Beta
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
