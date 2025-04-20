
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProductionSchedule {
  id?: string;
  date: string;
  start_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  items?: ProductionScheduleItem[];
  estimated_cost?: number;
  estimated_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionScheduleItem {
  id?: string;
  schedule_id?: string;
  recipe_id: string;
  quantity: number;
  notes?: string;
  recipe?: {
    name: string;
    total_cost?: number;
    estimated_time?: string;
    baseIngredients?: Array<{
      ingredients: {
        id: string;
        name: string;
        unit: string;
      };
      quantity: number;
    }>;
    portionIngredients?: Array<{
      ingredients: {
        id: string;
        name: string;
        unit: string;
      };
      quantity: number;
    }>;
  };
}

// Create a new production schedule
export const createProductionSchedule = async (schedule: ProductionSchedule): Promise<ProductionSchedule | null> => {
  try {
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('production_schedules')
      .insert({
        date: schedule.date,
        start_time: schedule.start_time,
        status: schedule.status,
        notes: schedule.notes,
        estimated_cost: schedule.estimated_cost,
        estimated_time: schedule.estimated_time
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

    return {
      id: scheduleData.id,
      date: scheduleData.date,
      start_time: scheduleData.start_time,
      status: scheduleData.status as ProductionSchedule['status'],
      notes: scheduleData.notes,
      estimated_cost: scheduleData.estimated_cost,
      estimated_time: scheduleData.estimated_time
    };
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
          recipe:recipe_id(name, total_cost, portions)
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

    const typedSchedules = schedules.map(schedule => ({
      ...schedule,
      status: schedule.status as ProductionSchedule['status'],
      start_time: schedule.start_time || undefined,
      estimated_cost: schedule.estimated_cost || undefined,
      estimated_time: schedule.estimated_time || undefined
    }));

    return typedSchedules || [];
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

// Duplicate a production schedule
export const duplicateProductionSchedule = async (scheduleId: string, newDate: string): Promise<boolean> => {
  try {
    // First, get the schedule to duplicate
    const { data: schedule, error: fetchError } = await supabase
      .from('production_schedules')
      .select(`
        *,
        items:production_schedule_items(*)
      `)
      .eq('id', scheduleId)
      .single();

    if (fetchError) {
      console.error('Error fetching production schedule to duplicate:', fetchError);
      toast({
        title: 'Erro',
        description: `Não foi possível duplicar a agenda: ${fetchError.message}`,
        variant: 'destructive'
      });
      return false;
    }

    // Create new schedule with the same data but new date
    const { data: newSchedule, error: createError } = await supabase
      .from('production_schedules')
      .insert({
        date: newDate,
        start_time: schedule.start_time,
        status: 'pending',
        notes: `${schedule.notes || ''} (Duplicado)`,
        estimated_cost: schedule.estimated_cost,
        estimated_time: schedule.estimated_time
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating duplicated schedule:', createError);
      toast({
        title: 'Erro',
        description: `Não foi possível criar a agenda duplicada: ${createError.message}`,
        variant: 'destructive'
      });
      return false;
    }

    // Duplicate all items
    if (schedule.items && schedule.items.length > 0) {
      const newItems = schedule.items.map(item => ({
        schedule_id: newSchedule.id,
        recipe_id: item.recipe_id,
        quantity: item.quantity,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('production_schedule_items')
        .insert(newItems);

      if (itemsError) {
        console.error('Error duplicating items:', itemsError);
        toast({
          title: 'Erro',
          description: `Não foi possível duplicar os itens da agenda: ${itemsError.message}`,
          variant: 'destructive'
        });
        await supabase.from('production_schedules').delete().eq('id', newSchedule.id);
        return false;
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Agenda de produção duplicada com sucesso!'
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

// Get production schedule details with ingredients
export const getProductionScheduleDetails = async (scheduleId: string): Promise<any> => {
  try {
    // Get the schedule with items
    const { data: schedule, error: scheduleError } = await supabase
      .from('production_schedules')
      .select(`
        *,
        items:production_schedule_items(
          *,
          recipe:recipe_id(
            *,
            baseIngredients:recipe_base_ingredients(
              *,
              ingredients:ingredient_id(*)
            ),
            portionIngredients:recipe_portion_ingredients(
              *,
              ingredients:ingredient_id(*)
            )
          )
        )
      `)
      .eq('id', scheduleId)
      .single();

    if (scheduleError) {
      console.error('Error fetching production schedule details:', scheduleError);
      toast({
        title: 'Erro',
        description: `Não foi possível carregar os detalhes da agenda: ${scheduleError.message}`,
        variant: 'destructive'
      });
      return null;
    }

    return schedule;
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

// Add new function to calculate total ingredients needed
export const calculateTotalIngredients = (items: ProductionScheduleItem[]) => {
  const totalIngredients: Record<string, { 
    name: string, 
    quantity: number, 
    unit: string 
  }> = {};

  items?.forEach(item => {
    // Calculate base ingredients
    item.recipe?.baseIngredients?.forEach(baseIng => {
      const ingredient = baseIng.ingredients;
      const key = ingredient.id;
      
      if (!totalIngredients[key]) {
        totalIngredients[key] = {
          name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit
        };
      }
      
      totalIngredients[key].quantity += baseIng.quantity * item.quantity;
    });

    // Calculate portion ingredients
    item.recipe?.portionIngredients?.forEach(portionIng => {
      const ingredient = portionIng.ingredients;
      const key = ingredient.id;
      
      if (!totalIngredients[key]) {
        totalIngredients[key] = {
          name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit
        };
      }
      
      totalIngredients[key].quantity += portionIng.quantity * item.quantity;
    });
  });

  return Object.values(totalIngredients);
};
