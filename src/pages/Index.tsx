
import React from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Utensils, 
  ShoppingCart, 
  Users, 
  LayoutDashboard, 
  ChevronRight, 
  CheckCircle, 
  Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-food-coral to-food-mint py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins">
                Simplifique a Gestão do seu Negócio de Alimentos
              </h1>
              <p className="text-xl text-white/90 mb-8 font-quicksand">
                Economize tempo, reduza custos e aumente seus lucros com a plataforma mais completa para precificação e gestão de produtos alimentícios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-food-coral hover:bg-white/90 font-bold"
                  asChild
                >
                  <Link to="/dashboard">Comece Agora</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Agende uma Demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556910633-5099dc3021e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                  alt="Dashboard Preview"
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-food-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-food-textlight mb-4 font-poppins">
              Todas as Ferramentas para seu Sucesso
            </h2>
            <p className="text-xl text-food-secondaryLight max-w-3xl mx-auto font-quicksand">
              Nossa plataforma foi desenvolvida para atender todas as necessidades do seu negócio de alimentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-food-coral/10 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-food-coral" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Precificação Inteligente</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Calcule o preço ideal para seus produtos considerando todos os custos, margens e o mercado.
              </p>
              <Link to="/pricing" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-food-mint/10 rounded-full flex items-center justify-center mb-6">
                <Utensils className="w-7 h-7 text-food-mint" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Gestão de Receitas</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Gerencie suas receitas, ingredientes e custos de produção em um só lugar.
              </p>
              <Link to="/recipes" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-food-amber/10 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-7 h-7 text-food-amber" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Loja Online</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Crie sua loja virtual em minutos e receba pedidos diretamente dos clientes.
              </p>
              <Link to="/website" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Gestão de Clientes</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Mantenha um registro completo dos seus clientes e histórico de pedidos.
              </p>
              <Link to="/customers" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <LayoutDashboard className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Dashboard Completo</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Visualize todos os dados importantes do seu negócio em um painel intuitivo.
              </p>
              <Link to="/dashboard" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">Controle de Produção</h3>
              <p className="text-food-secondaryLight mb-4 font-quicksand">
                Organize sua produção, evite desperdícios e otimize seus processos.
              </p>
              <Link to="/production-schedule" className="text-food-coral font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Saiba mais <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-poppins">
            O que nossos clientes dizem
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-food-light rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-1 mb-4 text-food-amber">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-food-textlight mb-6 font-quicksand">
                "Com o FoodPrice, consegui aumentar minha margem de lucro em 25% mantendo preços competitivos. A plataforma é intuitiva e me ajuda a tomar decisões importantes."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-medium">Ana Oliveira</h4>
                  <p className="text-sm text-food-secondaryLight">Confeitaria Doce Lar</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-food-light rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-1 mb-4 text-food-amber">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-food-textlight mb-6 font-quicksand">
                "O sistema de loja online me ajudou a expandir meu negócio. Agora recebo pedidos 24 horas por dia diretamente no sistema, sem intermediários."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-medium">Carlos Santos</h4>
                  <p className="text-sm text-food-secondaryLight">Padaria Grão de Ouro</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-food-light rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-1 mb-4 text-food-amber">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-food-textlight mb-6 font-quicksand">
                "A gestão de receitas e ingredientes é perfeita. Tenho total controle dos meus custos e consegui identificar receitas que estavam dando prejuízo."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-medium">Fernanda Lima</h4>
                  <p className="text-sm text-food-secondaryLight">Restaurante Sabor Natural</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-food-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-food-textlight mb-4 font-poppins">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-food-secondaryLight max-w-3xl mx-auto font-quicksand">
              Escolha o plano ideal para o seu negócio e comece a economizar tempo e dinheiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-card">
              <div className="text-center pb-6 border-b">
                <h3 className="text-xl font-semibold mb-3 font-poppins">Iniciante</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">R$49</span>
                  <span className="text-food-secondaryLight ml-1">/mês</span>
                </div>
                <p className="text-sm text-food-secondaryLight">Para pequenos negócios</p>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Até 50 produtos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Gestão de receitas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Calculadora de preços</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Loja online básica</span>
                </li>
              </ul>
              <Button 
                className="w-full mt-8"
                asChild
              >
                <Link to="/dashboard">Começar Grátis</Link>
              </Button>
              <p className="text-xs text-center mt-4 text-food-secondaryLight">14 dias de teste grátis, sem cartão de crédito</p>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-food-coral relative transition-all duration-300 hover:shadow-card transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-food-coral text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais Popular
              </div>
              <div className="text-center pb-6 border-b">
                <h3 className="text-xl font-semibold mb-3 font-poppins">Profissional</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">R$99</span>
                  <span className="text-food-secondaryLight ml-1">/mês</span>
                </div>
                <p className="text-sm text-food-secondaryLight">Para negócios em crescimento</p>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Produtos ilimitados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Controle de custos avançado</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Gestão de clientes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Loja online personalizada</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Relatórios avançados</span>
                </li>
              </ul>
              <Button 
                className="w-full mt-8 bg-food-coral hover:bg-food-coral/90"
                asChild
              >
                <Link to="/dashboard">Assinar Agora</Link>
              </Button>
              <p className="text-xs text-center mt-4 text-food-secondaryLight">14 dias de teste grátis, sem cartão de crédito</p>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-card">
              <div className="text-center pb-6 border-b">
                <h3 className="text-xl font-semibold mb-3 font-poppins">Empresarial</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">R$199</span>
                  <span className="text-food-secondaryLight ml-1">/mês</span>
                </div>
                <p className="text-sm text-food-secondaryLight">Para grandes operações</p>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Tudo do plano Profissional</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Múltiplos usuários</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">API para integração</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Suporte prioritário</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-food-mint mr-2 shrink-0 mt-0.5" />
                  <span className="font-quicksand">Consultoria personalizada</span>
                </li>
              </ul>
              <Button 
                className="w-full mt-8"
                variant="outline"
                asChild
              >
                <Link to="/dashboard">Fale com Consultor</Link>
              </Button>
              <p className="text-xs text-center mt-4 text-food-secondaryLight">Inclui implementação personalizada</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-food-mint to-food-coral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto font-quicksand">
            Junte-se a milhares de empreendedores que estão economizando tempo e dinheiro com nossa plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-food-coral hover:bg-white/90 font-bold"
              asChild
            >
              <Link to="/dashboard">Começar Agora</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-food-textlight text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-poppins">FoodPrice</h3>
              <p className="text-gray-300 font-quicksand">
                A plataforma completa para gestão e precificação de produtos alimentícios.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-poppins">Produto</h4>
              <ul className="space-y-2 font-quicksand">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-poppins">Empresa</h4>
              <ul className="space-y-2 font-quicksand">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 font-poppins">Contato</h4>
              <ul className="space-y-2 font-quicksand">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Suporte</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Vendas</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Parcerias</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm font-quicksand mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} FoodPrice. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
