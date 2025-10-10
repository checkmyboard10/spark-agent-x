import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Pause, XCircle, Clock, Eye } from 'lucide-react';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlowExecutionsListProps {
  flowId: string;
  onViewExecution?: (executionId: string) => void;
}

export const FlowExecutionsList = ({ flowId, onViewExecution }: FlowExecutionsListProps) => {
  const { executions, isLoading, loadExecutions } = useFlowExecution(flowId);

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'paused':
        return 'Pausado';
      case 'failed':
        return 'Falhou';
      case 'running':
        return 'Executando';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Carregando execuções...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Execuções</CardTitle>
        <CardDescription>
          Últimas 50 execuções deste flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhuma execução ainda. Teste o flow para ver o histórico!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(execution.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getStatusVariant(execution.status)} className="gap-1">
                          {getStatusLabel(execution.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(execution.started_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        Execução #{execution.id.slice(0, 8)}
                      </p>
                      {execution.current_node_id && (
                        <p className="text-xs text-muted-foreground">
                          Nó atual: {execution.current_node_id}
                        </p>
                      )}
                      {execution.error_message && (
                        <p className="text-xs text-red-600 mt-1">
                          Erro: {execution.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewExecution?.(execution.id)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
