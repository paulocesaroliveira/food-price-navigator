
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface TicketResponse {
  id: string;
  message: string;
  is_admin_response: boolean;
  created_at: string;
  user_id: string;
}

const SupportTicketsTab = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  // Query para buscar respostas do ticket selecionado
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

  // Mutation para enviar resposta
  const sendResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('support_ticket_responses')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin_response: true
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

  // Mutation para atualizar status do ticket
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Status atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: selectedTicket.status });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar status", 
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tickets</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {tickets?.length || 0} tickets
          </Badge>
        </div>
      </div>

      {/* Tabela de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tickets de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      {ticket.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Ticket: {ticket.title}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Informações do Ticket */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Status:</label>
                                <Select 
                                  value={ticket.status} 
                                  onValueChange={(value) => 
                                    updateStatusMutation.mutate({ 
                                      ticketId: ticket.id, 
                                      status: value 
                                    })
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="in_progress">Em andamento</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                    <SelectItem value="closed">Fechado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Prioridade:</label>
                                <p className="mt-1">
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    {ticket.priority}
                                  </Badge>
                                </p>
                              </div>
                            </div>

                            {/* Descrição */}
                            <div>
                              <label className="text-sm font-medium">Descrição:</label>
                              <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {ticket.description}
                              </p>
                            </div>

                            {/* Histórico de Respostas */}
                            <div>
                              <label className="text-sm font-medium">Histórico de Conversas:</label>
                              <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                                {ticketResponses?.map((response) => (
                                  <div 
                                    key={response.id} 
                                    className={`p-3 rounded-lg ${
                                      response.is_admin_response 
                                        ? 'bg-blue-50 border-l-4 border-blue-500 ml-4' 
                                        : 'bg-gray-50 border-l-4 border-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium">
                                        {response.is_admin_response ? 'Admin' : 'Usuário'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(response.created_at).toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-sm">{response.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Enviar Resposta */}
                            <div>
                              <label className="text-sm font-medium">Enviar Resposta:</label>
                              <div className="mt-2 space-y-2">
                                <Textarea
                                  value={responseMessage}
                                  onChange={(e) => setResponseMessage(e.target.value)}
                                  placeholder="Digite sua resposta..."
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
                                >
                                  {sendResponseMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketsTab;
