import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Node, Edge } from '@xyflow/react';
import { Network, GitBranch, Clock, CheckCircle } from 'lucide-react';

interface FlowStatsCardProps {
  nodes: Node[];
  edges: Edge[];
}

export const FlowStatsCard = ({ nodes, edges }: FlowStatsCardProps) => {
  const nodesByType = nodes.reduce((acc, node) => {
    acc[node.type || 'unknown'] = (acc[node.type || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pathCount = edges.length > 0 ? Math.pow(2, edges.length) : 0;

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Network className="h-4 w-4" />
        Estatísticas do Flow
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total de nós:</span>
          <Badge variant="secondary">{nodes.length}</Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Conexões:</span>
          <Badge variant="secondary">{edges.length}</Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Caminhos possíveis:</span>
          <Badge variant="secondary">~{pathCount}</Badge>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2">Tipos de nós:</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(nodesByType).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}: {count}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
