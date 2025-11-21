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

    // Get conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('client_id, contact_phone')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Get WhatsApp connection
    const { data: connection, error: connError } = await supabaseClient
      .from('whatsapp_connections')
      .select('instance_name, status')
      .eq('client_id', conversation.client_id)
      .single();

    if (connError || !connection) {
      throw new Error('WhatsApp connection not found');
    }

    if (connection.status !== 'connected') {
      throw new Error('WhatsApp is not connected');
    }

    // Get agent settings for humanization
    let typingDelay = 1500;
    let humanizationEnabled = true;

    if (agentId) {
      const { data: agent } = await supabaseClient
        .from('agents')
        .select('typing_delay_ms, humanization_enabled')
        .eq('id', agentId)
        .maybeSingle();

      if (agent) {
        typingDelay = agent.typing_delay_ms || 1500;
        humanizationEnabled = agent.humanization_enabled !== false;
      }
    }

    // Apply humanization delay
    if (humanizationEnabled && typingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, typingDelay));
    }

    // Create message with pending status
    const { data: message, error: msgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        direction: 'outgoing',
        content,
        message_type: 'text',
        status: 'pending',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      throw msgError;
    }

    // Send via Evolution API
    try {
      const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke(
        'evolution-send-message',
        {
          body: {
            clientId: conversation.client_id,
            phone: conversation.contact_phone,
            message: content,
          },
        }
      );

      if (sendError) throw sendError;

      // Update message status to sent
      await supabaseClient
        .from('messages')
        .update({
          status: 'sent',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      console.log('Message sent successfully:', sendResult);
    } catch (sendError) {
      console.error('Error sending via Evolution API:', sendError);
      
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
      
      // Update message status to failed
      await supabaseClient
        .from('messages')
        .update({
          status: 'failed',
          metadata: { error: errorMessage },
        })
        .eq('id', message.id);

      throw new Error(`Failed to send message: ${errorMessage}`);
    }

    // Update conversation last_message_at
    await supabaseClient
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

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
