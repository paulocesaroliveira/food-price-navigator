
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle
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
      toast({ title: "Ticket criado com sucesso!" });
      setIsNewTicketOpen(false);
      setNewTicket({ title: "", description: "", priority: "medium", category: "general" });
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar ticket", 
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
      toast({ title: "Resposta enviada com sucesso!" });
      setResponseMessage("");
      queryClient.invalidateQueries({ queryKey: ['ticket-responses'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao enviar resposta", 
        description: error.message, 
        variant: "destructive" 
      });
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
      toast({ title: "Feedback enviado com sucesso!" });
      setIsNewFeedbackOpen(false);
      setNewFeedback({ type: "general", title: "", message: "", rating: 5 });
      queryClient.invalidateQueries({ queryKey: ['user-feedback'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao enviar feedback", 
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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Suporte</h1>
        <p className="text-muted-foreground">
          Gerencie seus tickets de suporte e envie feedback sobre o sistema
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "tickets" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("tickets")}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Meus Tickets
        </Button>
        <Button
          variant={activeTab === "feedback" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("feedback")}
        >
          <Star className="w-4 h-4 mr-2" />
          Feedback
        </Button>
      </div>

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Meus Tickets de Suporte</h2>
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título:</label>
                    <Input
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      placeholder="Descreva brevemente o problema"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Prioridade:</label>
                      <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Categoria:</label>
                      <Select value={newTicket.category} onValueChange={(value: any) => setNewTicket({ ...newTicket, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Geral</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature_request">Solicitação de Recurso</SelectItem>
                          <SelectItem value="technical_issue">Problema Técnico</SelectItem>
                          <SelectItem value="billing">Faturamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrição:</label>
                    <Textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Descreva detalhadamente o problema ou solicitação"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => createTicketMutation.mutate(newTicket)}
                    disabled={!newTicket.title || !newTicket.description || createTicketMutation.isPending}
                    className="w-full"
                  >
                    {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Tickets */}
          <div className="grid gap-4">
            {userTickets?.map((ticket) => (
              <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </div>
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Ver Conversa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{ticket.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm">{ticket.description}</p>
                          </div>
                          
                          {/* Conversas */}
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {ticketResponses?.map((response) => (
                              <div 
                                key={response.id} 
                                className={`p-3 rounded-lg ${
                                  response.is_admin_response 
                                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                                    : 'bg-gray-50 border-l-4 border-gray-300 ml-4'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">
                                    {response.is_admin_response ? 'Suporte' : 'Você'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(response.created_at).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-sm">{response.message}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Enviar nova mensagem */}
                          {ticket.status !== 'closed' && (
                            <div className="space-y-2">
                              <Textarea
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                rows={3}
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
                                size="sm"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {sendResponseMutation.isPending ? "Enviando..." : "Enviar"}
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
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum ticket encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não criou nenhum ticket de suporte.
                  </p>
                  <Button onClick={() => setIsNewTicketOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Ticket
                  </Button>
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
            <h2 className="text-xl font-semibold">Enviar Feedback</h2>
            <Dialog open={isNewFeedbackOpen} onOpenChange={setIsNewFeedbackOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipo:</label>
                    <Select value={newFeedback.type} onValueChange={(value: any) => setNewFeedback({ ...newFeedback, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="bug_report">Relatar Bug</SelectItem>
                        <SelectItem value="feature_request">Solicitar Recurso</SelectItem>
                        <SelectItem value="improvement">Sugestão de Melhoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Título:</label>
                    <Input
                      value={newFeedback.title}
                      onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                      placeholder="Título do feedback"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Avaliação (1-5):</label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${
                            star <= newFeedback.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                          onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Mensagem:</label>
                    <Textarea
                      value={newFeedback.message}
                      onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                      placeholder="Descreva seu feedback detalhadamente"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => createFeedbackMutation.mutate(newFeedback)}
                    disabled={!newFeedback.title || !newFeedback.message || createFeedbackMutation.isPending}
                    className="w-full"
                  >
                    {createFeedbackMutation.isPending ? "Enviando..." : "Enviar Feedback"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Feedback */}
          <div className="grid gap-4">
            {userFeedback?.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{feedback.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {feedback.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{feedback.type}</Badge>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (feedback.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      className={
                        feedback.status === 'implemented' ? 'bg-green-100 text-green-800' :
                        feedback.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        feedback.status === 'dismissed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {feedback.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!userFeedback || userFeedback.length === 0) && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum feedback enviado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Compartilhe sua experiência conosco!
                  </p>
                  <Button onClick={() => setIsNewFeedbackOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Enviar Primeiro Feedback
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suporte;
