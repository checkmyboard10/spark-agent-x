import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlowExecutionViewerProps {
  executionId: string;
}

export const FlowExecutionViewer = ({ executionId }: FlowExecutionViewerProps) => {
  const { currentExecution, loadExecution, isLoading } = useFlowExecution();
  const [executionLog, setExecutionLog] = useState<any[]>([]);

  useEffect(() => {
    if (executionId) {
      loadExecution(executionId);
    }
  }, [executionId, loadExecution]);

  useEffect(() => {
    if (currentExecution?.execution_log) {
      setExecutionLog(Array.isArray(currentExecution.execution_log) 
        ? currentExecution.execution_log 
        : []
      );
    }
  }, [currentExecution]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Carregando execução...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentExecution) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Execução não encontrada</p>
        </CardContent>
      </Card>
    );
  }

  const getNodeTypeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'start':
        return 'bg-green-500';
      case 'end':
        return 'bg-red-500';
      case 'message':
        return 'bg-blue-500';
      case 'condition':
        return 'bg-yellow-500';
      case 'wait':
        return 'bg-purple-500';
      case 'http':
        return 'bg-orange-500';
      case 'ai':
        return 'bg-pink-500';
      case 'variable':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Detalhes da Execução</CardTitle>
            <CardDescription>
              Execução #{currentExecution.id.slice(0, 8)}
            </CardDescription>
          </div>
          <Badge variant={currentExecution.status === 'completed' ? 'default' : 'secondary'}>
            {currentExecution.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Iniciado</p>
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(currentExecution.started_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
            {currentExecution.completed_at && (
              <div>
                <p className="text-sm text-muted-foreground">Completado</p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(currentExecution.completed_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Nós Executados</p>
              <p className="text-sm font-medium">{executionLog.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-sm font-medium capitalize">{currentExecution.status}</p>
            </div>
          </div>

          <Separator />

          {/* Variables */}
          {currentExecution.variables && Object.keys(currentExecution.variables).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Variáveis</h4>
              <div className="space-y-1 bg-muted/30 rounded-lg p-3">
                {Object.entries(currentExecution.variables).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-mono">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Execution Log */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Timeline de Execução</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {executionLog.map((log, index) => (
                  <div key={index} className="relative pl-8">
                    {index < executionLog.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full ${getNodeTypeColor(log.nodeType)} flex items-center justify-center shrink-0 mt-1`}>
                        {log.error ? (
                          <XCircle className="h-3 w-3 text-white" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 bg-card border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {log.nodeType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.duration}ms
                            </span>
                          </div>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        
                        {log.input && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Input:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.input, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.output && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Output:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.output, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.error && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 font-medium">
                              ❌ Erro: {log.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
