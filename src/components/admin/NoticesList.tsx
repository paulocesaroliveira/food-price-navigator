
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoticesForm, { Notice } from "./NoticesForm";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Edit, Trash } from "lucide-react";

const NoticesList: React.FC = () => {
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notices, isLoading } = useQuery<Notice[]>({
    queryKey: ["notices-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data as Notice[];
    }
  });

  const handleDelete = async (notice: Notice) => {
    const confirmed = window.confirm(`Deseja mesmo excluir o aviso "${notice.title}"?`);
    if (!confirmed) return;
    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", notice.id);
    if (error) {
      toast({ title: "Erro ao excluir aviso", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Aviso excluído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["notices-list"] });
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingNotice(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingNotice(null);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["notices-list"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {!showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Avisos & Notícias
            </CardTitle>
            <Button onClick={handleNew}>Novo Aviso</Button>
          </CardHeader>
          <CardContent>
            {notices && notices.length > 0 ? (
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="rounded-lg border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-muted transition">
                    <div>
                      <span className="font-medium text-lg">{n.title}</span>
                      <div className="text-xs text-gray-500 mt-1">{n.published_at ? new Date(n.published_at).toLocaleString("pt-BR") : null}</div>
                      <Badge variant={
                        n.status === "active" ? "default"
                        : n.status === "inactive" ? "secondary"
                        : "outline"
                      }>{n.status === "active" ? "Ativo" : n.status === "inactive" ? "Inativo" : "Arquivado"}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(n)}>
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(n)}>
                        <Trash className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">Ainda não há avisos cadastrados.</div>
            )}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <NoticesForm
          notice={editingNotice}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
};

export default NoticesList;
