
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Plus, 
  Star, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  Users,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  has_admin_response: boolean;
}

interface TicketResponse {
  id: string;
  message: string;
  is_admin_response: boolean;
  created_at: string;
}

interface Feedback {
  id: string;
  type: 'general' | 'bug_report' | 'feature_request' | 'improvement';
  title: string;
  message: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'implemented' | 'dismissed';
  created_at: string;
}

const Suporte = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);
  
  // Formulário de novo ticket
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "general" as const
  });

  // Formulário de feedback
  const [newFeedback, setNewFeedback] = useState({
    type: "general" as const,
    title: "",
    message: "",
    rating: 5
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar tickets do usuário
  const { data: userTickets } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user
  });

  // Query para respostas do ticket selecionado
  const { data: ticketResponses } = useQuery({
    queryKey: ['ticket-responses', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .select('*')
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketResponse[];
    },
    enabled: !!selectedTicket
  });

  // Query para feedback do usuário
  const { data: userFeedback } = useQuery({
    queryKey: ['user-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
    enabled: !!user
  });

  // Contar tickets com respostas não lidas
  const unreadResponsesCount = userTickets?.filter(ticket => 
    ticket.has_admin_response && ticket.status !== 'closed'
  ).length || 0;

  // Mutation para criar novo ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          ...ticketData,
          user_id: user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Ticket criado com sucesso!" });
      setIsNewTicketOpen(false);
      setNewTicket({ title: "", description: "", priority: "medium", category: "general" });
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao criar ticket", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Mutation para enviar resposta
  const sendResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await supabase
        .from('support_ticket_responses')
        .insert([{
          ticket_id: ticketId,
          user_id: user?.id,
          message,
          is_admin_response: false
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Resposta enviada com sucesso!" });
      setResponseMessage("");
      queryClient.invalidateQueries({ queryKey: ['ticket-responses'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao enviar resposta", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Mutation para marcar ticket como lido
  const markAsReadMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ has_admin_response: false })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    }
  });

  // Mutation para criar feedback
  const createFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: typeof newFeedback) => {
      const { error } = await supabase
        .from('user_feedback')
        .insert([{
          ...feedbackData,
          user_id: user?.id,
          page_context: window.location.pathname
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Feedback enviado com sucesso!" });
      setIsNewFeedbackOpen(false);
      setNewFeedback({ type: "general", title: "", message: "", rating: 5 });
      queryClient.invalidateQueries({ queryKey: ['user-feedback'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao enviar feedback", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Central de Suporte
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Estamos aqui para ajudar! Gerencie seus tickets de suporte e compartilhe feedback sobre nossa plataforma.
          </p>
        </div>

        {/* Notificação de respostas */}
        {unreadResponsesCount > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🔔 {unreadResponsesCount} nova{unreadResponsesCount > 1 ? 's' : ''} resposta{unreadResponsesCount > 1 ? 's' : ''}!</strong> 
              {' '}Você tem tickets com respostas da nossa equipe de suporte.
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tickets Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userTickets?.filter(t => t.status !== 'closed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tickets Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userTickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Feedbacks Enviados</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userFeedback?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg">
            <Button
              variant={activeTab === "tickets" ? "default" : "ghost"}
              size="lg"
              onClick={() => setActiveTab("tickets")}
              className={activeTab === "tickets" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-blue-600"}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Meus Tickets
              {unreadResponsesCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadResponsesCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "feedback" ? "default" : "ghost"}
              size="lg"
              onClick={() => setActiveTab("feedback")}
              className={activeTab === "feedback" ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:text-purple-600"}
            >
              <Star className="w-5 h-5 mr-2" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Meus Tickets de Suporte</h2>
              <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-blue-800">🎫 Criar Novo Ticket</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">📝 Título do Problema:</label>
                      <Input
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        placeholder="Descreva brevemente o problema"
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">🚨 Prioridade:</label>
                        <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Baixa</SelectItem>
                            <SelectItem value="medium">🟡 Média</SelectItem>
                            <SelectItem value="high">🟠 Alta</SelectItem>
                            <SelectItem value="urgent">🔴 Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">📂 Categoria:</label>
                        <Select value={newTicket.category} onValueChange={(value: any) => setNewTicket({ ...newTicket, category: value })}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">📋 Geral</SelectItem>
                            <SelectItem value="bug">🐛 Bug</SelectItem>
                            <SelectItem value="feature_request">✨ Solicitação de Recurso</SelectItem>
                            <SelectItem value="technical_issue">⚙️ Problema Técnico</SelectItem>
                            <SelectItem value="billing">💰 Faturamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">📄 Descrição Detalhada:</label>
                      <Textarea
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        placeholder="Descreva detalhadamente o problema ou solicitação. Inclua passos para reproduzir o problema, se aplicável."
                        rows={5}
                        className="mt-2"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => createTicketMutation.mutate(newTicket)}
                      disabled={!newTicket.title || !newTicket.description || createTicketMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {createTicketMutation.isPending ? "Criando..." : "🚀 Criar Ticket"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Tickets */}
            <div className="grid gap-6">
              {userTickets?.map((ticket) => (
                <Card key={ticket.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-800">{ticket.title}</h3>
                          {ticket.has_admin_response && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                              <Bell className="w-3 h-3 mr-1" />
                              Nova Resposta
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getStatusColor(ticket.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {ticket.status}
                            </div>
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className="text-gray-600">
                            {ticket.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            📅 {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              if (ticket.has_admin_response) {
                                markAsReadMutation.mutate(ticket.id);
                              }
                            }}
                            className="ml-4 shadow-md hover:shadow-lg transition-shadow"
                          >
                            💬 Ver Conversa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-blue-800">
                              🎫 {ticket.title}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <p className="text-gray-800">{ticket.description}</p>
                            </div>
                            
                            {/* Conversas */}
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                              <h4 className="font-semibold text-gray-800">💬 Histórico da Conversa:</h4>
                              {ticketResponses?.map((response) => (
                                <div 
                                  key={response.id} 
                                  className={`p-4 rounded-lg shadow-sm ${
                                    response.is_admin_response 
                                      ? 'bg-green-50 border-l-4 border-green-500 ml-4' 
                                      : 'bg-gray-50 border-l-4 border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                      {response.is_admin_response ? (
                                        <>
                                          <Users className="w-4 h-4 text-green-600" />
                                          🛠️ Equipe de Suporte
                                        </>
                                      ) : (
                                        <>
                                          <MessageCircle className="w-4 h-4 text-gray-600" />
                                          👤 Você
                                        </>
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      📅 {new Date(response.created_at).toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">{response.message}</p>
                                </div>
                              ))}
                            </div>
                            
                            {/* Enviar nova mensagem */}
                            {ticket.status !== 'closed' && (
                              <div className="space-y-3 border-t pt-4">
                                <h4 className="font-semibold text-gray-800">✍️ Adicionar Resposta:</h4>
                                <Textarea
                                  value={responseMessage}
                                  onChange={(e) => setResponseMessage(e.target.value)}
                                  placeholder="Digite sua mensagem..."
                                  rows={4}
                                  className="resize-none"
                                />
                                <Button 
                                  onClick={() => {
                                    if (responseMessage.trim() && selectedTicket) {
                                      sendResponseMutation.mutate({
                                        ticketId: selectedTicket.id,
                                        message: responseMessage
                                      });
                                    }
                                  }}
                                  disabled={!responseMessage.trim() || sendResponseMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {sendResponseMutation.isPending ? "Enviando..." : "🚀 Enviar Resposta"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!userTickets || userTickets.length === 0) && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        🎫 Nenhum ticket encontrado
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Você ainda não criou nenhum ticket de suporte. Nossa equipe está sempre pronta para ajudar!
                      </p>
                      <Button 
                        onClick={() => setIsNewTicketOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        🚀 Criar Primeiro Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Compartilhar Feedback</h2>
              <Dialog open={isNewFeedbackOpen} onOpenChange={setIsNewFeedbackOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-purple-800">⭐ Compartilhar Feedback</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">📂 Tipo de Feedback:</label>
                      <Select value={newFeedback.type} onValueChange={(value: any) => setNewFeedback({ ...newFeedback, type: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">💬 Geral</SelectItem>
                          <SelectItem value="bug_report">🐛 Relatar Bug</SelectItem>
                          <SelectItem value="feature_request">✨ Solicitar Recurso</SelectItem>
                          <SelectItem value="improvement">🔧 Sugestão de Melhoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">📝 Título:</label>
                      <Input
                        value={newFeedback.title}
                        onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                        placeholder="Título do feedback"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">⭐ Avaliação Geral (1-5):</label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                              star <= newFeedback.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                            onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({newFeedback.rating}/5)</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">💭 Sua Mensagem:</label>
                      <Textarea
                        value={newFeedback.message}
                        onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                        placeholder="Conte-nos sobre sua experiência, sugestões ou problemas encontrados..."
                        rows={5}
                        className="mt-2"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => createFeedbackMutation.mutate(newFeedback)}
                      disabled={!newFeedback.title || !newFeedback.message || createFeedbackMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    >
                      {createFeedbackMutation.isPending ? "Enviando..." : "🚀 Enviar Feedback"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Feedback */}
            <div className="grid gap-6">
              {userFeedback?.map((feedback) => (
                <Card key={feedback.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{feedback.title}</h3>
                        <p className="text-gray-600 mb-4">
                          {feedback.message}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-gray-600">
                            {feedback.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {feedback.rating ? (
                              Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < feedback.rating!
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))
                            ) : null}
                          </div>
                          <span className="text-sm text-gray-500">
                            📅 {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        className={
                          feedback.status === 'implemented' ? 'bg-green-100 text-green-800 border-green-200' :
                          feedback.status === 'reviewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          feedback.status === 'dismissed' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      >
                        {feedback.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!userFeedback || userFeedback.length === 0) && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-12 h-12 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        ⭐ Nenhum feedback enviado
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Sua opinião é muito importante para nós! Compartilhe sua experiência e ajude-nos a melhorar.
                      </p>
                      <Button 
                        onClick={() => setIsNewFeedbackOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        🚀 Enviar Primeiro Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suporte;
