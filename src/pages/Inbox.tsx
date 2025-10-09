import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ConversationList from "@/components/inbox/ConversationList";
import ChatWindow from "@/components/inbox/ChatWindow";
import ConversationFilters from "@/components/inbox/ConversationFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

export interface Conversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  last_message_at: string;
  status: string;
  archived: boolean;
  client_id: string;
  agent_id: string;
  metadata: any;
  unread_count?: number;
}

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    clientId: "all",
    agentId: "all",
    status: "active",
    tags: [] as string[],
  });

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["inbox-conversations", filters, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("conversations")
        .select("*, clients(name), agents(name)")
        .order("last_message_at", { ascending: false });

      if (filters.status === "active") {
        query = query.eq("archived", false);
      } else if (filters.status === "archived") {
        query = query.eq("archived", true);
      }

      if (filters.clientId && filters.clientId !== "all") {
        query = query.eq("client_id", filters.clientId);
      }

      if (filters.agentId && filters.agentId !== "all") {
        query = query.eq("agent_id", filters.agentId);
      }

      if (searchQuery) {
        query = query.or(`contact_name.ilike.%${searchQuery}%,contact_phone.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Conversation[];
    },
  });

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("inbox-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          refetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex gap-4 p-6">
        <div className="w-96 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todas as conversas em um único lugar
        </p>
      </div>

      <ConversationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-96 border rounded-lg overflow-hidden bg-card">
          {conversations && conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation}
              onSelect={setSelectedConversation}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma conversa encontrada</h3>
              <p className="text-sm text-muted-foreground">
                As conversas aparecerão aqui quando os clientes iniciarem um contato
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden bg-card">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma conversa para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
