import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quickReplies } = useQuery({
    queryKey: ["quick-replies"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .single();
      
      if (!profile?.agency_id) return [];

      const { data, error } = await supabase
        .from("quick_replies")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .order("title");
      
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("contact_name, contact_phone, client_id")
        .eq("id", conversationId)
        .single();

      if (!conversation) throw new Error("Conversation not found");

      // Insert message
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        direction: "outgoing",
        status: "sent",
        message_type: "text",
      });

      if (messageError) throw messageError;

      // Update conversation last_message_at
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (updateError) throw updateError;

      // Call edge function to send WhatsApp message
      await supabase.functions.invoke("send-whatsapp-message", {
        body: {
          clientId: conversation.client_id,
          to: conversation.contact_phone,
          message: content,
        },
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      toast({
        title: "Mensagem enviada",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (message.startsWith("/")) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }, [message]);

  const replaceVariables = (content: string) => {
    // TODO: Replace with actual conversation data
    return content
      .replace(/{nome}/g, "Cliente")
      .replace(/{empresa}/g, "Empresa")
      .replace(/{data}/g, new Date().toLocaleDateString("pt-BR"))
      .replace(/{agente}/g, "Agente");
  };

  const handleSelectQuickReply = (reply: any) => {
    const processed = replaceVariables(reply.content);
    setMessage(processed);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  const filteredReplies = quickReplies?.filter((reply) =>
    reply.title.toLowerCase().includes(message.slice(1).toLowerCase())
  );

  return (
    <div className="flex gap-2">
      <Popover open={showQuickReplies && (filteredReplies?.length ?? 0) > 0}>
        <PopoverTrigger asChild>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (use / para respostas rápidas)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={sendMutation.isPending}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar resposta rápida..." />
            <CommandList>
              <CommandEmpty>Nenhuma resposta encontrada.</CommandEmpty>
              <CommandGroup heading="Respostas Rápidas">
                {filteredReplies?.map((reply) => (
                  <CommandItem
                    key={reply.id}
                    onSelect={() => handleSelectQuickReply(reply)}
                  >
                    <div>
                      <div className="font-medium">{reply.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {reply.content}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || sendMutation.isPending}
        size="lg"
      >
        {sendMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
