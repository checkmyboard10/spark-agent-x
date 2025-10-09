import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Bell, Mail, Webhook, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";

export const NotificationsSettings = () => {
  const { canManageSettings, isLoading } = usePermissions();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookNotifications, setWebhookNotifications] = useState(false);
  const [campaignAlerts, setCampaignAlerts] = useState(true);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!canManageSettings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para gerenciar notificações.
          Entre em contato com um administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificações por Email
          </CardTitle>
          <CardDescription>
            Configure quando você deseja receber emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificações Gerais</Label>
              <p className="text-sm text-muted-foreground">
                Receba updates sobre atividades do sistema
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="campaign-alerts">Alertas de Campanha</Label>
              <p className="text-sm text-muted-foreground">
                Notificações sobre status de campanhas
              </p>
            </div>
            <Switch
              id="campaign-alerts"
              checked={campaignAlerts}
              onCheckedChange={setCampaignAlerts}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Envie notificações para sistemas externos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-notifications">Notificações via Webhook</Label>
              <p className="text-sm text-muted-foreground">
                Envie eventos para sua URL de webhook
              </p>
            </div>
            <Switch
              id="webhook-notifications"
              checked={webhookNotifications}
              onCheckedChange={setWebhookNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Notificações em tempo real (em breve)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de push notifications estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
