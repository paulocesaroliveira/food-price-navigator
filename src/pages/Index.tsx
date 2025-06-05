
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { 
  Building2, 
  ArrowRight, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Beaker,
  ChefHat,
  Calculator,
  ShoppingCart,
  DollarSign,
  Users,
  CreditCard,
  Repeat,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Star,
  Shield,
  Clock,
  Zap
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    {
      icon: Beaker,
      title: "Gestão de Ingredientes",
      description: "Controle completo do estoque, custos e fornecedores de todos os ingredientes",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: ChefHat,
      title: "Receitas Inteligentes",
      description: "Crie receitas com cálculo automático de custos e análise nutricional",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Package,
      title: "Produtos & Embalagens",
      description: "Gerencie produtos finais com precificação automática baseada em receitas",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Sistema avançado de precificação com margem de lucro e análise de mercado",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: ShoppingCart,
      title: "Gestão de Pedidos",
      description: "Controle total de pedidos, prazos de entrega e status de produção",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: DollarSign,
      title: "Vendas & Faturamento",
      description: "Registre vendas, acompanhe faturamento e analise performance",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: Repeat,
      title: "Rede de Revenda",
      description: "Gerencie revendedores, comissões e vendas da sua rede",
      color: "bg-cyan-100 text-cyan-600"
    },
    {
      icon: Users,
      title: "CRM de Clientes",
      description: "Base completa de clientes com histórico de compras e preferências",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboard com insights, gráficos e relatórios detalhados de performance",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: CreditCard,
      title: "Contas a Pagar",
      description: "Controle financeiro completo com gestão de fornecedores e pagamentos",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: RefreshCw,
      title: "Atualização de Custos",
      description: "Sistema automatizado para atualizar custos em toda a cadeia produtiva",
      color: "bg-slate-100 text-slate-600"
    },
    {
      icon: TrendingUp,
      title: "Fluxo de Caixa",
      description: "Projeções financeiras e controle completo do fluxo de caixa",
      color: "bg-violet-100 text-violet-600"
    }
  ];

  const benefits = [
    "Redução de até 70% no tempo de precificação",
    "Controle total de custos e margem de lucro",
    "Automação de processos administrativos",
    "Relatórios gerenciais em tempo real",
    "Gestão integrada de toda a operação",
    "Suporte técnico especializado"
  ];

  return (
    <>
      <SEOHead />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="container-responsive py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">TastyHub</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 h-10 lg:h-12"
            >
              Entrar
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container-responsive py-12 lg:py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 lg:mb-6 bg-blue-100 text-blue-600 hover:bg-blue-100">
              <Sparkles className="h-4 w-4 mr-2" />
              Teste Grátis por 30 Dias
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
              Sistema Completo para
              <span className="text-blue-600 block">Confeitarias & Docerias</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-3xl mx-auto">
              Transforme sua confeitaria com o sistema mais completo do mercado. 
              Gerencie ingredientes, receitas, produtos, vendas e muito mais em uma única plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 lg:mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg"
                onClick={() => navigate("/auth")}
              >
                Começar Teste Gratuito
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 text-center">
              {[
                { value: "500+", label: "Confeitarias Ativas", icon: Building2 },
                { value: "99.9%", label: "Uptime Garantido", icon: Shield },
                { value: "24/7", label: "Suporte Técnico", icon: Clock },
                { value: "30", label: "Dias Grátis", icon: Star }
              ].map((stat, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-lg border border-white/20">
                  <stat.icon className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container-responsive py-12 lg:py-16">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua confeitaria de forma profissional
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
                <CardHeader className="pb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-3 lg:mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                  <CardTitle className="text-base lg:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm lg:text-base text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-12 lg:py-16">
          <div className="container-responsive">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Por que escolher o TastyHub?
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm lg:text-base text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 lg:h-8 lg:w-8" />
                  <h3 className="text-xl lg:text-2xl font-bold">Teste Gratuito por 30 Dias</h3>
                </div>
                <p className="mb-4 lg:mb-6 opacity-90 text-sm lg:text-base">
                  Experimente todas as funcionalidades sem compromisso. 
                  Não cobramos cartão de crédito durante o período de teste.
                </p>
                <ul className="space-y-2 mb-4 lg:mb-6 text-sm lg:text-base">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Acesso completo a todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Suporte técnico incluído</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Sem limitação de usuários</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 h-12 lg:h-14"
                  onClick={() => navigate("/auth")}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-responsive py-12 lg:py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
              Pronto para revolucionar sua confeitaria?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
              Junte-se a centenas de confeiteiros que já transformaram seus negócios com o TastyHub
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg"
              onClick={() => navigate("/auth")}
            >
              Iniciar Teste Gratuito
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 lg:py-12">
          <div className="container-responsive">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded flex items-center justify-center">
                    <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <span className="text-lg lg:text-xl font-bold">TastyHub</span>
                </div>
                <p className="text-sm lg:text-base text-gray-400">
                  Sistema completo de gestão para confeitarias e docerias.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm lg:text-base">Produto</h3>
                <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
                  <li>Funcionalidades</li>
                  <li>Preços</li>
                  <li>Demonstração</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm lg:text-base">Suporte</h3>
                <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
                  <li>Central de Ajuda</li>
                  <li>Contato</li>
                  <li>Status do Sistema</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm lg:text-base">Empresa</h3>
                <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
                  <li>Sobre</li>
                  <li>Blog</li>
                  <li>Carreiras</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8 text-center text-xs lg:text-sm text-gray-400">
              <p>&copy; 2024 TastyHub. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
