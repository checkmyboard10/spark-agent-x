import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsAppIntegration from "@/components/integrations/WhatsAppIntegration";
import GoogleCalendarIntegration from "@/components/integrations/GoogleCalendarIntegration";
import WebhooksIntegration from "@/components/integrations/WebhooksIntegration";
import { MessageCircle, Calendar, Webhook } from "lucide-react";

export default function Integrations() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Conecte seus serviços favoritos e automatize seu workflow
        </p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Google Calendar
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppIntegration />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <GoogleCalendarIntegration />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhooksIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
