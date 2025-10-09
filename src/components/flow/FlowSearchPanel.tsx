import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Node } from '@xyflow/react';
import { Search, Filter, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FlowSearchPanelProps {
  nodes: Node[];
  onFocusNode: (nodeId: string) => void;
  onClose: () => void;
}

const nodeTypeLabels: Record<string, string> = {
  start: '🚀 Início',
  end: '🏁 Fim',
  message: '💬 Mensagem',
  condition: '🔀 Condição',
  wait: '⏱️ Aguardar',
  http: '🌐 HTTP',
  ai: '🤖 IA',
  variable: '📝 Variável',
  agent: '👤 Agente',
};

export const FlowSearchPanel = ({ nodes, onFocusNode, onClose }: FlowSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredNodes = nodes.filter(node => {
    const label = typeof node.data.label === 'string' ? node.data.label : '';
    const matchesSearch = searchTerm === '' || 
      label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || node.type === filterType;
    return matchesSearch && matchesType;
  });

  const nodeTypes = Array.from(new Set(nodes.map(n => n.type)));

  return (
    <Card className="w-80 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Search className="h-4 w-4" />
          Buscar Nós
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          Filtrar por tipo:
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={filterType === null ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setFilterType(null)}
          >
            Todos
          </Badge>
          {nodeTypes.map(type => (
            <Badge
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFilterType(type)}
            >
              {nodeTypeLabels[type || ''] || type}
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredNodes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum nó encontrado
            </p>
          ) : (
            filteredNodes.map(node => (
              <Button
                key={node.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => onFocusNode(node.id)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {nodeTypeLabels[node.type || ''] || node.type}
                    </span>
                    <span className="font-medium text-sm">
                      {typeof node.data.label === 'string' ? node.data.label : 'Nó'}
                    </span>
                  </div>
                  {node.type === 'message' && typeof node.data.message === 'string' && (
                    <p className="text-xs text-muted-foreground truncate">
                      {node.data.message}
                    </p>
                  )}
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground">
        Mostrando {filteredNodes.length} de {nodes.length} nós
      </div>
    </Card>
  );
};
