import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

export const DomainSettings = () => {
  const { canManageSettings } = usePermissions();

  if (!canManageSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domínio</CardTitle>
          <CardDescription>
            Você não tem permissão para editar estas configurações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subdomínio</CardTitle>
          <CardDescription>
            Configure um subdomínio personalizado para sua agência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio</Label>
            <div className="flex gap-2">
              <Input
                id="subdomain"
                placeholder="minhaagencia"
                className="flex-1"
              />
              <span className="flex items-center text-muted-foreground">
                .aiwhatsapp.app
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu subdomínio será: minhaagencia.aiwhatsapp.app
            </p>
          </div>
          <Button>Verificar Disponibilidade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domínio Personalizado</CardTitle>
          <CardDescription>
            Use seu próprio domínio (ex: app.suaempresa.com)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Domínio</Label>
            <Input
              id="custom-domain"
              placeholder="app.suaempresa.com"
            />
          </div>
          <div className="p-4 bg-muted rounded">
            <h4 className="font-medium mb-2">Instruções de Configuração DNS:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Adicione um registro CNAME no seu provedor de DNS</li>
              <li>Nome: app (ou seu subdomínio desejado)</li>
              <li>Valor: proxy.aiwhatsapp.app</li>
              <li>Aguarde até 48h para propagação do DNS</li>
            </ol>
          </div>
          <Button>Verificar Configuração</Button>
        </CardContent>
      </Card>
    </div>
  );
};
