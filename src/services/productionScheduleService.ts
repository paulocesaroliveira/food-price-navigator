
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProductionSchedule {
  id?: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  items?: ProductionScheduleItem[];
}

export interface ProductionScheduleItem {
  id?: string;
  schedule_id?: string;
  recipe_id: string;
  quantity: number;
  notes?: string;
  recipe?: {
    name: string;
  };
}

// Create a new production schedule
export const createProductionSchedule = async (schedule: ProductionSchedule): Promise<ProductionSchedule | null> => {
  try {
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('production_schedules')
      .insert({
        date: schedule.date,
        status: schedule.status,
        notes: schedule.notes
      })
      .select()
      .single();

    if (scheduleError) {
      console.error('Error creating production schedule:', scheduleError);
      toast({
        title: 'Erro',
        description: `Não foi possível criar a agenda de produção: ${scheduleError.message}`,
        variant: 'destructive'
      });
      return null;
    }

    // If there are items, insert them
    if (schedule.items && schedule.items.length > 0) {
      const scheduleItems = schedule.items.map(item => ({
        schedule_id: scheduleData.id,
        recipe_id: item.recipe_id,
        quantity: item.quantity,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('production_schedule_items')
        .insert(scheduleItems);

      if (itemsError) {
        console.error('Error creating production schedule items:', itemsError);
        toast({
          title: 'Erro',
          description: `Não foi possível adicionar itens à agenda de produção: ${itemsError.message}`,
          variant: 'destructive'
        });
        return null;
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Agenda de produção criada com sucesso!'
    });

    return scheduleData;
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast({
      title: 'Erro',
      description: `Erro inesperado: ${error.message}`,
      variant: 'destructive'
    });
    return null;
  }
};

// Fetch production schedules
export const fetchProductionSchedules = async (): Promise<ProductionSchedule[]> => {
  try {
    const { data: schedules, error } = await supabase
      .from('production_schedules')
      .select(`
        *,
        items:production_schedule_items(
          *,
          recipe:recipe_id(name)
        )
      `)
      .order('date');

    if (error) {
      console.error('Error fetching production schedules:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível carregar as agendas de produção: ${error.message}`,
        variant: 'destructive'
      });
      return [];
    }

    return schedules || [];
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast({
      title: 'Erro',
      description: `Erro inesperado: ${error.message}`,
      variant: 'destructive'
    });
    return [];
  }
};

// Update production schedule status
export const updateProductionScheduleStatus = async (
  scheduleId: string, 
  newStatus: ProductionSchedule['status']
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('production_schedules')
      .update({ status: newStatus })
      .eq('id', scheduleId);

    if (error) {
      console.error('Error updating production schedule status:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar o status da agenda: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Status da agenda de produção atualizado!'
    });
    return true;
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast({
      title: 'Erro',
      description: `Erro inesperado: ${error.message}`,
      variant: 'destructive'
    });
    return false;
  }
};

// Delete a production schedule
export const deleteProductionSchedule = async (scheduleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('production_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('Error deleting production schedule:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível excluir a agenda de produção: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Agenda de produção excluída!'
    });
    return true;
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast({
      title: 'Erro',
      description: `Erro inesperado: ${error.message}`,
      variant: 'destructive'
    });
    return false;
  }
};
