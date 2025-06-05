
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const Help = () => {
  const helpSections = [
    {
      title: "Primeiros Passos",
      icon: Zap,
      color: "bg-blue-50 border-blue-200",
      items: [
        "Como configurar seu perfil e loja",
        "Cadastrando seus primeiros ingredientes",
        "Criando suas primeiras receitas",
        "Configurando produtos e preços"
      ]
    },
    {
      title: "Gestão de Produtos",
      icon: BookOpen,
      color: "bg-green-50 border-green-200",
      items: [
        "Como calcular custos de receitas",
        "Gerenciando ingredientes e fornecedores",
        "Configurando embalagens",
        "Precificação automática"
      ]
    },
    {
      title: "Vendas e Pedidos",
      icon: Users,
      color: "bg-purple-50 border-purple-200",
      items: [
        "Criando e gerenciando pedidos",
        "Cadastro de clientes",
        "Controle de entregas",
        "Relatórios de vendas"
      ]
    },
    {
      title: "Financeiro",
      icon: FileText,
      color: "bg-orange-50 border-orange-200",
      items: [
        "Contas a pagar e receber",
        "Fluxo de caixa",
        "Controle de despesas",
        "Relatórios financeiros"
      ]
    }
  ];

  const faqItems = [
    {
      question: "Como atualizar os custos dos ingredientes?",
      answer: "Vá para a página 'Atualizar Custos' no menu lateral. Lá você pode atualizar os preços dos ingredientes e o sistema recalculará automaticamente os custos das receitas e produtos."
    },
    {
      question: "Como criar uma nova receita?",
      answer: "Acesse 'Receitas' no menu, clique em 'Nova Receita' e preencha as informações. Você pode adicionar ingredientes base (custos únicos) e ingredientes por porção."
    },
    {
      question: "Como funciona o cálculo de precificação?",
      answer: "O sistema calcula automaticamente com base nos custos dos ingredientes, embalagens e aplica as margens de lucro que você configurar na página de Precificação."
    },
    {
      question: "Posso exportar relatórios?",
      answer: "Sim! Na página de Relatórios você encontra diversas opções de relatórios que podem ser visualizados e exportados."
    }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Ajuda e Suporte"
        subtitle="Encontre respostas e aprenda a usar o TastyHub"
        icon={HelpCircle}
        gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        badges={[
          { icon: BookOpen, text: "Documentação completa" },
          { icon: Video, text: "Tutoriais em vídeo" }
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

      {/* Seções de Ajuda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpSections.map((section, index) => (
          <Card key={index} className={`${section.color} hover:shadow-lg transition-shadow`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contatos de Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-lg">
          <CardContent className="p-6">
            <Mail className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-medium mb-2">Email</h3>
            <p className="text-sm text-gray-600 mb-3">suporte@tastyhub.com</p>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Enviar Email
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-lg">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-medium mb-2">Chat Online</h3>
            <p className="text-sm text-gray-600 mb-3">Seg-Sex: 9h às 18h</p>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-lg">
          <CardContent className="p-6">
            <Phone className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-medium mb-2">Telefone</h3>
            <p className="text-sm text-gray-600 mb-3">(11) 9999-9999</p>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Ligar Agora
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recursos Adicionais */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Video className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Tutoriais em Vídeo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Assista nossos tutoriais completos para aprender a usar todas as funcionalidades do TastyHub.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Ingredientes</Badge>
                <Badge variant="secondary">Receitas</Badge>
                <Badge variant="secondary">Pedidos</Badge>
                <Badge variant="secondary">Relatórios</Badge>
              </div>
            </div>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Tutoriais
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
