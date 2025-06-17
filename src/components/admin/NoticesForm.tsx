
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export interface Notice {
  id?: string;
  title: string;
  content: string;
  status: 'active' | 'inactive' | 'archived';
  priority: 'low' | 'medium' | 'high';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

interface NoticesFormProps {
  notice?: Notice | null;
  onSave: () => void;
  onCancel: () => void;
}

const NoticesForm: React.FC<NoticesFormProps> = ({ notice, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Notice>({
    title: "",
    content: "",
    status: "active" as const,
    priority: "medium" as const
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || "",
        content: notice.content || "",
        status: notice.status || "active",
        priority: notice.priority || "medium"
      });
    }
  }, [notice]);

  const saveMutation = useMutation({
    mutationFn: async (data: Notice) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (notice?.id) {
        // Atualizar
        const { error } = await supabase
          .from("notices")
          .update({
            title: data.title,
            content: data.content,
            status: data.status,
            priority: data.priority,
            updated_at: new Date().toISOString()
          })
          .eq("id", notice.id);
        
        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from("notices")
          .insert([{
            title: data.title,
            content: data.content,
            status: data.status,
            priority: data.priority,
            published_at: data.status === 'active' ? new Date().toISOString() : null,
            created_by: user?.id
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: notice?.id ? "Aviso atualizado!" : "Aviso criado!",
        description: notice?.id ? "O aviso foi atualizado com sucesso." : "O novo aviso foi criado com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["notices-list"] });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar aviso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, preencha o título do aviso.",
        variant: "destructive"
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof Notice, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {notice?.id ? "Editar Aviso" : "Novo Aviso"}
        </CardTitle>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do aviso"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Digite o conteúdo do aviso"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'inactive' | 'archived') => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prioridade</label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Aviso"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticesForm;
