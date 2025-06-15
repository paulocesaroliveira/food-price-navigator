
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface NoticeFormProps {
  notice?: Notice | null;
  onSave: () => void;
  onCancel: () => void;
}

export interface Notice {
  id: string;
  title: string;
  content: string | null;
  published_at: string | null;
  status: string;
  priority?: string;
  created_by: string | null;
}

const statusOptions = [
  { value: "active", label: "✅ Ativo", description: "Visível para todos os usuários" },
  { value: "inactive", label: "⏸️ Inativo", description: "Oculto temporariamente" },
  { value: "archived", label: "📦 Arquivado", description: "Arquivado permanentemente" },
];

const priorityOptions = [
  { value: "low", label: "🔵 Baixa", description: "Informativo" },
  { value: "medium", label: "🟡 Média", description: "Importante" },
  { value: "high", label: "🔴 Alta", description: "Urgente" },
];

const NoticesForm: React.FC<NoticeFormProps> = ({ notice, onSave, onCancel }) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      title: notice?.title || "",
      content: notice?.content || "",
      status: notice?.status || "active",
      priority: notice?.priority || "medium",
    }
  });

  const watchedStatus = watch("status");
  const watchedPriority = watch("priority");

  useEffect(() => {
    if (notice) {
      setValue("title", notice.title);
      setValue("content", notice.content || "");
      setValue("status", notice.status);
      setValue("priority", notice.priority || "medium");
    }
  }, [notice, setValue]);

  const onSubmit = async (values: { title: string; content: string; status: string; priority: string }) => {
    if (!values.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    
    try {
      if (notice) {
        // Update notice
        const { error } = await supabase
          .from("notices")
          .update({
            title: values.title,
            content: values.content,
            status: values.status,
            priority: values.priority,
            updated_at: new Date().toISOString(),
          })
          .eq("id", notice.id);
          
        if (error) throw error;
        
        toast({ 
          title: "✅ Aviso atualizado com sucesso!",
          description: `Status: ${statusOptions.find(s => s.value === values.status)?.label}`
        });
      } else {
        // Create notice
        const { error } = await supabase
          .from("notices")
          .insert([
            {
              title: values.title,
              content: values.content,
              status: values.status,
              priority: values.priority,
              published_at: values.status === 'active' ? new Date().toISOString() : null,
            }
          ]);
          
        if (error) throw error;
        
        toast({ 
          title: "✅ Aviso criado com sucesso!",
          description: `Status: ${statusOptions.find(s => s.value === values.status)?.label}`
        });
      }
      
      onSave();
      reset();
    } catch (error: any) {
      toast({ 
        title: "Erro ao salvar aviso", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {notice ? "✏️ Editar Aviso" : "➕ Novo Aviso"}
          {notice && (
            <Badge variant={notice.status === 'active' ? 'default' : 'secondary'}>
              {statusOptions.find(s => s.value === notice.status)?.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block font-medium mb-2">
              📝 Título <Badge variant="destructive" className="ml-1">obrigatório</Badge>
            </label>
            <Input
              {...register("title", { required: true })}
              placeholder="Digite um título chamativo para o aviso"
              maxLength={100}
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 100 caracteres</p>
          </div>
          
          <div>
            <label className="block font-medium mb-2">📄 Conteúdo da Mensagem</label>
            <Textarea
              {...register("content")}
              placeholder="Escreva aqui a mensagem completa do aviso. Seja claro e objetivo para garantir que os usuários compreendam a informação."
              rows={6}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 2000 caracteres</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">🎯 Prioridade</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                {...register("priority")}
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} - {opt.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {priorityOptions.find(p => p.value === watchedPriority)?.description}
              </p>
            </div>
            
            <div>
              <label className="block font-medium mb-2">📊 Status de Publicação</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                {...register("status")}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {statusOptions.find(s => s.value === watchedStatus)?.description}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="px-6"
            >
              ❌ Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {notice ? "💾 Salvar Alterações" : "✅ Criar Aviso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticesForm;
