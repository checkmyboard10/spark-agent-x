import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";

export const DomainSettings = () => {
  const { toast } = useToast();
  const { canManageSettings, isLoading } = usePermissions();
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [checking, setChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!canManageSettings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Apenas administradores e moderadores podem configurar domínios personalizados.
          Entre em contato com um administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCheckSubdomain = async () => {
    if (!subdomain || subdomain.length < 3) {
      toast({
        title: "Subdomínio inválido",
        description: "O subdomínio deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setChecking(true);
    try {
      // Simulated check - in production this would check the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, consider it available
      setSubdomainAvailable(true);
      toast({
        title: "Subdomínio disponível!",
        description: `${subdomain}.alicia.app está disponível.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao verificar",
        description: "Não foi possível verificar a disponibilidade.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) {
      toast({
        title: "Domínio inválido",
        description: "Por favor, insira um domínio válido.",
        variant: "destructive",
      });
      return;
    }

    setChecking(true);
    try {
      // Simulated DNS verification - in production this would check DNS records
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Verificação em andamento",
        description: "Estamos verificando a configuração DNS. Isso pode levar alguns minutos.",
      });
    } catch (error) {
      toast({
        title: "Erro ao verificar",
        description: "Não foi possível verificar a configuração DNS.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

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
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value);
                  setSubdomainAvailable(null);
                }}
              />
              <span className="flex items-center text-muted-foreground">
                .alicia.app
              </span>
            </div>
            {subdomain && (
              <p className="text-xs text-muted-foreground">
                Seu subdomínio será: <strong>{subdomain}.alicia.app</strong>
              </p>
            )}
            {subdomainAvailable !== null && (
              <Alert variant={subdomainAvailable ? "default" : "destructive"}>
                {subdomainAvailable ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>
                  {subdomainAvailable 
                    ? "Este subdomínio está disponível!" 
                    : "Este subdomínio já está em uso."}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <Button onClick={handleCheckSubdomain} disabled={checking || !subdomain}>
            {checking ? "Verificando..." : "Verificar Disponibilidade"}
          </Button>
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
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
          </div>
          <div className="p-4 bg-muted rounded">
            <h4 className="font-medium mb-2">Instruções de Configuração DNS:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Adicione um registro CNAME no seu provedor de DNS</li>
              <li>Nome: app (ou seu subdomínio desejado)</li>
              <li>Valor: proxy.alicia.app</li>
              <li>Aguarde até 48h para propagação do DNS</li>
            </ol>
          </div>
          <Button onClick={handleVerifyDomain} disabled={checking || !customDomain}>
            {checking ? "Verificando..." : "Verificar Configuração"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
