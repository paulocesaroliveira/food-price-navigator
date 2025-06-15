
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

const DashboardNotices: React.FC = () => {
  const { data: notices, isLoading } = useQuery({
    queryKey: ["dashboard-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("status", "active")
        .order("published_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!notices || notices.length === 0) {
    return null;
  }

  const getNoticeIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <Bell className="h-5 w-5 text-orange-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getNoticeStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return "border-red-200 bg-red-50";
      case 'medium':
        return "border-orange-200 bg-orange-50";
      case 'low':
        return "border-blue-200 bg-blue-50";
      default:
        return "border-green-200 bg-green-50";
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-600" />
        Avisos do Sistema
        <Badge variant="secondary">{notices.length}</Badge>
      </h2>
      
      <div className="space-y-3">
        {notices.map((notice: any) => (
          <Card key={notice.id} className={`${getNoticeStyle(notice.priority || 'medium')} shadow-md`}>
            <CardContent className="p-4">
              <Alert className="border-0 bg-transparent p-0">
                <div className="flex items-start gap-3">
                  {getNoticeIcon(notice.priority || 'medium')}
                  <div className="flex-1">
                    <AlertTitle className="font-bold text-lg mb-2">
                      {notice.title}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="whitespace-pre-line text-gray-700 mb-3">
                        {notice.content}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          📅 Publicado em: {notice.published_at 
                            ? new Date(notice.published_at).toLocaleString("pt-BR") 
                            : "Data não disponível"}
                        </div>
                        {notice.priority && (
                          <Badge 
                            variant={notice.priority === 'high' ? 'destructive' : 
                                   notice.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {notice.priority === 'high' ? '🔴 Urgente' : 
                             notice.priority === 'medium' ? '🟡 Importante' : '🔵 Informativo'}
                          </Badge>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardNotices;
