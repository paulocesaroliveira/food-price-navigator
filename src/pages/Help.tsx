
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Users,
  Zap,
  Search,
  ShoppingCart,
  Package,
  Calculator,
  BarChart3,
  Settings,
  ChefHat,
  DollarSign,
  Truck,
  CreditCard,
  UserCheck,
  PlayCircle
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const helpSections = [
    {
      title: "Primeiros Passos",
      icon: Zap,
      color: "bg-blue-50 border-blue-200",
      description: "Configure sua conta e comece a usar o TastyHub",
      topics: [
        { title: "Configurando seu perfil", description: "Como preencher informações da sua loja" },
        { title: "Cadastrando ingredientes", description: "Adicione ingredientes com preços e fornecedores" },
        { title: "Criando receitas", description: "Monte receitas com ingredientes base e por porção" },
        { title: "Configurando produtos", description: "Crie produtos usando suas receitas" }
      ]
    },
    {
      title: "Gestão de Produtos",
      icon: Package,
      color: "bg-green-50 border-green-200",
      description: "Controle completo dos seus produtos e receitas",
      topics: [
        { title: "Calculadora de custos", description: "Como o sistema calcula custos automaticamente" },
        { title: "Gerenciamento de ingredientes", description: "Organizar por categorias e fornecedores" },
        { title: "Configuração de embalagens", description: "Adicionar custos de embalagem aos produtos" },
        { title: "Precificação inteligente", description: "Sistema automático de precificação com margens" }
      ]
    },
    {
      title: "Vendas e Pedidos",
      icon: ShoppingCart,
      color: "bg-purple-50 border-purple-200",
      description: "Gerencie vendas e pedidos de forma eficiente",
      topics: [
        { title: "Criando pedidos", description: "Como registrar pedidos de clientes" },
        { title: "Gerenciamento de clientes", description: "Cadastro e organização de informações" },
        { title: "Controle de entregas", description: "Acompanhar status e agendamentos" },
        { title: "Registro de vendas", description: "Controlar vendas diretas e lucros" }
      ]
    },
    {
      title: "Financeiro",
      icon: DollarSign,
      color: "bg-orange-50 border-orange-200",
      description: "Controle financeiro completo do seu negócio",
      topics: [
        { title: "Contas a pagar", description: "Gerenciar despesas e fornecedores" },
        { title: "Fluxo de caixa", description: "Acompanhar entradas e saídas" },
        { title: "Relatórios financeiros", description: "Análises detalhadas de performance" },
        { title: "Controle de margem", description: "Monitorar lucratividade por produto" }
      ]
    }
  ];

  const videoTutorials = [
    {
      title: "Introdução ao TastyHub",
      duration: "5:30",
      description: "Visão geral da plataforma e principais funcionalidades",
      thumbnail: "intro",
      level: "Iniciante"
    },
    {
      title: "Cadastrando Ingredientes e Receitas",
      duration: "8:15",
      description: "Como cadastrar ingredientes e criar receitas do zero",
      thumbnail: "ingredients",
      level: "Iniciante"
    },
    {
      title: "Sistema de Precificação",
      duration: "6:45",
      description: "Entenda como funciona o cálculo automático de preços",
      thumbnail: "pricing",
      level: "Intermediário"
    },
    {
      title: "Gerenciamento de Pedidos",
      duration: "7:20",
      description: "Fluxo completo desde o pedido até a entrega",
      thumbnail: "orders",
      level: "Intermediário"
    },
    {
      title: "Relatórios e Análises",
      duration: "9:10",
      description: "Como usar os relatórios para tomar decisões estratégicas",
      thumbnail: "reports",
      level: "Avançado"
    }
  ];

  const faqItems = [
    {
      question: "Como atualizar os custos dos ingredientes?",
      answer: "Vá para a página 'Atualizar Custos' no menu lateral. Lá você pode atualizar os preços dos ingredientes individualmente ou em massa. O sistema automaticamente recalculará os custos das receitas e produtos que usam esses ingredientes.",
      category: "custos"
    },
    {
      question: "Como criar uma nova receita?",
      answer: "Acesse 'Receitas' no menu, clique em 'Nova Receita' e preencha as informações. Você pode adicionar ingredientes base (custos únicos para toda a receita) e ingredientes por porção (multiplicados pelo número de porções).",
      category: "receitas"
    },
    {
      question: "Como funciona o cálculo de precificação?",
      answer: "O sistema calcula automaticamente com base nos custos dos ingredientes, embalagens, desperdício configurado e aplica as margens de lucro. A fórmula considera: (Custo Total + Embalagem) × (1 + % Desperdício) × (1 + % Margem).",
      category: "precificacao"
    },
    {
      question: "Posso exportar relatórios?",
      answer: "Sim! Na página de Relatórios você encontra diversas opções de relatórios que podem ser visualizados na tela e exportados em diferentes formatos (PDF, Excel).",
      category: "relatorios"
    },
    {
      question: "Como cadastrar clientes com múltiplos endereços?",
      answer: "No formulário de cliente, você pode adicionar quantos endereços desejar. Cada endereço pode ter um rótulo (ex: Casa, Trabalho) e você pode marcar um como principal.",
      category: "clientes"
    },
    {
      question: "Como funciona o controle de estoque?",
      answer: "O sistema não controla estoque físico automaticamente, mas você pode acompanhar o consumo através dos relatórios de produção e vendas para ter uma noção de quando reabastecer ingredientes.",
      category: "estoque"
    },
    {
      question: "Posso usar o sistema em dispositivos móveis?",
      answer: "Sim! O TastyHub é totalmente responsivo e funciona perfeitamente em smartphones e tablets. Você pode acessar todas as funcionalidades através do navegador do seu dispositivo.",
      category: "mobile"
    },
    {
      question: "Como configurar as margens de lucro?",
      answer: "Na página de Precificação, você pode configurar margens diferentes para cada produto, além de custos adicionais como entrega, impostos e taxas de plataforma.",
      category: "precificacao"
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Ajuda e Suporte"
        subtitle="Aprenda a usar o TastyHub e maximize seus resultados"
        icon={HelpCircle}
        gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        badges={[
          { icon: BookOpen, text: "Guias completos" },
          { icon: Video, text: "Vídeo tutoriais" },
          { icon: MessageCircle, text: "Suporte 24/7" }
        ]}
        actions={
          <Button 
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-white shadow-lg"
            onClick={() => window.open('mailto:suporte@tastyhub.com')}
          >
            <Mail className="mr-2 h-4 w-4" />
            Contatar Suporte
          </Button>
        }
      />

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Guias</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpSections.map((section, index) => (
              <Card key={index} className={`${section.color} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <section.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.topics.map((topic, topicIndex) => (
                      <AccordionItem key={topicIndex} value={`item-${index}-${topicIndex}`}>
                        <AccordionTrigger className="text-sm font-medium">
                          {topic.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {topic.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-blue-600" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2"
                    >
                      {video.level}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                    <Button size="sm" className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Assistir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar nas perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && searchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Nenhuma pergunta encontrada para "{searchTerm}"</p>
                  <Button className="mt-4" onClick={() => setSearchTerm("")}>
                    Ver todas as perguntas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Resposta em até 24 horas
                </p>
                <p className="text-sm font-medium mb-4">suporte@tastyhub.com</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Chat Online</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Segunda a Sexta: 9h às 18h
                </p>
                <Badge className="mb-4" variant="secondary">
                  Suporte ao vivo
                </Badge>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <Phone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Telefone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ligação gratuita para todo Brasil
                </p>
                <p className="text-sm font-medium mb-4">(11) 9999-9999</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar Agora
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Base de Conhecimento</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Acesse nossa base de conhecimento completa com artigos detalhados, 
                    tutoriais passo a passo e dicas avançadas para otimizar seu uso do TastyHub.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Tutoriais</Badge>
                    <Badge variant="secondary">Guias</Badge>
                    <Badge variant="secondary">Melhores Práticas</Badge>
                    <Badge variant="secondary">Dicas & Truques</Badge>
                  </div>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
