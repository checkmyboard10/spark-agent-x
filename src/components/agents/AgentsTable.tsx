import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, FileText, Bot, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  active: boolean;
  flow_enabled?: boolean;
  has_knowledge?: boolean;
  clients?: { name: string };
}

interface AgentsTableProps {
  agents: Agent[];
  isLoading: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: string, agentName: string) => void;
  onRefresh: () => void;
}

export const AgentsTable = ({
  agents,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: AgentsTableProps) => {
  const navigate = useNavigate();

  const handleToggleStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ active: !currentStatus })
        .eq("id", agentId);

      if (error) throw error;

      toast.success(currentStatus ? "Agente desativado" : "Agente ativado");
      onRefresh();
    } catch (error) {
      console.error("Error toggling agent status:", error);
      toast.error("Erro ao alterar status do agente");
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      support: "Suporte",
      sales: "Vendas",
      general: "Geral",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Modo</TableHead>
              <TableHead>Base de Conhecimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center shadow-card">
        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground text-lg mb-2">
          Nenhum agente encontrado
        </div>
        <p className="text-sm text-muted-foreground">
          Crie seu primeiro agente para começar
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Modo</TableHead>
            <TableHead>Base de Conhecimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {agent.active ? (
                    <div className="h-2 w-2 rounded-full bg-[hsl(155,85%,45%)] shadow-glow" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-[hsl(222,20%,25%)]" />
                  )}
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  {agent.name}
                </div>
              </TableCell>
              <TableCell>
                {agent.clients?.name || (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTypeLabel(agent.type)}</Badge>
              </TableCell>
              <TableCell>
                {agent.flow_enabled ? (
                  <Badge className="bg-[hsl(155,85%,45%)]/10 text-[hsl(155,85%,45%)] border-[hsl(155,85%,45%)]">
                    <GitBranch className="h-3 w-3 mr-1" />
                    Flow
                  </Badge>
                ) : (
                  <Badge className="bg-[hsl(208,95%,52%)]/10 text-[hsl(208,95%,52%)] border-[hsl(208,95%,52%)]">
                    <Bot className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {agent.has_knowledge ? (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Sim
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Não</span>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={agent.active}
                  onCheckedChange={() => handleToggleStatus(agent.id, agent.active)}
                  className="data-[state=checked]:bg-[hsl(155,85%,45%)]"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(agent)}
                    title="Editar agente"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(agent.id, agent.name)}
                    title="Excluir agente"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
