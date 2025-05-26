
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RelatoriosHeader from "@/components/relatorios/RelatoriosHeader";
import VendasTab from "@/components/relatorios/VendasTab";
import ProdutosTab from "@/components/relatorios/ProdutosTab";
import ClientesTab from "@/components/relatorios/ClientesTab";
import FinanceiroTab from "@/components/relatorios/FinanceiroTab";
import OperacionalTab from "@/components/relatorios/OperacionalTab";

const Relatorios = () => {
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="space-y-6 p-6">
      <RelatoriosHeader
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={setDateRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          <VendasTab />
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <ProdutosTab />
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <ClientesTab />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6">
          <FinanceiroTab />
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <OperacionalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
