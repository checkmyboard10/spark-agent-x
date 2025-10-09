import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, FileText, Tags, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ConversationNotes from "./ConversationNotes";
import ConversationTags from "./ConversationTags";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatWindowProps {
  conversationId: string;
  onClose: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, clients(name), agents(name)")
        .eq("id", conversationId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("conversations")
        .update({
          archived: !conversation?.archived,
          archived_at: !conversation?.archived ? new Date().toISOString() : null,
        })
        .eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
      toast({
        title: conversation?.archived ? "Conversa desarquivada" : "Conversa arquivada",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao arquivar conversa",
        variant: "destructive",
      });
    },
  });

  if (loadingConversation || loadingMessages) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{conversation?.contact_name}</h3>
          <p className="text-sm text-muted-foreground">{conversation?.contact_phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Notas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTags(true)}
          >
            <Tags className="h-4 w-4 mr-2" />
            Tags
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            {conversation?.archived ? "Desarquivar" : "Arquivar"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages?.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <MessageInput conversationId={conversationId} />
      </div>

      {/* Dialogs */}
      {showNotes && (
        <ConversationNotes
          conversationId={conversationId}
          open={showNotes}
          onOpenChange={setShowNotes}
        />
      )}
      {showTags && (
        <ConversationTags
          conversationId={conversationId}
          open={showTags}
          onOpenChange={setShowTags}
        />
      )}
    </div>
  );
}
