
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  ChefHat, 
  Package2, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Calculator,
  FileText,
  Settings,
  Lightbulb,
  BookOpen,
  Video,
  MessageCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const helpSections = [
    {
      id: 'ingredients',
      title: 'Ingredientes',
      icon: ChefHat,
      color: 'bg-green-500',
      faqs: [
        {
          question: 'Como cadastrar um novo ingrediente?',
          answer: 'Vá para a página Ingredientes, clique em "Novo Ingrediente", preencha os dados como nome, preço, unidade de medida e salve.'
        },
        {
          question: 'Como organizar ingredientes por categoria?',
          answer: 'Use o botão "Gerenciar Categorias" para criar categorias personalizadas e organize seus ingredientes de forma mais eficiente.'
        },
        {
          question: 'Como atualizar o preço de um ingrediente?',
          answer: 'Clique no ingrediente desejado, selecione "Editar" e atualize o campo preço. O sistema recalculará automaticamente os custos das receitas.'
        }
      ]
    },
    {
      id: 'recipes',
      title: 'Receitas',
      icon: BookOpen,
      color: 'bg-orange-500',
      faqs: [
        {
          question: 'Como criar uma nova receita?',
          answer: 'Acesse a página Receitas, clique em "Nova Receita", adicione os ingredientes com suas quantidades e o sistema calculará o custo automaticamente.'
        },
        {
          question: 'Como calcular o custo de produção?',
          answer: 'O custo é calculado automaticamente com base nos ingredientes e suas quantidades. Você pode ver o custo total e por porção na visualização da receita.'
        },
        {
          question: 'Posso duplicar uma receita existente?',
          answer: 'Sim, você pode usar uma receita como base para criar uma nova, editando apenas os ingredientes que desejar alterar.'
        }
      ]
    },
    {
      id: 'packaging',
      title: 'Embalagens',
      icon: Package2,
      color: 'bg-blue-500',
      faqs: [
        {
          question: 'Como cadastrar embalagens?',
          answer: 'Vá para Embalagens, clique em "Nova Embalagem", informe o nome, custo unitário e outras especificações necessárias.'
        },
        {
          question: 'Como calcular o custo da embalagem no produto?',
          answer: 'O sistema automaticamente inclui o custo da embalagem no cálculo final do produto quando você associa uma embalagem a ele.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Produtos',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      faqs: [
        {
          question: 'Como criar um produto completo?',
          answer: 'Vá para Produtos, clique em "Novo Produto", selecione a receita base, adicione embalagem e defina margem de lucro. O preço será calculado automaticamente.'
        },
        {
          question: 'Como definir preço de venda?',
          answer: 'O sistema calcula automaticamente baseado no custo de produção + embalagem + margem de lucro. Você pode ajustar manualmente se necessário.'
        },
        {
          question: 'Como organizar produtos por categoria?',
          answer: 'Use o sistema de categorias para organizar seus produtos por tipo (bolos, doces, salgados, etc.).'
        }
      ]
    },
    {
      id: 'customers',
      title: 'Clientes',
      icon: Users,
      color: 'bg-cyan-500',
      faqs: [
        {
          question: 'Como cadastrar clientes?',
          answer: 'Acesse Clientes, clique em "Novo Cliente", preencha os dados pessoais e endereços de entrega.'
        },
        {
          question: 'Posso ter múltiplos endereços por cliente?',
          answer: 'Sim, cada cliente pode ter vários endereços cadastrados, facilitando entregas em locais diferentes.'
        },
        {
          question: 'Como exportar lista de clientes?',
          answer: 'Use o botão "Exportar CSV" na página de clientes para baixar uma planilha com todos os dados.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Pedidos',
      icon: FileText,
      color: 'bg-indigo-500',
      faqs: [
        {
          question: 'Como criar um novo pedido?',
          answer: 'Vá para Pedidos, clique em "Novo Pedido", selecione o cliente, adicione produtos e quantidades, defina data de entrega.'
        },
        {
          question: 'Como acompanhar status dos pedidos?',
          answer: 'Cada pedido tem um status (Pendente, Confirmado, Entregue, Cancelado) que pode ser atualizado conforme o andamento.'
        },
        {
          question: 'Posso editar um pedido após criação?',
          answer: 'Sim, pedidos podem ser editados até serem marcados como entregues, permitindo ajustes de última hora.'
        }
      ]
    },
    {
      id: 'sales',
      title: 'Vendas',
      icon: DollarSign,
      color: 'bg-emerald-500',
      faqs: [
        {
          question: 'Como registrar uma venda?',
          answer: 'Acesse Vendas, clique em "Nova Venda", selecione produtos, quantidades, ponto de venda e método de pagamento.'
        },
        {
          question: 'Como acompanhar minhas vendas?',
          answer: 'O dashboard e a página de vendas mostram relatórios detalhados com faturamento, produtos mais vendidos e tendências.'
        },
        {
          question: 'Posso definir diferentes pontos de venda?',
          answer: 'Sim, você pode cadastrar diferentes pontos de venda para organizar melhor suas vendas (loja física, online, eventos, etc.).'
        }
      ]
    },
    {
      id: 'pricing',
      title: 'Precificação',
      icon: Calculator,
      color: 'bg-amber-500',
      faqs: [
        {
          question: 'Como o sistema calcula preços?',
          answer: 'O cálculo considera custo dos ingredientes + embalagem + mão de obra + margem de lucro para chegar ao preço final.'
        },
        {
          question: 'Posso criar diferentes configurações de preço?',
          answer: 'Sim, você pode criar múltiplas configurações de precificação para diferentes cenários (atacado, varejo, eventos).'
        },
        {
          question: 'Como incluir custos adicionais?',
          answer: 'Na configuração de precificação, você pode adicionar custos como energia, gás, mão de obra e outros gastos operacionais.'
        }
      ]
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.faqs.some(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const quickTips = [
    {
      icon: Lightbulb,
      title: 'Atualize custos regularmente',
      description: 'Mantenha os preços dos ingredientes atualizados para ter custos precisos.'
    },
    {
      icon: Calculator,
      title: 'Use a precificação automática',
      description: 'Deixe o sistema calcular preços automaticamente para evitar prejuízos.'
    },
    {
      icon: FileText,
      title: 'Organize por categorias',
      description: 'Use categorias para organizar ingredientes, produtos e clientes.'
    },
    {
      icon: Settings,
      title: 'Configure seu perfil',
      description: 'Complete as configurações do sistema para melhor experiência.'
    }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Central de Ajuda"
        subtitle="Encontre respostas para suas dúvidas e aprenda a usar todas as funcionalidades"
        icon={HelpCircle}
        gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500"
        badges={[
          { icon: BookOpen, text: `${helpSections.length} seções` },
          { icon: MessageCircle, text: `${helpSections.reduce((acc, section) => acc + section.faqs.length, 0)} perguntas` },
          { icon: Video, text: 'Tutoriais disponíveis' }
        ]}
      />

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar por funcionalidade ou pergunta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-lg input-focus"
        />
      </div>

      {/* Dicas Rápidas */}
      <Card className="custom-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Dicas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTips.map((tip, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border">
                <tip.icon className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seções de Ajuda */}
      <div className="grid gap-4">
        {filteredSections.map((section) => (
          <Card key={section.id} className="custom-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${section.color} text-white`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {section.faqs.length} perguntas
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.faqs.map((faq, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger 
                    className="flex items-center justify-between w-full p-3 text-left rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(`${section.id}-${index}`)}
                  >
                    <span className="font-medium text-sm">{faq.question}</span>
                    {openSections.includes(`${section.id}-${index}`) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <Card className="custom-card">
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar com termos diferentes ou explore as seções disponíveis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contato e Suporte */}
      <Card className="custom-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Precisa de mais ajuda?</h3>
          <p className="text-muted-foreground mb-4">
            Não encontrou a resposta que procurava? Nossa equipe está aqui para ajudar!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              📧 suporte@tastyhub.com
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              📱 WhatsApp: (11) 99999-9999
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🕒 Seg-Sex: 9h às 18h
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
