import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlowsStats } from "@/components/flows/FlowsStats";
import { FlowsTable } from "@/components/flows/FlowsTable";
import { FlowFilters } from "@/components/flows/FlowFilters";
import { CreateFlowDialog } from "@/components/flows/CreateFlowDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface FlowFilters {
  search: string;
  clientId: string;
  agentId: string;
  status: string;
}

const Flows = () => {
  const [filters, setFilters] = useState<FlowFilters>({
    search: "",
    clientId: "",
    agentId: "",
    status: "all",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch flows with related data
  const { data: flows = [], isLoading, refetch } = useQuery({
    queryKey: ["flows", filters],
    queryFn: async () => {
      // Get user's agency_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // ✅ Query otimizada com LEFT JOIN para incluir flows independentes
      let query = supabase
        .from("agent_flows")
        .select(`
          *,
          agents!left (
            id,
            name,
            client_id,
            clients (
              id,
              name
            )
          )
        `)
        .eq("agency_id", profile.agency_id);

      // ✅ Aplicar filtros NO BANCO quando possível
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.status !== "all") {
        query = query.eq('is_active', filters.status === "active");
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      // Filtros client-side apenas para client/agent (devido complexidade do JOIN)
      if (filters.clientId && filters.clientId !== "all") {
        if (filters.clientId === "independent") {
          filtered = filtered.filter((flow: any) => !flow.agents);
        } else {
          filtered = filtered.filter((flow: any) => 
            flow.agents?.client_id === filters.clientId
          );
        }
      }

      if (filters.agentId && filters.agentId !== "all") {
        filtered = filtered.filter((flow: any) => 
          flow.agent_id === filters.agentId
        );
      }

      return filtered;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["flow-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data: allFlows } = await supabase
        .from("agent_flows")
        .select("*")
        .eq("agency_id", profile.agency_id);

      const total = allFlows?.length || 0;
      const active = allFlows?.filter((f: any) => f.is_active).length || 0;
      
      // Count flows linked to agents (where agent has active_flow_id set to this flow)
      const { data: agents } = await supabase
        .from("agents")
        .select("active_flow_id, client_id, clients!inner(agency_id)")
        .eq("clients.agency_id", profile.agency_id)
        .not("active_flow_id", "is", null);

      const linked = agents?.length || 0;

      const lastCreated = allFlows && allFlows.length > 0 
        ? new Date(allFlows[0].created_at)
        : null;

      return { total, active, linked, lastCreated };
    },
  });

  const handleToggleStatus = async (flowId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("agent_flows")
        .update({ is_active: !currentStatus })
        .eq("id", flowId);

      if (error) throw error;

      toast.success(currentStatus ? "Flow desativado" : "Flow ativado");
      refetch();
    } catch (error) {
      console.error("Error toggling flow status:", error);
      toast.error("Erro ao alterar status do flow");
    }
  };

  const handleDuplicate = async (flow: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase.from("agent_flows").insert({
        agency_id: profile.agency_id,
        agent_id: flow.agent_id,
        name: `${flow.name} (Cópia)`,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges,
        variables: flow.variables,
        is_active: false,
      });

      if (error) throw error;

      toast.success("Flow duplicado com sucesso");
      refetch();
    } catch (error) {
      console.error("Error duplicating flow:", error);
      toast.error("Erro ao duplicar flow");
    }
  };

  const handleDelete = async (flowId: string, flowName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o flow "${flowName}"?`)) {
      return;
    }

    try {
      // Check if flow is linked to any agent
      const { data: agents } = await supabase
        .from("agents")
        .select("id, name")
        .eq("active_flow_id", flowId);

      if (agents && agents.length > 0) {
        if (!confirm(
          `Este flow está vinculado a ${agents.length} agente(s). Ao excluir, eles serão desvinculados. Continuar?`
        )) {
          return;
        }

        // Unlink agents
        await supabase
          .from("agents")
          .update({ active_flow_id: null })
          .eq("active_flow_id", flowId);
      }

      const { error } = await supabase
        .from("agent_flows")
        .delete()
        .eq("id", flowId);

      if (error) throw error;

      toast.success("Flow excluído com sucesso");
      refetch();
    } catch (error) {
      console.error("Error deleting flow:", error);
      toast.error("Erro ao excluir flow");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔄 Flows</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus flows de automação visual
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Criar Novo Flow
        </Button>
      </div>

      <FlowsStats stats={stats} isLoading={isLoading} />

      <FlowFilters filters={filters} onFiltersChange={setFilters} />

      <FlowsTable
        flows={flows}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      <CreateFlowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Flows;
