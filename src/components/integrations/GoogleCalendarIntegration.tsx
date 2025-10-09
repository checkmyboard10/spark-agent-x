import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle } from "lucide-react";

export default function GoogleCalendarIntegration() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>
            Conecte sua conta do Google para criar eventos automaticamente quando agentes agendarem compromissos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-6 border rounded-lg">
            <div className="flex items-center gap-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Status da Integração</p>
                  <Badge variant="secondary">Não Conectado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Conecte sua conta Google para habilitar o agendamento automático
                </p>
              </div>
            </div>

            <Button disabled>
              Conectar Google Calendar
            </Button>
          </div>

          {/* Configuration Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para habilitar esta integração, você precisa configurar as credenciais OAuth do Google Calendar.
              Entre em contato com o administrador para configurar o GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.
            </AlertDescription>
          </Alert>

          {/* Features Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Recursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Criação automática de eventos quando agentes agendam compromissos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Sincronização bidirecional com seu calendário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Notificações automáticas para participantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Configuração de fuso horário e lembretes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
