
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

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
    return null;
  }

  if (!notices || notices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-8">
      {notices.map((notice: any) => (
        <Alert key={notice.id} className="bg-orange-50">
          <Shield className="h-5 w-5 text-orange-600" />
          <AlertTitle className="font-bold">{notice.title}</AlertTitle>
          <AlertDescription>
            <div className="whitespace-pre-line">{notice.content}</div>
            <div className="text-xs text-gray-500 mt-2">{notice.published_at ? new Date(notice.published_at).toLocaleString("pt-BR") : null}</div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default DashboardNotices;
