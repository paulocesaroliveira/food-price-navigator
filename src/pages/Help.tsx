
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
  Search,
  ShoppingCart,
  Package,
  Calculator,
  BarChart3,
  Settings,
  ChefHat,
  DollarSign,
  Truck,
  UserCheck,
  PlayCircle,
  Lightbulb,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const helpSections = [
    {
      title: "Primeiros Passos",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      description: "Configure sua conta e comece a usar o TastyHub",
      topics: [
        { 
          title: "Configurando seu perfil", 
          description: "Como preencher informações da sua loja e dados pessoais",
          steps: ["Acesse Configurações > Perfil", "Preencha nome da loja", "Adicione telefone e endereço", "Salve as alterações"]
        },
        { 
          title: "Cadastrando ingredientes", 
          description: "Adicione ingredientes com preços e fornecedores para cálculos precisos",
          steps: ["Vá para Ingredientes", "Clique em Novo Ingrediente", "Preencha nome, preço e fornecedor", "Organize por categorias"]
        },
        { 
          title: "Criando receitas", 
          description: "Monte receitas com ingredientes base e por porção",
          steps: ["Acesse Receitas", "Adicione ingredientes base (custos únicos)", "Adicione ingredientes por porção", "Defina número de porções"]
        },
        { 
          title: "Configurando produtos", 
          description: "Crie produtos usando suas receitas e defina preços de venda",
          steps: ["Entre em Produtos", "Selecione receitas criadas", "Adicione embalagens", "Configure preço de venda"]
        }
      ]
    },
    {
      title: "Gestão de Produtos",
      icon: Package,
      color: "from-green-500 to-emerald-500",
      description: "Controle completo dos seus produtos e receitas",
      topics: [
        { 
          title: "Sistema de custos", 
          description: "Como o sistema calcula custos automaticamente",
          steps: ["Custos são calculados em tempo real", "Base na quantidade de ingredientes", "Considera desperdício configurado", "Inclui custos de embalagem"]
        },
        { 
          title: "Categorias e organização", 
          description: "Organize ingredientes e produtos por categorias",
          steps: ["Crie categorias personalizadas", "Filtre por categoria", "Busque rapidamente", "Mantenha organizado"]
        },
        { 
          title: "Gestão de embalagens", 
          description: "Configure diferentes tipos de embalagem",
          steps: ["Cadastre tipos de embalagem", "Defina custos unitários", "Associe aos produtos", "Controle estoque de embalagens"]
        },
        { 
          title: "Precificação inteligente", 
          description: "Sistema automático com margens personalizáveis",
          steps: ["Configure margem desejada", "Adicione custos extras", "Considere impostos", "Visualize lucro por item"]
        }
      ]
    },
    {
      title: "Vendas e Pedidos",
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      description: "Gerencie vendas e pedidos de forma eficiente",
      topics: [
        { 
          title: "Criando pedidos", 
          description: "Como registrar e acompanhar pedidos de clientes",
          steps: ["Selecione o cliente", "Escolha produtos e quantidades", "Defina tipo de entrega", "Agende data e horário"]
        },
        { 
          title: "Gestão de clientes", 
          description: "Cadastro completo com múltiplos endereços",
          steps: ["Cadastre dados básicos", "Adicione múltiplos endereços", "Marque endereço principal", "Mantenha histórico atualizado"]
        },
        { 
          title: "Controle de entregas", 
          description: "Acompanhe status e organize entregas",
          steps: ["Visualize pedidos por status", "Atualize progresso", "Controle rotas de entrega", "Confirme recebimento"]
        },
        { 
          title: "Registro de vendas", 
          description: "Controle vendas diretas e calcule lucros",
          steps: ["Registre vendas instantâneas", "Calcule lucro automático", "Adicione gastos extras", "Gere relatórios"]
        }
      ]
    },
    {
      title: "Relatórios e Análises",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
      description: "Análise completa do seu negócio",
      topics: [
        { 
          title: "Relatórios financeiros", 
          description: "Acompanhe receitas, custos e lucros",
          steps: ["Acesse aba Financeiro", "Filtre por período", "Analise gráficos", "Exporte dados"]
        },
        { 
          title: "Performance de produtos", 
          description: "Veja quais produtos vendem mais",
          steps: ["Vá para aba Produtos", "Ordene por vendas", "Identifique top produtos", "Analise margem de lucro"]
        },
        { 
          title: "Análise de clientes", 
          description: "Entenda comportamento dos clientes",
          steps: ["Acesse aba Clientes", "Veja frequência de compra", "Identifique melhores clientes", "Analise ticket médio"]
        },
        { 
          title: "Controle operacional", 
          description: "Monitore operações e eficiência",
          steps: ["Veja tempos de produção", "Controle desperdícios", "Monitore entregas", "Otimize processos"]
        }
      ]
    }
  ];

  const videoTutorials = [
    {
      title: "Introdução ao TastyHub",
      duration: "5:30",
      description: "Visão geral da plataforma e principais funcionalidades",
      level: "Iniciante",
      views: "1.2k"
    },
    {
      title: "Cadastrando Ingredientes e Receitas",
      duration: "8:15", 
      description: "Como cadastrar ingredientes e criar receitas do zero",
      level: "Iniciante",
      views: "890"
    },
    {
      title: "Sistema de Precificação Inteligente",
      duration: "6:45",
      description: "Entenda como funciona o cálculo automático de preços",
      level: "Intermediário",
      views: "654"
    },
    {
      title: "Gestão Completa de Pedidos",
      duration: "7:20",
      description: "Fluxo completo desde o pedido até a entrega",
      level: "Intermediário", 
      views: "543"
    },
    {
      title: "Relatórios e Análises Avançadas",
      duration: "9:10",
      description: "Como usar os relatórios para tomar decisões estratégicas",
      level: "Avançado",
      views: "432"
    },
    {
      title: "Otimização de Custos",
      duration: "11:30",
      description: "Estratégias para reduzir custos e aumentar lucros",
      level: "Avançado",
      views: "321"
    }
  ];

  const faqItems = [
    {
      question: "Como atualizar os custos dos ingredientes?",
      answer: "Vá para a página 'Ingredientes' e clique no ícone de editar ao lado do ingrediente desejado. O sistema automaticamente recalculará os custos das receitas e produtos que usam esse ingrediente.",
      category: "custos",
      popularity: 95
    },
    {
      question: "Como criar uma nova receita?",
      answer: "Acesse 'Receitas' > 'Nova Receita'. Adicione ingredientes base (custos únicos) e ingredientes por porção (multiplicados pelo número de porções). O custo total é calculado automaticamente.",
      category: "receitas",
      popularity: 92
    },
    {
      question: "Como funciona o cálculo de precificação?",
      answer: "O sistema calcula: (Custo dos Ingredientes + Embalagem) × (1 + % Desperdício) × (1 + % Margem) + Custos Extras. Tudo é feito automaticamente conforme você define as margens.",
      category: "precificacao",
      popularity: 88
    },
    {
      question: "Posso cadastrar múltiplos endereços para um cliente?",
      answer: "Sim! No cadastro do cliente, você pode adicionar quantos endereços quiser. Cada endereço pode ter um rótulo (Casa, Trabalho, etc.) e você pode marcar um como principal.",
      category: "clientes",
      popularity: 85
    },
    {
      question: "Como exportar relatórios?",
      answer: "Na página de Relatórios, selecione o período e filtros desejados, depois clique no botão 'Exportar'. Você pode escolher entre PDF para visualização ou Excel para análises.",
      category: "relatorios",
      popularity: 82
    },
    {
      question: "O sistema funciona em dispositivos móveis?",
      answer: "Sim! O TastyHub é totalmente responsivo. Você pode acessar todas as funcionalidades através do navegador do seu smartphone ou tablet.",
      category: "mobile",
      popularity: 78
    },
    {
      question: "Como configurar margens de lucro diferentes por produto?",
      answer: "Vá em 'Precificação' e crie configurações específicas para cada produto. Você pode definir margens, custos extras, impostos e outros fatores individuais.",
      category: "precificacao",
      popularity: 75
    },
    {
      question: "É possível controlar estoque de ingredientes?",
      answer: "Atualmente o sistema não controla estoque físico automaticamente, mas você pode acompanhar o consumo através dos relatórios de produção para ter uma estimativa.",
      category: "estoque",
      popularity: 70
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        title="Central de Ajuda"
        subtitle="Aprenda a usar o TastyHub e maximize seus resultados"
        icon={HelpCircle}
        gradient="from-indigo-500 via-purple-500 to-pink-500"
        badges={[
          { icon: BookOpen, text: "Guias Interativos" },
          { icon: Video, text: "Vídeo Tutoriais" },
          { icon: MessageCircle, text: "Suporte 24/7" }
        ]}
        actions={
          <Button 
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-white shadow-xl"
            onClick={() => window.open('mailto:suporte@tastyhub.com')}
          >
            <Mail className="mr-2 h-4 w-4" />
            Contatar Suporte
          </Button>
        }
      />

      <Tabs defaultValue="guides" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-lg">
          <TabsTrigger value="guides" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            <BookOpen className="h-4 w-4 mr-2" />
            Guias
          </TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Video className="h-4 w-4 mr-2" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            <MessageCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Phone className="h-4 w-4 mr-2" />
            Contato
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpSections.map((section, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                <CardHeader className="bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${section.color} text-white shadow-lg`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">{section.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {section.topics.map((topic, topicIndex) => (
                      <AccordionItem key={topicIndex} value={`item-${index}-${topicIndex}`} className="border-gray-200">
                        <AccordionTrigger className="text-left font-medium hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            {topic.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          <p className="mb-3">{topic.description}</p>
                          <div className="space-y-2">
                            <p className="font-medium text-sm text-gray-700">Passos:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {topic.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border-0 shadow-lg">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    <PlayCircle className="h-20 w-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-black/70 text-white text-xs">{video.duration}</Badge>
                    <Badge className="bg-white/90 text-gray-700 text-xs">{video.views} views</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        video.level === 'Iniciante' ? 'bg-green-100 text-green-700' :
                        video.level === 'Intermediário' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {video.level}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Assistir Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Pesquisar nas perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg focus:ring-2 focus:ring-blue-500 border-gray-200 shadow-sm"
            />
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                Perguntas Frequentes
                <Badge className="bg-blue-100 text-blue-600">{filteredFAQ.length} perguntas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {filteredFAQ.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4 hover:shadow-md transition-shadow">
                    <AccordionTrigger className="text-left py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {faq.popularity}% útil
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <p>{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma pergunta encontrada</h3>
                  <p className="text-gray-500 mb-6">Não encontramos perguntas para "{searchTerm}"</p>
                  <Button onClick={() => setSearchTerm("")} variant="outline">
                    Ver todas as perguntas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Email",
                subtitle: "Resposta em até 24 horas",
                contact: "suporte@tastyhub.com",
                action: "Enviar Email",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Chat Online",
                subtitle: "Segunda a Sexta: 9h às 18h",
                contact: "Suporte ao vivo",
                action: "Iniciar Chat",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Phone,
                title: "Telefone",
                subtitle: "Ligação gratuita",
                contact: "(11) 9999-9999",
                action: "Ligar Agora",
                color: "from-purple-500 to-purple-600"
              }
            ].map((contact, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className={`p-4 bg-gradient-to-r ${contact.color} rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <contact.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{contact.title}</h3>
                  <p className="text-gray-600 mb-4">{contact.subtitle}</p>
                  <p className="font-medium text-lg mb-6 text-gray-700">{contact.contact}</p>
                  <Button className={`w-full bg-gradient-to-r ${contact.color} hover:shadow-lg transition-shadow`}>
                    <contact.icon className="h-4 w-4 mr-2" />
                    {contact.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-gray-900 mb-3">Base de Conhecimento</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Acesse nossa base de conhecimento completa com artigos detalhados, 
                    tutoriais passo a passo e dicas avançadas para otimizar seu uso do TastyHub.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {['Tutoriais', 'Guias Avançados', 'Melhores Práticas', 'Dicas & Truques', 'Casos de Uso'].map((item) => (
                      <Badge key={item} variant="secondary" className="bg-white/70 text-blue-700 hover:bg-white transition-colors">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
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
