import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  fetchProductionSchedules, 
  createProductionSchedule, 
  updateProductionScheduleStatus, 
  deleteProductionSchedule,
  duplicateProductionSchedule,
  getProductionScheduleDetails,
  calculateTotalIngredients,
  ProductionSchedule,
  ProductionScheduleItem
} from '@/services/productionScheduleService';
import { fetchRecipes } from '@/services/recipeService';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarIcon,
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Copy,
  Clock,
  Check,
  FileText,
  Filter,
  Download,
  Bell
} from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { DayContentProps } from 'react-day-picker';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';

const statusLabels = {
  'pending': 'Agendada',
  'in_progress': 'Em produção',
  'completed': 'Concluída',
  'cancelled': 'Cancelada'
};

const statusColors = {
  'pending': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const ProductionSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [recipes, setRecipes] = useState<{id: string, name: string, total_cost: number}[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<ProductionSchedule>>({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    status: 'pending',
    notes: '',
    items: []
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
  const [selectedSchedule, setSelectedSchedule] = useState<ProductionSchedule | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState<any>(null);
  const [duplicateDate, setDuplicateDate] = useState<Date>(new Date());
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [scheduleToDuplicate, setScheduleToDuplicate] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null
  });
  const [filterRecipe, setFilterRecipe] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      const fetchedSchedules = await fetchProductionSchedules();
      setSchedules(fetchedSchedules);

      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes.map(r => ({ 
        id: r.id, 
        name: r.name, 
        total_cost: r.total_cost || 0 
      })));
    };
    loadData();
  }, []);

  useEffect(() => {
    if (newSchedule.items && newSchedule.items.length > 0) {
      let totalCost = 0;
      
      newSchedule.items.forEach(item => {
        const recipe = recipes.find(r => r.id === item.recipe_id);
        if (recipe) {
          totalCost += (recipe.total_cost || 0) * item.quantity;
        }
      });
      
      setNewSchedule(prev => ({
        ...prev,
        estimated_cost: totalCost
      }));
    }
  }, [newSchedule.items, recipes]);

  const addScheduleItem = () => {
    if (recipes.length === 0) return;
    
    setNewSchedule(prev => ({
      ...prev,
      items: [
        ...(prev.items || []), 
        { recipe_id: recipes[0].id, quantity: 1, notes: '' }
      ]
    }));
  };

  const updateScheduleItem = (index: number, field: keyof ProductionScheduleItem, value: string | number) => {
    const newItems = [...(newSchedule.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewSchedule(prev => ({ ...prev, items: newItems }));
  };

  const removeScheduleItem = (index: number) => {
    const newItems = newSchedule.items?.filter((_, i) => i !== index);
    setNewSchedule(prev => ({ ...prev, items: newItems }));
  };

  const resetForm = () => {
    setNewSchedule({
      date: new Date().toISOString().split('T')[0],
      start_time: '',
      status: 'pending',
      notes: '',
      items: []
    });
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule.date || !newSchedule.items || newSchedule.items.length === 0) {
      toast.error("Data e pelo menos uma receita são obrigatórios");
      return;
    }

    const result = await createProductionSchedule(newSchedule as ProductionSchedule);
    if (result) {
      setSchedules(prev => [...prev, result]);
      resetForm();
    }
  };

  const handleUpdateStatus = async (scheduleId: string, newStatus: ProductionSchedule['status']) => {
    const success = await updateProductionScheduleStatus(scheduleId, newStatus);
    if (success) {
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId ? { ...schedule, status: newStatus } : schedule
        )
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const success = await deleteProductionSchedule(scheduleId);
    if (success) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    }
  };

  const handleShowDuplicateDialog = (scheduleId: string) => {
    setScheduleToDuplicate(scheduleId);
    setShowDuplicateDialog(true);
  };

  const handleDuplicateSchedule = async () => {
    if (!scheduleToDuplicate || !duplicateDate) return;
    
    const formattedDate = duplicateDate.toISOString().split('T')[0];
    const success = await duplicateProductionSchedule(scheduleToDuplicate, formattedDate);
    
    if (success) {
      const fetchedSchedules = await fetchProductionSchedules();
      setSchedules(fetchedSchedules);
      setShowDuplicateDialog(false);
    }
  };

  const handleShowDetails = async (scheduleId: string) => {
    const details = await getProductionScheduleDetails(scheduleId);
    if (details) {
      setScheduleDetails(details);
      setShowDetailsDialog(true);
    }
  };

  const getSchedulesForDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === formattedDate);
  };

  const renderCalendarDay = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    
    if (daySchedules.length === 0) return null;
    
    return (
      <div className="absolute bottom-0 left-0 w-full">
        <div className="flex justify-center mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs ml-1">{daySchedules.length}</span>
        </div>
      </div>
    );
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filterStatus !== 'all' && schedule.status !== filterStatus) return false;
    
    if (filterDate.start && new Date(schedule.date) < filterDate.start) return false;
    if (filterDate.end && new Date(schedule.date) > filterDate.end) return false;
    
    if (filterRecipe !== 'all') {
      return schedule.items?.some(item => item.recipe_id === filterRecipe);
    }
    
    return true;
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast.info("Exportação para PDF em desenvolvimento");
  };

  const handleSetReminder = () => {
    // TODO: Implement reminders
    toast.info("Sistema de lembretes em desenvolvimento");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agenda de Produção</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" /> Nova Produção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Agenda de Produção</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Data</label>
                <Input 
                  type="date" 
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Horário (opcional)</label>
                <Input 
                  type="time" 
                  value={newSchedule.start_time || ''}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">Status</label>
              <Select 
                value={newSchedule.status} 
                onValueChange={(value: ProductionSchedule['status']) => 
                  setNewSchedule(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Agendada</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">Observações</label>
              <Textarea
                value={newSchedule.notes || ''}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a produção"
                className="min-h-[100px]"
              />
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Itens da Agenda</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addScheduleItem}
                  disabled={recipes.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </div>

              {recipes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma receita cadastrada. Adicione receitas para agendar produções.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receita</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newSchedule.items?.map((item, index) => {
                      const recipe = recipes.find(r => r.id === item.recipe_id);
                      const itemCost = recipe ? (recipe.total_cost || 0) * item.quantity : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Select 
                              value={item.recipe_id} 
                              onValueChange={(value) => updateScheduleItem(index, 'recipe_id', value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione uma receita" />
                              </SelectTrigger>
                              <SelectContent>
                                {recipes.map(recipe => (
                                  <SelectItem key={recipe.id} value={recipe.id}>
                                    {recipe.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min={1}
                              value={item.quantity} 
                              onChange={(e) => updateScheduleItem(index, 'quantity', Number(e.target.value))}
                              className="w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="text"
                              value={item.notes || ''} 
                              onChange={(e) => updateScheduleItem(index, 'notes', e.target.value)}
                              placeholder="Notas sobre o item"
                            />
                          </TableCell>
                          <TableCell>
                            R$ {itemCost.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => removeScheduleItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(newSchedule.items?.length || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Custo Total Estimado:
                        </TableCell>
                        <TableCell colSpan={2} className="font-semibold">
                          R$ {(newSchedule.estimated_cost || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button 
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSchedule} 
                disabled={!newSchedule.date || !newSchedule.items || newSchedule.items.length === 0}
              >
                Salvar Agenda de Produção
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Agendada</SelectItem>
            <SelectItem value="in_progress">Em produção</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRecipe} onValueChange={setFilterRecipe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por receita" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as receitas</SelectItem>
            {recipes.map(recipe => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleSetReminder}>
            <Bell className="mr-2 h-4 w-4" />
            Lembretes
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" onClick={() => setCurrentView('list')}>
            <FileText className="h-4 w-4 mr-2" />
            Produções Agendadas
          </TabsTrigger>
          <TabsTrigger value="calendar" onClick={() => setCurrentView('calendar')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Receitas</TableHead>
                  <TableHead>Custo Estimado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma produção agendada. Crie uma nova produção utilizando o botão acima.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map(schedule => (
                    <TableRow key={schedule.id} className={schedule.status === 'completed' ? 'bg-green-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={schedule.status === 'completed'}
                          onCheckedChange={() => {
                            if (schedule.status !== 'completed') {
                              handleUpdateStatus(schedule.id!, 'completed');
                            } else {
                              handleUpdateStatus(schedule.id!, 'pending');
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(schedule.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{schedule.start_time || '-'}</TableCell>
                      <TableCell>
                        <div className="max-h-20 overflow-y-auto">
                          {schedule.items?.map(item => (
                            <div key={item.id} className="text-sm py-0.5">
                              {item.quantity}x {item.recipe?.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        R$ {(schedule.estimated_cost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${
                          statusColors[schedule.status]
                        }`}>
                          {statusLabels[schedule.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleShowDetails(schedule.id!)}>
                              <FileText className="mr-2 h-4 w-4" /> Detalhes
                            </DropdownMenuItem>
                            
                            {schedule.status === 'pending' && (
                              <DropdownMenuItem 
                                onSelect={() => handleUpdateStatus(schedule.id!, 'in_progress')}
                              >
                                <Clock className="mr-2 h-4 w-4" /> Iniciar Produção
                              </DropdownMenuItem>
                            )}
                            
                            {schedule.status === 'in_progress' && (
                              <DropdownMenuItem 
                                onSelect={() => handleUpdateStatus(schedule.id!, 'completed')}
                              >
                                <Check className="mr-2 h-4 w-4" /> Marcar como Concluída
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onSelect={() => handleShowDuplicateDialog(schedule.id!)}
                            >
                              <Copy className="mr-2 h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            
                            {schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
                              <DropdownMenuItem 
                                onSelect={() => handleUpdateStatus(schedule.id!, 'cancelled')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onSelect={() => handleDeleteSchedule(schedule.id!)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="bg-white rounded-lg shadow p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => {
                if (date) {
                  setSelectedDate(date);
                  // You could open a dialog to add a schedule for this date
                }
              }}
              className="rounded-md border"
              components={{
                DayContent: (props: DayContentProps) => {
                  const date = props.date;
                  const daySchedules = getSchedulesForDate(date);
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {props.date.getDate()}
                      {daySchedules.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                          <div className={`w-2 h-2 rounded-full ${
                            daySchedules.some(s => s.status === 'completed') ? 'bg-green-500' :
                            daySchedules.some(s => s.status === 'in_progress') ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}/>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Produções em {format(selectedDate, 'dd/MM/yyyy')}
              </h3>
              
              {getSchedulesForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma produção agendada para esta data.
                </p>
              ) : (
                <div className="space-y-2">
                  {getSchedulesForDate(selectedDate).map(schedule => (
                    <Card key={schedule.id} className="p-4">
                      <CardHeader className="p-0 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-md">
                              {schedule.start_time ? `Produção às ${schedule.start_time}` : 'Produção'}
                            </CardTitle>
                            <CardDescription>
                              {statusLabels[schedule.status]}
                            </CardDescription>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${statusColors[schedule.status]}`}>
                            {statusLabels[schedule.status]}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 py-2">
                        <div className="space-y-1">
                          {schedule.items?.map(item => (
                            <div key={item.id} className="text-sm">
                              {item.quantity}x {item.recipe?.name}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-0 pt-2 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleShowDetails(schedule.id!)}>
                          Detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Agenda de Produção</DialogTitle>
            <DialogDescription>
              Escolha a data para a nova agenda de produção.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block mb-2 text-sm font-medium">Nova Data</label>
            <Input 
              type="date" 
              value={duplicateDate.toISOString().split('T')[0]}
              onChange={(e) => setDuplicateDate(new Date(e.target.value))}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicateSchedule}>
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Detalhes da Produção</Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] md:w-[700px]">
          <SheetHeader>
            <SheetTitle>Detalhes da Produção</SheetTitle>
            <SheetDescription>
              Visualize todos os detalhes desta produção
            </SheetDescription>
          </SheetHeader>
          {scheduleDetails && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-1">Data</h3>
                  <p>{format(new Date(scheduleDetails.date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Horário</h3>
                  <p>{scheduleDetails.start_time || '-'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Status</h3>
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[scheduleDetails.status]}`}>
                    {statusLabels[scheduleDetails.status]}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Custo Total</h3>
                  <p>R$ {(scheduleDetails.estimated_cost || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Receitas</h3>
                <div className="space-y-2">
                  {scheduleDetails.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.recipe.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Ingredientes Necessários</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrediente</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Unidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculateTotalIngredients(scheduleDetails.items).map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{ingredient.quantity.toFixed(2)}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {scheduleDetails.notes && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Observações</h3>
                  <p className="text-sm text-gray-600">{scheduleDetails.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                {scheduleDetails.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus(scheduleDetails.id, 'in_progress')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Iniciar Produção
                  </Button>
                )}
                
                {scheduleDetails.status === 'in_progress' && (
                  <Button onClick={() => handleUpdateStatus(scheduleDetails.id, 'completed')}>
                    <Check className="mr-2 h-4 w-4" />
                    Concluir Produção
                  </Button>
                )}

                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProductionSchedulePage;
