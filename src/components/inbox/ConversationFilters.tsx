import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConversationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    clientId: string;
    agentId: string;
    status: string;
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export default function ConversationFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: ConversationFiltersProps) {
  const { data: clients } = useQuery({
    queryKey: ["clients-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["agents-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleClearFilters = () => {
    onSearchChange("");
    onFiltersChange({
      clientId: "",
      agentId: "",
      status: "active",
      tags: [],
    });
  };

  const hasActiveFilters =
    searchQuery || filters.clientId || filters.agentId || filters.status !== "active";

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="search">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nome ou telefone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-[200px]">
        <Label htmlFor="client">Cliente</Label>
        <Select
          value={filters.clientId}
          onValueChange={(value) => onFiltersChange({ ...filters, clientId: value })}
        >
          <SelectTrigger id="client">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <Label htmlFor="agent">Agente</Label>
        <Select
          value={filters.agentId}
          onValueChange={(value) => onFiltersChange({ ...filters, agentId: value })}
        >
          <SelectTrigger id="agent">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {agents?.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
            <SelectItem value="archived">Arquivadas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="icon" onClick={handleClearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
