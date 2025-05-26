
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  ChefHat, 
  Trash2,
  CheckCircle2,
  Circle,
  Edit3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchRecipes } from '@/services/recipeService';
import { 
  fetchProductionSchedules, 
  createProductionSchedule, 
  updateProductionScheduleStatus,
  deleteProductionSchedule,
  ProductionSchedule 
} from '@/services/productionScheduleService';

interface Recipe {
  id: string;
  name: string;
  total_cost: number;
  portions: number;
}

interface ScheduleItem {
  recipe_id: string;
  quantity: number;
  notes?: string;
}

const ProductionSchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, recipesData] = await Promise.all([
        fetchProductionSchedules(),
        fetchRecipes()
      ]);
      
      setSchedules(schedulesData);
      setRecipes(recipesData.map(r => ({
        id: r.id,
        name: r.name,
        total_cost: r.total_cost || 0,
        portions: r.portions || 1
      })));
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (recipes.length === 0) return;
    setItems([...items, { recipe_id: recipes[0].id, quantity: 1 }]);
  };

  const handleUpdateItem = (index: number, field: keyof ScheduleItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => {
      const recipe = recipes.find(r => r.id === item.recipe_id);
      return total + (recipe ? recipe.total_cost * item.quantity : 0);
    }, 0);
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma receita à agenda.',
        variant: 'destructive'
      });
      return;
    }

    const scheduleData: Omit<ProductionSchedule, 'id'> = {
      date: format(scheduleDate, 'yyyy-MM-dd'),
      start_time: startTime || undefined,
      status: 'pending',
      notes,
      items,
      estimated_cost: calculateTotalCost()
    };

    const result = await createProductionSchedule(scheduleData as ProductionSchedule);
    if (result) {
      await loadData();
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Agenda de produção criada com sucesso!'
      });
    }
  };

  const resetForm = () => {
    setScheduleDate(new Date());
    setStartTime('');
    setNotes('');
    setItems([]);
  };

  const handleStatusChange = async (scheduleId: string, newStatus: ProductionSchedule['status']) => {
    const success = await updateProductionScheduleStatus(scheduleId, newStatus);
    if (success) {
      await loadData();
    }
  };

  const handleDelete = async (scheduleId: string) => {
    const success = await deleteProductionSchedule(scheduleId);
    if (success) {
      await loadData();
    }
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const getStatusColor = (status: ProductionSchedule['status']) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ProductionSchedule['status']) => {
    switch (status) {
      case 'pending': return 'Agendada';
      case 'in_progress': return 'Em Produção';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Produção</h1>
          <p className="text-gray-600 mt-2">Organize seu cronograma mensal de produção</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Produção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agendar Nova Produção</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data da Produção</label>
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={(date) => date && setScheduleDate(date)}
                    className="rounded-md border"
                    locale={pt}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Horário (opcional)</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Observações</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações sobre a produção..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Receitas */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Receitas para Produzir</h3>
                  <Button
                    variant="outline"
                    onClick={handleAddItem}
                    disabled={recipes.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Receita
                  </Button>
                </div>

                {recipes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma receita cadastrada. Cadastre receitas para criar agendas de produção.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const recipe = recipes.find(r => r.id === item.recipe_id);
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="flex-1">
                            <Select
                              value={item.recipe_id}
                              onValueChange={(value) => handleUpdateItem(index, 'recipe_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma receita" />
                              </SelectTrigger>
                              <SelectContent>
                                {recipes.map(recipe => (
                                  <SelectItem key={recipe.id} value={recipe.id}>
                                    {recipe.name} - R$ {recipe.total_cost.toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-20">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              placeholder="Qtd"
                            />
                          </div>
                          <div className="text-sm font-medium">
                            R$ {recipe ? (recipe.total_cost * item.quantity).toFixed(2) : '0,00'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {items.length > 0 && (
                      <div className="text-right text-lg font-semibold">
                        Total Estimado: R$ {calculateTotalCost().toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={items.length === 0}>
                  Salvar Agenda
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendário */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendário de Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
                locale={pt}
                components={{
                  DayContent: ({ date }) => {
                    const daySchedules = getSchedulesForDate(date);
                    const hasSchedules = daySchedules.length > 0;
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {hasSchedules && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Agenda do Dia */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agenda para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
              </CardTitle>
              <CardDescription>
                {getSchedulesForDate(selectedDate).length} produção(ões) agendada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {getSchedulesForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma produção agendada para este dia.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setScheduleDate(selectedDate);
                        setIsDialogOpen(true);
                      }}
                    >
                      Agendar Produção
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getSchedulesForDate(selectedDate).map((schedule) => (
                      <Card key={schedule.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">
                                {schedule.start_time ? `Produção às ${schedule.start_time}` : 'Produção'}
                              </h3>
                              <Badge className={getStatusColor(schedule.status)}>
                                {getStatusLabel(schedule.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {schedule.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(schedule.id!, 'in_progress')}
                              >
                                Iniciar
                              </Button>
                            )}
                            {schedule.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(schedule.id!, 'completed')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Concluir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(schedule.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <strong>Receitas:</strong>
                          </div>
                          {schedule.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.recipe?.name}</span>
                            </div>
                          ))}
                          {schedule.estimated_cost && (
                            <div className="text-sm font-medium text-right">
                              Custo estimado: R$ {schedule.estimated_cost.toFixed(2)}
                            </div>
                          )}
                          {schedule.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <strong>Observações:</strong> {schedule.notes}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductionSchedulePage;
