import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Power, FileText, TestTube, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface WebhookCardProps {
  webhook: any;
  onEdit: (webhook: any) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onViewLogs: (id: string) => void;
}

export default function WebhookCard({ webhook, onEdit, onDelete, onToggle, onViewLogs }: WebhookCardProps) {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('webhook-test', {
        body: { webhookId: webhook.id },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Teste bem-sucedido",
          description: `Webhook respondeu com status ${data.status}`,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: data.error || "O webhook não respondeu corretamente",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao testar webhook",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (!webhook.active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }

    if (webhook.last_status === 'success') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">Ativo</Badge>;
    }

    if (webhook.last_status === 'failed') {
      return <Badge variant="destructive">Erro</Badge>;
    }

    return <Badge>Ativo</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{webhook.name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(webhook)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(webhook.id, webhook.active)}
            >
              <Power className={webhook.active ? "h-4 w-4 text-green-500" : "h-4 w-4"} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover webhook?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O webhook será permanentemente removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(webhook.id)}>
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Events */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Eventos:</p>
          <div className="flex flex-wrap gap-1">
            {webhook.events.map((event: string) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </div>

        {/* Last triggered */}
        {webhook.last_triggered_at && (
          <div className="text-xs text-muted-foreground">
            Última execução: {new Date(webhook.last_triggered_at).toLocaleString('pt-BR')}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <TestTube className="mr-2 h-3 w-3" />
            )}
            Testar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewLogs(webhook.id)}
            className="flex-1"
          >
            <FileText className="mr-2 h-3 w-3" />
            Ver Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
