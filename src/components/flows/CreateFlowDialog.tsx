import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateFlowDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateFlowDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
  });

  // Fetch clients for optional linking
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-for-flows"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) return [];

      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("agency_id", profile.agency_id)
        .order("name");

      return data || [];
    },
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do flow é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Create initial flow with start node
      const { data: newFlow, error } = await supabase
        .from("agent_flows")
        .insert({
          agency_id: profile.agency_id,
          client_id: formData.clientId || null,
          name: formData.name,
          description: formData.description || null,
          nodes: [
            {
              id: "start",
              type: "start",
              position: { x: 250, y: 50 },
              data: { label: "Início" },
            },
          ],
          edges: [],
          variables: {},
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Flow created:', { 
        flowId: newFlow.id, 
        agency_id: profile.agency_id, 
        name: formData.name 
      });

      // ✅ Invalidar cache e forçar refetch
      await queryClient.invalidateQueries({ queryKey: ["flows"] });
      await queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      await queryClient.refetchQueries({ queryKey: ["flows"] });
      
      toast.success("Flow criado com sucesso!", {
        description: "Redirecionando para o editor...",
        duration: 2000,
      });
      
      // Reset form
      setFormData({ name: "", description: "", clientId: "" });
      onOpenChange(false);
      onSuccess();

      // Dar mais tempo para queries atualizarem
      setTimeout(() => {
        navigate(`/flows/editor/${newFlow.id}`);
      }, 300);
    } catch (error) {
      console.error("Error creating flow:", error);
      toast.error("Erro ao criar flow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Flow</DialogTitle>
          <DialogDescription>
            Configure as informações básicas do seu flow de automação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Flow *</Label>
            <Input
              id="name"
              placeholder="Ex: Atendimento Inicial"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo deste flow..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Vincular a um Cliente (Opcional)</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum cliente (flow independente)" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Flows podem ser independentes ou vinculados a clientes
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? "Criando..." : "Criar Flow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
