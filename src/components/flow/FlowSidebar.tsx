import { Play, StopCircle, MessageSquare, GitBranch, Clock, Globe, Sparkles, Variable } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodeType {
  type: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'start',
    label: 'Início',
    icon: Play,
    color: 'text-green-600',
    description: 'Ponto de partida do fluxo',
  },
  {
    type: 'message',
    label: 'Mensagem',
    icon: MessageSquare,
    color: 'text-blue-600',
    description: 'Envia uma mensagem',
  },
  {
    type: 'condition',
    label: 'Condição',
    icon: GitBranch,
    color: 'text-indigo-600',
    description: 'Se/Senão - decisões no fluxo',
  },
  {
    type: 'wait',
    label: 'Esperar',
    icon: Clock,
    color: 'text-orange-600',
    description: 'Pausar por tempo determinado',
  },
  {
    type: 'http',
    label: 'HTTP',
    icon: Globe,
    color: 'text-purple-600',
    description: 'Chamar API externa',
  },
  {
    type: 'ai',
    label: 'IA',
    icon: Sparkles,
    color: 'text-pink-600',
    description: 'Gerar resposta com IA',
  },
  {
    type: 'variable',
    label: 'Variável',
    icon: Variable,
    color: 'text-teal-600',
    description: 'Definir ou modificar variável',
  },
  {
    type: 'end',
    label: 'Fim',
    icon: StopCircle,
    color: 'text-red-600',
    description: 'Finaliza o fluxo',
  },
];

interface FlowSidebarProps {
  onAddNode: (type: string) => void;
}

export const FlowSidebar = ({ onAddNode }: FlowSidebarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '0.5';
    }
  };

  const onDragEnd = (event: React.DragEvent) => {
    // Reset visual feedback
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Nós Disponíveis</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para o canvas
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <Card
                key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            onDragEnd={onDragEnd}
            onClick={() => onAddNode(node.type)}
                className="p-3 cursor-move hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`${node.color} mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{node.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {node.description}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Dica:</strong> Clique ou arraste os nós para adicioná-los ao canvas
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};
