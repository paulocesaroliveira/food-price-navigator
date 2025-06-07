
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
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles
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
      description: "Crie e organize receitas com cálculo automático de custos",
      color: "text-orange-500"
    },
    {
      icon: Package,
      title: "Controle de Ingredientes",
      description: "Gerencie estoque e custos de ingredientes em tempo real",
      color: "text-blue-500"
    },
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Calcule preços de venda com margens de lucro otimizadas",
      color: "text-green-500"
    },
    {
      icon: ShoppingCart,
      title: "Gestão de Pedidos",
      description: "Controle pedidos e entregas de forma eficiente",
      color: "text-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Relatórios de Vendas",
      description: "Analise performance com relatórios detalhados",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha relacionamento próximo com seus clientes",
      color: "text-cyan-500"
    },
    {
      icon: FileText,
      title: "Controle Financeiro",
      description: "Acompanhe fluxo de caixa e contas a pagar",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com tecnologia de ponta",
      color: "text-indigo-500"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      business: "Doces da Maria",
      comment: "Aumentei minha margem de lucro em 40% após começar a usar o FoodPrice!",
      rating: 5
    },
    {
      name: "João Santos",
      business: "Padaria do João",
      comment: "Finalmente consegui ter controle total dos meus custos e preços.",
      rating: 5
    },
    {
      name: "Ana Costa",
      business: "Bolos da Ana",
      comment: "Sistema intuitivo que transformou minha gestão financeira.",
      rating: 5
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
              <span className="text-2xl font-bold text-food-textlight">FoodPrice</span>
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
            Teste Grátis por 30 Dias
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-food-textlight mb-6 leading-tight">
            Transforme sua
            <span className="text-food-coral"> Precificação</span>
            <br />
            de Alimentos
          </h1>
          
          <p className="text-xl text-food-secondaryLight mb-12 max-w-3xl mx-auto leading-relaxed">
            O sistema completo para calcular custos, definir preços e maximizar lucros 
            no seu negócio de alimentação. Simples, rápido e eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="bg-food-coral hover:bg-food-amber text-white px-8 py-4 text-lg shadow-button hover:shadow-hover transition-all"
            >
              Iniciar Teste Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-food-coral text-food-coral hover:bg-food-coral hover:text-white px-8 py-4 text-lg transition-all"
            >
              Ver Demonstração
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">30 Dias</div>
              <div className="text-food-secondaryLight">Teste Grátis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">5 Min</div>
              <div className="text-food-secondaryLight">Para Configurar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-food-coral mb-2">24/7</div>
              <div className="text-food-secondaryLight">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-food-textlight mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-food-secondaryLight max-w-3xl mx-auto">
              Ferramentas completas para gestão, precificação e crescimento do seu negócio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border-food-borderLight">
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 mx-auto group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-food-textlight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-food-secondaryLight text-center text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-food-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-food-textlight mb-6">
                Por que escolher o FoodPrice?
              </h2>
              <div className="space-y-6">
                {[
                  "Aumento médio de 35% na margem de lucro",
                  "Redução de 80% no tempo de precificação",
                  "Controle total de custos e estoque",
                  "Relatórios detalhados para tomada de decisão",
                  "Interface intuitiva e fácil de usar",
                  "Suporte especializado sempre disponível"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-food-mint flex-shrink-0" />
                    <span className="text-food-textlight font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Custo do Produto</span>
                    <span className="text-food-coral font-bold">R$ 12,50</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-light rounded-xl">
                    <span className="font-medium text-food-textlight">Margem Desejada</span>
                    <span className="text-food-coral font-bold">60%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-food-coral rounded-xl text-white">
                    <span className="font-bold">Preço de Venda</span>
                    <span className="font-bold text-xl">R$ 31,25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-food-textlight mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-food-secondaryLight">
              Histórias reais de sucesso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-food-borderLight hover:shadow-hover transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-food-secondaryLight mb-6 italic">
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <div className="font-semibold text-food-textlight">{testimonial.name}</div>
                    <div className="text-sm text-food-secondaryLight">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-food-coral to-food-amber">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Comece seu teste gratuito hoje e veja a diferença em 30 dias
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
            ✓ Sem cartão de crédito ✓ Cancelamento gratuito ✓ Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-food-textlight text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <ChefHat className="h-8 w-8 text-food-coral" />
            <span className="text-2xl font-bold">FoodPrice</span>
          </div>
          <p className="text-gray-400 mb-4">
            O sistema mais completo para precificação de alimentos
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 FoodPrice. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
