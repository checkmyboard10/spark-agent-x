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
import { Edit, Trash2, Mail, Phone, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp_id: string | null;
  active: boolean;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onRefresh: () => void;
}

export const ClientsTable = ({
  clients,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: ClientsTableProps) => {
  const handleToggleStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ active: !currentStatus })
        .eq("id", clientId);

      if (error) throw error;

      toast.success(currentStatus ? "Cliente desativado" : "Cliente ativado");
      onRefresh();
    } catch (error) {
      console.error("Error toggling client status:", error);
      toast.error("Erro ao alterar status do cliente");
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>WhatsApp ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center shadow-card">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground text-lg mb-2">
          Nenhum cliente encontrado
        </div>
        <p className="text-sm text-muted-foreground">
          Crie seu primeiro cliente para começar
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
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>WhatsApp ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {client.active ? (
                    <div className="h-2 w-2 rounded-full bg-[hsl(155,85%,45%)] shadow-glow" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-[hsl(222,20%,25%)]" />
                  )}
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {client.name}
                </div>
              </TableCell>
              <TableCell>
                {client.email ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {client.email}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                {client.phone ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {client.phone}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                {client.whatsapp_id ? (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {client.whatsapp_id}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={client.active}
                  onCheckedChange={() => handleToggleStatus(client.id, client.active)}
                  className="data-[state=checked]:bg-[hsl(155,85%,45%)]"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(client)}
                    title="Editar cliente"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(client.id)}
                    title="Excluir cliente"
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
