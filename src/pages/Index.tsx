
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  Star, 
  Check, 
  ArrowRight,
  Calculator,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    {
      icon: ChefHat,
      title: "Gestão de Receitas",
      description: "Cadastre e gerencie todas as suas receitas com cálculo automático de custos"
    },
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Calcule preços de venda com margem de lucro automática e análise de competitividade"
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Monitore ingredientes e produtos com alertas de estoque baixo"
    },
    {
      icon: ShoppingCart,
      title: "Gestão de Pedidos",
      description: "Organize pedidos, entregas e acompanhe o status em tempo real"
    },
    {
      icon: BarChart3,
      title: "Relatórios e Analytics",
      description: "Dashboards completos com métricas de vendas, lucro e performance"
    },
    {
      icon: Users,
      title: "CRM de Clientes",
      description: "Gerencie clientes, endereços e histórico de compras"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      business: "Doces da Maria",
      text: "Aumentei meu lucro em 40% depois que comecei a usar o TastyHub para calcular meus preços corretamente.",
      rating: 5
    },
    {
      name: "João Santos",
      business: "Confeitaria Premium",
      text: "O sistema me ajudou a organizar toda a produção. Agora sei exatamente quanto custa cada produto.",
      rating: 5
    },
    {
      name: "Ana Costa",
      business: "Bolos & Cia",
      text: "Interface muito intuitiva e funcionalidades que realmente fazem diferença no dia a dia.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">TastyHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Teste Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            🎉 Teste grátis por 30 dias
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão Completa para
            <span className="text-primary block">Confeitarias</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme sua confeitaria com o sistema completo de gestão. 
            Controle receitas, calcule preços, gerencie estoque e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Ver Demonstração
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600">Confeiteiros ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">Satisfação dos clientes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">30%</div>
              <div className="text-gray-600">Aumento médio no lucro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Funcionalidades desenvolvidas especificamente para confeitarias e padarias
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o TastyHub?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Fácil de usar</h3>
                    <p className="text-gray-600">Interface intuitiva desenvolvida pensando em quem não tem tempo a perder</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Suporte especializado</h3>
                    <p className="text-gray-600">Nossa equipe entende do seu negócio e está sempre pronta para ajudar</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dados seguros</h3>
                    <p className="text-gray-600">Seus dados ficam protegidos com a mais alta segurança</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center border-0 shadow-lg">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Economia de Tempo</h3>
                <p className="text-sm text-gray-600">Até 5h por semana economizadas</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Aumento de Lucro</h3>
                <p className="text-sm text-gray-600">Média de 30% de aumento</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">100% Seguro</h3>
                <p className="text-sm text-gray-600">Dados criptografados</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Acesso Online</h3>
                <p className="text-sm text-gray-600">De qualquer lugar</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Confeiteiros que transformaram seus negócios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para transformar sua confeitaria?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece seu teste gratuito de 30 dias agora mesmo
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              Iniciar Teste Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-sm opacity-75">
            Sem compromisso • Cancele quando quiser • Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">TastyHub</span>
              </div>
              <p className="text-gray-400">
                A solução completa para gestão de confeitarias e padarias.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Funcionalidades</li>
                <li>Preços</li>
                <li>Demonstração</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Contato</li>
                <li>WhatsApp</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre nós</li>
                <li>Blog</li>
                <li>Termos de uso</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TastyHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
