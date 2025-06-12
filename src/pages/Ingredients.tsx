
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Utensils } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingredientes"
        subtitle="Gerencie seus ingredientes e custos de forma inteligente"
        icon={Utensils}
        gradient="from-orange-500 to-red-600"
        actions={
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Novo Ingrediente
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingredientes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-focus"
        />
      </div>

      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Lista de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Nenhum ingrediente cadastrado ainda.</p>
            <Button className="mt-4 btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Ingrediente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ingredients;
