import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key, RefreshCw, ExternalLink, Code, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";

export const APISettings = () => {
  const { toast } = useToast();
  const { canManageSettings, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!canManageSettings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Apenas administradores e moderadores podem gerenciar configurações de API.
          Entre em contato com um administrador.
        </AlertDescription>
      </Alert>
    );
  }
  const [apiKey] = useState("sk_test_***************************");

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key copiada!",
      description: "A chave foi copiada para a área de transferência.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chaves de API
          </CardTitle>
          <CardDescription>
            Gerencie suas chaves de acesso à API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">Chave de Produção</Label>
              <Badge variant="outline">Ativa</Badge>
            </div>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="icon" onClick={handleCopyKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar Chave
            </Button>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Criar Nova Chave
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Documentação da API
          </CardTitle>
          <CardDescription>
            Endpoints disponíveis e exemplos de uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              Base URL
            </h4>
            <code className="text-sm bg-background px-2 py-1 rounded block">
              https://api.alicia.app/v1
            </code>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Endpoints Principais:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <code className="text-sm">POST /messages/send</code>
                  <p className="text-xs text-muted-foreground mt-1">Enviar mensagem WhatsApp</p>
                </div>
                <Badge variant="secondary">v1</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <code className="text-sm">GET /conversations</code>
                  <p className="text-xs text-muted-foreground mt-1">Listar conversas</p>
                </div>
                <Badge variant="secondary">v1</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <code className="text-sm">POST /campaigns/create</code>
                  <p className="text-xs text-muted-foreground mt-1">Criar campanha</p>
                </div>
                <Badge variant="secondary">v1</Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Documentação Completa
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>
            Limites de requisições por minuto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Plano Atual</p>
              <p className="text-2xl font-bold">100 req/min</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Uso Atual</p>
              <p className="text-2xl font-bold text-primary">23 req/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
