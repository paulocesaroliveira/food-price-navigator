
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
  created_by: string | null;
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "archived", label: "Arquivado" },
];

const NoticesForm: React.FC<NoticeFormProps> = ({ notice, onSave, onCancel }) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      title: notice?.title || "",
      content: notice?.content || "",
      status: notice?.status || "active",
    }
  });

  useEffect(() => {
    if (notice) {
      setValue("title", notice.title);
      setValue("content", notice.content || "");
      setValue("status", notice.status);
    }
    // eslint-disable-next-line
  }, [notice]);

  const onSubmit = async (values: { title: string; content: string; status: string }) => {
    if (!values.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    if (notice) {
      // Update notice
      const { error } = await supabase
        .from("notices")
        .update({
          title: values.title,
          content: values.content,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notice.id);
      if (error) {
        toast({ title: "Erro ao atualizar aviso", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Aviso atualizado com sucesso!" });
        onSave();
        reset();
      }
    } else {
      // Create notice
      const { error } = await supabase
        .from("notices")
        .insert([
          {
            title: values.title,
            content: values.content,
            status: values.status,
          }
        ]);
      if (error) {
        toast({ title: "Erro ao criar aviso", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Aviso criado com sucesso!" });
        onSave();
        reset();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{notice ? "Editar Aviso" : "Novo Aviso"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block font-medium mb-1">Título <Badge variant="secondary">obrigatório</Badge></label>
            <Input
              {...register("title", { required: true })}
              placeholder="Digite o título"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Conteúdo</label>
            <Textarea
              {...register("content")}
              placeholder="Escreva o texto do aviso (markdown suportado)"
              rows={4}
              maxLength={3000}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              className="rounded-md border bg-background px-3 py-2 text-base md:text-sm"
              {...register("status")}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" />}
              {notice ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticesForm;
