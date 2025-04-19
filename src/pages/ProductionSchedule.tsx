
import React, { useState, useEffect } from 'react';
import { 
  fetchProductionSchedules, 
  createProductionSchedule, 
  updateProductionScheduleStatus, 
  deleteProductionSchedule,
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
  DialogTrigger 
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
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Calendar as CalendarIcon 
} from 'lucide-react';

const ProductionSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [recipes, setRecipes] = useState<{id: string, name: string}[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<ProductionSchedule>>({
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    items: []
  });

  // Fetch schedules and recipes on component mount
  useEffect(() => {
    const loadData = async () => {
      const fetchedSchedules = await fetchProductionSchedules();
      setSchedules(fetchedSchedules);

      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes.map(r => ({ id: r.id, name: r.name })));
    };
    loadData();
  }, []);

  // Add schedule item
  const addScheduleItem = () => {
    setNewSchedule(prev => ({
      ...prev,
      items: [
        ...(prev.items || []), 
        { recipe_id: recipes[0].id, quantity: 1 }
      ]
    }));
  };

  // Update schedule item
  const updateScheduleItem = (index: number, field: keyof ProductionScheduleItem, value: string | number) => {
    const newItems = [...(newSchedule.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewSchedule(prev => ({ ...prev, items: newItems }));
  };

  // Remove schedule item
  const removeScheduleItem = (index: number) => {
    const newItems = newSchedule.items?.filter((_, i) => i !== index);
    setNewSchedule(prev => ({ ...prev, items: newItems }));
  };

  // Save new schedule
  const handleSaveSchedule = async () => {
    const result = await createProductionSchedule(newSchedule as ProductionSchedule);
    if (result) {
      setSchedules(prev => [...prev, result]);
      setNewSchedule({ 
        date: new Date().toISOString().split('T')[0], 
        status: 'pending', 
        items: [] 
      });
    }
  };

  // Update schedule status
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

  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    const success = await deleteProductionSchedule(scheduleId);
    if (success) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agenda de Produção</h1>
      
      {/* New Schedule Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            <Plus className="mr-2 h-4 w-4" /> Nova Agenda de Produção
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Agenda de Produção</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block mb-2 text-sm font-medium">Data</label>
              <Input 
                type="date" 
                value={newSchedule.date}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <Select 
                value={newSchedule.status} 
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Items */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Itens da Agenda</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addScheduleItem}
              className="mb-2"
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receita</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newSchedule.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select 
                        value={item.recipe_id} 
                        onValueChange={(value) => updateScheduleItem(index, 'recipe_id', value)}
                      >
                        <SelectTrigger>
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
                      />
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
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveSchedule} 
            className="mt-4 w-full"
          >
            Salvar Agenda de Produção
          </Button>
        </DialogContent>
      </Dialog>

      {/* Schedules Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map(schedule => (
            <TableRow key={schedule.id}>
              <TableCell>{new Date(schedule.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-sm ${
                  schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {schedule.status === 'pending' ? 'Pendente' :
                   schedule.status === 'in_progress' ? 'Em Progresso' :
                   schedule.status === 'completed' ? 'Concluído' :
                   'Cancelado'}
                </span>
              </TableCell>
              <TableCell>
                {schedule.items?.map(item => (
                  <div key={item.id}>
                    {item.quantity}x {item.recipe?.name}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onSelect={() => handleUpdateStatus(
                        schedule.id!, 
                        schedule.status === 'pending' ? 'in_progress' : 'completed'
                      )}
                    >
                      {schedule.status === 'pending' ? 'Iniciar' : 'Concluir'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteSchedule(schedule.id!)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductionSchedulePage;
