import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Users, Globe, Bell, CreditCard, Key, MessageSquare } from "lucide-react";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { DomainSettings } from "@/components/settings/DomainSettings";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { APISettings } from "@/components/settings/APISettings";
import QuickRepliesSettings from "@/components/settings/QuickRepliesSettings";

export default function Settings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações da sua agência
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domínio
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cobrança
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="quick-replies" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Respostas Rápidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamSettings />
        </TabsContent>

        <TabsContent value="domain" className="mt-6">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <APISettings />
        </TabsContent>

        <TabsContent value="quick-replies" className="mt-6">
          <QuickRepliesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
