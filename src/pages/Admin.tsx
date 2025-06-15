
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, FileText, BarChart3, MessageSquare } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import NoticesList from "@/components/admin/NoticesList";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SupportTicketsTab from "@/components/admin/SupportTicketsTab";
import FeedbackTab from "@/components/admin/FeedbackTab";

const Admin = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Painel Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="notices" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Avisos
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Suporte
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="notices" className="mt-6">
              <NoticesList />
            </TabsContent>
            
            <TabsContent value="support" className="mt-6">
              <SupportTicketsTab />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-6">
              <FeedbackTab />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
