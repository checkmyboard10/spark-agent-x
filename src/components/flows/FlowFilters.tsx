import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { FlowFilters as FlowFiltersType } from "@/pages/Flows";

interface FlowFiltersProps {
  filters: FlowFiltersType;
  onFiltersChange: (filters: FlowFiltersType) => void;
}

export const FlowFilters = ({ filters, onFiltersChange }: FlowFiltersProps) => {
  // Fetch clients for filter
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-for-filter"],
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

  // Fetch agents for filter
  const { data: agents = [] } = useQuery({
    queryKey: ["agents-for-filter", filters.clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!profile) return [];

      let query = supabase
        .from("agents")
        .select("id, name, client_id, clients!inner(agency_id)")
        .eq("clients.agency_id", profile.agency_id)
        .order("name");

      if (filters.clientId && filters.clientId !== "all") {
        query = query.eq("client_id", filters.clientId);
      }

      const { data } = await query;
      return data || [];
    },
  });

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="search" className="sr-only">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por nome do flow..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client-filter" className="sr-only">
            Cliente
          </Label>
          <Select
            value={filters.clientId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, clientId: value, agentId: "" })
            }
          >
            <SelectTrigger id="client-filter">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="agent-filter" className="sr-only">
            Agente
          </Label>
          <Select
            value={filters.agentId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, agentId: value })
            }
            disabled={!filters.clientId || filters.clientId === "all"}
          >
            <SelectTrigger id="agent-filter">
              <SelectValue placeholder="Todos os agentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os agentes</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Apenas ativos</SelectItem>
            <SelectItem value="inactive">Apenas inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
