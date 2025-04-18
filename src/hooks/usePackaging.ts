
import { useState, useCallback } from "react";
import { Packaging } from "@/types";
import { getPackagingList, createPackaging, updatePackaging, deletePackaging, searchPackaging } from "@/services/packagingService";
import { toast } from "@/hooks/use-toast";

export const usePackaging = () => {
  const [packagingList, setPackagingList] = useState<Packaging[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPackagingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPackagingList();
      setPackagingList(data);
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao buscar embalagens: ${error.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPackaging = useCallback(async (packaging: Omit<Packaging, "id" | "unitCost">) => {
    try {
      const newPackaging = await createPackaging(packaging as Omit<Packaging, "id">);
      setPackagingList(prev => [...prev, newPackaging]);
      toast({
        title: "Sucesso",
        description: "Embalagem criada com sucesso!",
      });
      return newPackaging;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar embalagem: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const editPackaging = useCallback(async (id: string, packaging: Partial<Omit<Packaging, "id">>) => {
    try {
      const updatedPackaging = await updatePackaging(id, packaging);
      setPackagingList(prev => 
        prev.map(item => item.id === id ? updatedPackaging : item)
      );
      toast({
        title: "Sucesso",
        description: "Embalagem atualizada com sucesso!",
      });
      return updatedPackaging;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao atualizar embalagem: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const removePackaging = useCallback(async (id: string) => {
    try {
      const success = await deletePackaging(id);
      if (success) {
        setPackagingList(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Sucesso",
          description: "Embalagem removida com sucesso!",
        });
      }
      return success;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao remover embalagem: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const searchPackagingItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchPackagingList();
    }
    
    setIsLoading(true);
    try {
      const results = await searchPackaging(query);
      setPackagingList(results);
      return results;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro na busca: ${error.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchPackagingList]);

  return {
    packagingList,
    isLoading,
    fetchPackagingList,
    addPackaging,
    editPackaging,
    removePackaging,
    searchPackagingItems
  };
};
