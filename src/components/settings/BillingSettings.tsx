import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Calendar, ExternalLink } from "lucide-react";

export const BillingSettings = () => {
  const { canManageSettings } = usePermissions();

  if (!canManageSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento</CardTitle>
          <CardDescription>
            Você não tem permissão para visualizar estas informações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Plano Gratuito</h3>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Até 100 mensagens/mês incluídas
              </p>
            </div>
            <Button>
              Fazer Upgrade
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Uso este mês</span>
              </div>
              <p className="text-2xl font-bold">43/100</p>
              <p className="text-xs text-muted-foreground mt-1">mensagens enviadas</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Renova em</span>
              </div>
              <p className="text-2xl font-bold">15 dias</p>
              <p className="text-xs text-muted-foreground mt-1">próxima renovação</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Suas faturas e transações recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma transação ainda</p>
            <p className="text-sm mt-2">Histórico de pagamentos aparecerá aqui</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
          <CardDescription>
            Configure sua forma de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Adicionar Cartão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
