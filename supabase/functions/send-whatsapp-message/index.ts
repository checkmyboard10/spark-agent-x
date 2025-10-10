import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { conversationId, content, agentId } = await req.json();

    if (!conversationId || !content) {
      throw new Error('Conversation ID and content are required');
    }

    // Get agent settings and knowledge base
    let typingDelay = 1500;
    let humanizationEnabled = true;
    let knowledgeContent = '';

    if (agentId) {
      const { data: agent } = await supabaseClient
        .from('agents')
        .select('typing_delay_ms, humanization_enabled, prompt')
        .eq('id', agentId)
        .single();

      if (agent) {
        typingDelay = agent.typing_delay_ms || 1500;
        humanizationEnabled = agent.humanization_enabled !== false;
      }

      // Fetch knowledge base for this agent
      const { data: knowledge } = await supabaseClient
        .from('agent_knowledge_base')
        .select('extracted_content')
        .eq('agent_id', agentId)
        .maybeSingle();

      if (knowledge?.extracted_content) {
        knowledgeContent = knowledge.extracted_content;
        console.log('Knowledge base loaded for agent:', agentId);
      }
    }

    // Apply humanization delay
    if (humanizationEnabled && typingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, typingDelay));
    }

    // Create message
    const { data: message, error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        direction: 'outgoing',
        content,
        message_type: 'text',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw error;
    }

    // Update conversation last_message_at
    await supabaseClient
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Simulate delivery and read status
    setTimeout(async () => {
      await supabaseClient
        .from('messages')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', message.id);
    }, 2000);

    setTimeout(async () => {
      await supabaseClient
        .from('messages')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('id', message.id);
    }, 5000);

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-whatsapp-message:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
