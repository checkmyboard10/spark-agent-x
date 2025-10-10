import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, SkipForward, Loader2 } from 'lucide-react';
import { useFlowExecution } from '@/hooks/useFlowExecution';

interface FlowTestPanelProps {
  flowId: string;
}

export const FlowTestPanel = ({ flowId }: FlowTestPanelProps) => {
  const [testVariables, setTestVariables] = useState({
    'contact.name': 'João Silva',
    'contact.phone': '5511999999999',
  });
  const [initialMessage, setInitialMessage] = useState('Olá, preciso de ajuda');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLog, setConsoleLog] = useState<Array<{ type: string; message: string; time: string }>>([]);

  const { executeFlow, currentExecution, isLoading } = useFlowExecution(flowId);

  const handleStart = async () => {
    setIsRunning(true);
    setConsoleLog([{
      type: 'info',
      message: 'Iniciando teste do flow...',
      time: new Date().toLocaleTimeString()
    }]);

    // Criar conversa de teste
    const testConversationId = `test-${Date.now()}`;
    
    await executeFlow(testConversationId, testVariables);
    
    setConsoleLog(prev => [...prev, {
      type: 'success',
      message: 'Flow iniciado com sucesso',
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handlePause = () => {
    setIsRunning(false);
    setConsoleLog(prev => [...prev, {
      type: 'warn',
      message: 'Execução pausada',
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handleStop = () => {
    setIsRunning(false);
    setConsoleLog(prev => [...prev, {
      type: 'error',
      message: 'Execução interrompida',
      time: new Date().toLocaleTimeString()
    }]);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Testar Flow
        </CardTitle>
        <CardDescription>
          Execute o flow manualmente para testar seu comportamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label>Variáveis de Teste</Label>
            <div className="space-y-2 mt-2">
              {Object.entries(testVariables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground min-w-[140px]">{key}:</span>
                  <Input
                    value={value}
                    onChange={(e) => setTestVariables(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Mensagem Inicial</Label>
            <Textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Digite a mensagem que iniciará o flow..."
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={handleStart} disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Iniciar Teste
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
                <Button onClick={handleStop} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Parar
                </Button>
                <Button variant="outline" className="gap-2">
                  <SkipForward className="h-4 w-4" />
                  Próximo
                </Button>
              </>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Console de Execução</Label>
          <ScrollArea className="h-[300px] w-full rounded-md border bg-muted/30 p-4">
            <div className="space-y-2">
              {consoleLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aguardando início da execução...
                </p>
              ) : (
                consoleLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm font-mono">
                    <Badge variant="outline" className="shrink-0">
                      {log.time}
                    </Badge>
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
