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
    agentId: "", // Optional
  });

  // Fetch agents for optional linking
  const { data: agents = [] } = useQuery({
    queryKey: ["agents-for-flows"],
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
        .from("agents")
        .select(`
          id,
          name,
          clients (
            id,
            name,
            agency_id
          )
        `)
        .eq("clients.agency_id", profile.agency_id)
        .order("name");

      return (data || []).filter((agent: any) => 
        agent.clients?.agency_id === profile.agency_id
      );
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
          agent_id: formData.agentId || null, // OPTIONAL
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

      toast.success("Flow criado com sucesso!");
      
      // ✅ Invalidar cache ANTES de redirecionar
      await queryClient.invalidateQueries({ queryKey: ["flows"] });
      await queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      
      // Reset form
      setFormData({ name: "", description: "", agentId: "" });
      onOpenChange(false);
      onSuccess();

      // Dar tempo para queries atualizarem antes de redirecionar
      setTimeout(() => {
        navigate(`/flows/editor/${newFlow.id}`);
      }, 100);
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
            <Label htmlFor="agent">Vincular a um Agente (Opcional)</Label>
            <Select
              value={formData.agentId}
              onValueChange={(value) => setFormData({ ...formData, agentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum agente (pode vincular depois)" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} - {agent.clients?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Você pode criar um flow sem vínculo e associá-lo a um agente depois
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
