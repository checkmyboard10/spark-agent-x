import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useFlowVariables } from '@/hooks/useFlowVariables';
import { Node } from '@xyflow/react';

interface VariableSelectorProps {
  nodes: Node[];
  onInsert?: (variable: string) => void;
}

export const VariableSelector = ({ nodes, onInsert }: VariableSelectorProps) => {
  const { systemVariables, capturedVariables, customVariables } = useFlowVariables(nodes);

  const handleCopyVariable = (varName: string) => {
    const formattedVar = `{{${varName}}}`;
    navigator.clipboard.writeText(formattedVar);
    toast.success('Variável copiada!', {
      description: `${formattedVar} foi copiado para a área de transferência`,
    });
    
    if (onInsert) {
      onInsert(formattedVar);
    }
  };

  const renderVariableList = (variables: any[], title: string, color: string) => {
    if (variables.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${color}`} />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h4>
        </div>
        <div className="space-y-1">
          {variables.map((variable) => (
            <Button
              key={variable.name}
              variant="ghost"
              size="sm"
              className="w-full justify-between h-auto py-2 px-3 hover:bg-accent"
              onClick={() => handleCopyVariable(variable.name)}
            >
              <div className="flex flex-col items-start gap-1 flex-1 text-left">
                <code className="text-xs font-mono font-semibold">
                  {'{{'}{variable.name}{'}}'}
                </code>
                {variable.description && (
                  <span className="text-[10px] text-muted-foreground">
                    {variable.description}
                  </span>
                )}
              </div>
              <Copy className="h-3 w-3 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const hasVariables = 
    systemVariables.length > 0 || 
    capturedVariables.length > 0 || 
    customVariables.length > 0;

  if (!hasVariables) {
    return (
      <div className="p-4 text-center border rounded-lg bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Nenhuma variável disponível ainda.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Adicione nós de IA ou HTTP para capturar variáveis.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {systemVariables.length + capturedVariables.length + customVariables.length}
          </Badge>
          <span className="text-xs font-medium">Variáveis Disponíveis</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Clique para copiar e usar no texto
        </p>
      </div>
      <ScrollArea className="max-h-[240px]">
        <div className="p-3 space-y-4">
          {renderVariableList(systemVariables, 'Sistema', 'bg-blue-500')}
          {renderVariableList(capturedVariables, 'Capturadas', 'bg-green-500')}
          {renderVariableList(customVariables, 'Personalizadas', 'bg-purple-500')}
        </div>
      </ScrollArea>
    </div>
  );
};
