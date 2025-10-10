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
import { Edit, Copy, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface FlowsTableProps {
  flows: any[];
  isLoading: boolean;
  onToggleStatus: (flowId: string, currentStatus: boolean) => void;
  onDuplicate: (flow: any) => void;
  onDelete: (flowId: string, flowName: string) => void;
}

export const FlowsTable = ({
  flows,
  isLoading,
  onToggleStatus,
  onDuplicate,
  onDelete,
}: FlowsTableProps) => {
  const navigate = useNavigate();
  const [detailsDialog, setDetailsDialog] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (flows.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-muted-foreground text-lg mb-2">
          Nenhum flow encontrado
        </div>
        <p className="text-sm text-muted-foreground">
          Crie seu primeiro flow para começar a automatizar processos
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {flow.is_active ? (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                    {flow.name}
                  </div>
                </TableCell>
                <TableCell>
                  {flow.agents?.clients?.name || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {flow.agents?.name || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(flow.updated_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={flow.is_active}
                    onCheckedChange={() => onToggleStatus(flow.id, flow.is_active)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsDialog(flow)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/flows/editor/${flow.agent_id}/${flow.id}`)}
                      title="Editar flow"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(flow)}
                      title="Duplicar flow"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(flow.id, flow.name)}
                      title="Excluir flow"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Flow</DialogTitle>
            <DialogDescription>
              Informações completas sobre o flow
            </DialogDescription>
          </DialogHeader>
          {detailsDialog && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Nome
                </div>
                <div className="font-medium">{detailsDialog.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </div>
                <div className="text-sm">
                  {detailsDialog.description || (
                    <span className="text-muted-foreground">Sem descrição</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Nós
                  </div>
                  <div className="text-2xl font-bold">
                    {detailsDialog.nodes?.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Conexões
                  </div>
                  <div className="text-2xl font-bold">
                    {detailsDialog.edges?.length || 0}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Variáveis
                </div>
                <div className="text-sm">
                  {detailsDialog.variables &&
                  Object.keys(detailsDialog.variables).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(detailsDialog.variables).map((key) => (
                        <Badge key={key} variant="outline">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Nenhuma variável definida
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </div>
                <Badge variant={detailsDialog.is_active ? "default" : "secondary"}>
                  {detailsDialog.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Criado em
                </div>
                <div className="text-sm">
                  {format(new Date(detailsDialog.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
