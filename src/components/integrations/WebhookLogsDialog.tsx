import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WebhookLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookId: string;
}

export default function WebhookLogsDialog({ open, onOpenChange, webhookId }: WebhookLogsDialogProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['webhook-logs', webhookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('triggered_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Execuções</DialogTitle>
          <DialogDescription>
            Últimas 50 execuções deste webhook
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.response_status && log.response_status >= 200 && log.response_status < 300 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <Badge variant="outline">{log.event_type}</Badge>
                        {log.response_status && (
                          <Badge variant={log.response_status >= 200 && log.response_status < 300 ? "default" : "destructive"}>
                            {log.response_status}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Tentativa {log.attempt_number}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.triggered_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {/* Payload */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Payload:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Response */}
                    {log.response_body && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Resposta:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-[100px]">
                          {log.response_body}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {log.error_message && (
                      <div>
                        <p className="text-xs font-medium text-destructive mb-1">Erro:</p>
                        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                          {log.error_message}
                        </p>
                      </div>
                    )}

                    {/* Duration */}
                    {log.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Duração: {Math.round((new Date(log.completed_at).getTime() - new Date(log.triggered_at).getTime()) / 1000)}s
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma execução registrada ainda
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
