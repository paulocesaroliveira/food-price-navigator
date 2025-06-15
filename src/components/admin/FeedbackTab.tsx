
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Star, MessageSquare, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserFeedback {
  id: string;
  type: 'general' | 'bug_report' | 'feature_request' | 'improvement';
  title: string;
  message: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'implemented' | 'dismissed';
  created_at: string;
  user_id: string;
  page_context?: string;
}

const FeedbackTab = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar feedbacks
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['admin-feedbacks', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserFeedback[];
    }
  });

  // Mutation para atualizar status do feedback
  const updateStatusMutation = useMutation({
    mutationFn: async ({ feedbackId, status }: { feedbackId: string; status: string }) => {
      const { error } = await supabase
        .from('user_feedback')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Status do feedback atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar status", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug_report': return 'bg-red-100 text-red-800';
      case 'feature_request': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-yellow-100 text-yellow-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug_report': return 'Bug Report';
      case 'feature_request': return 'Solicitação de Recurso';
      case 'improvement': return 'Melhoria';
      case 'general': return 'Geral';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'reviewed': return 'Revisado';
      case 'implemented': return 'Implementado';
      case 'dismissed': return 'Rejeitado';
      default: return status;
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
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="reviewed">Revisado</SelectItem>
            <SelectItem value="implemented">Implementado</SelectItem>
            <SelectItem value="dismissed">Rejeitado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="general">Geral</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
            <SelectItem value="feature_request">Solicitação</SelectItem>
            <SelectItem value="improvement">Melhoria</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary">
          {feedbacks?.length || 0} feedbacks
        </Badge>
      </div>

      {/* Tabela de Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedbacks dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks?.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">
                      {feedback.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(feedback.type)}>
                        {getTypeLabel(feedback.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(feedback.status)}>
                        {getStatusLabel(feedback.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{feedback.title}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Informações básicas */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Tipo:</label>
                                <p className="mt-1">
                                  <Badge className={getTypeColor(feedback.type)}>
                                    {getTypeLabel(feedback.type)}
                                  </Badge>
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Avaliação:</label>
                                <div className="flex items-center gap-1 mt-1">
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
                                  ) : (
                                    <span className="text-gray-500">Não avaliado</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mensagem */}
                            <div>
                              <label className="text-sm font-medium">Mensagem:</label>
                              <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                                {feedback.message}
                              </p>
                            </div>

                            {/* Contexto da página */}
                            {feedback.page_context && (
                              <div>
                                <label className="text-sm font-medium">Página:</label>
                                <p className="mt-1 text-sm text-gray-600">
                                  {feedback.page_context}
                                </p>
                              </div>
                            )}

                            {/* Atualizar Status */}
                            <div>
                              <label className="text-sm font-medium">Atualizar Status:</label>
                              <div className="flex items-center gap-2 mt-2">
                                <Select 
                                  value={feedback.status} 
                                  onValueChange={(value) => 
                                    updateStatusMutation.mutate({ 
                                      feedbackId: feedback.id, 
                                      status: value 
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="reviewed">Revisado</SelectItem>
                                    <SelectItem value="implemented">Implementado</SelectItem>
                                    <SelectItem value="dismissed">Rejeitado</SelectItem>
                                  </SelectContent>
                                </Select>
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

export default FeedbackTab;
