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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const webhook = await req.json();
    
    console.log('[Evolution Webhook] Evento recebido:', webhook.event);
    console.log('[Evolution Webhook] Dados:', JSON.stringify(webhook, null, 2));

    const instanceName = webhook.instance;

    // Buscar conexão pelo instance_name
    const { data: connection } = await supabaseClient
      .from('whatsapp_connections')
      .select('*')
      .eq('instance_name', instanceName)
      .single();

    if (!connection) {
      console.warn('[Evolution Webhook] Conexão não encontrada para instância:', instanceName);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processar diferentes tipos de eventos
    switch (webhook.event) {
      case 'qrcode.updated':
      case 'QRCODE_UPDATED':
        console.log('[Evolution Webhook] QR Code atualizado');
        await supabaseClient
          .from('whatsapp_connections')
          .update({
            qr_code: webhook.data.qrcode?.base64 || webhook.data.qrcode,
            status: 'connecting',
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id);
        break;

      case 'connection.update':
      case 'CONNECTION_UPDATE':
        console.log('[Evolution Webhook] Status da conexão:', webhook.data.state);
        
        let newStatus = 'disconnected';
        if (webhook.data.state === 'open') {
          newStatus = 'connected';
        } else if (webhook.data.state === 'connecting') {
          newStatus = 'connecting';
        }

        const updateData: any = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (newStatus === 'connected') {
          updateData.connected_at = new Date().toISOString();
          updateData.qr_code = null;
          
          // Buscar informações do número conectado
          const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
          const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
          
          if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
            try {
              const infoResponse = await fetch(
                `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`,
                {
                  headers: { 'apikey': EVOLUTION_API_KEY },
                }
              );
              
              if (infoResponse.ok) {
                const instances = await infoResponse.json();
                const instance = instances.find((i: any) => i.instance.instanceName === instanceName);
                
                if (instance?.instance?.owner) {
                  updateData.phone_number = instance.instance.owner;
                }
              }
            } catch (error) {
              console.error('[Evolution Webhook] Erro ao buscar info da instância:', error);
            }
          }
        }

        await supabaseClient
          .from('whatsapp_connections')
          .update(updateData)
          .eq('id', connection.id);
        break;

      case 'messages.upsert':
      case 'MESSAGES_UPSERT':
        console.log('[Evolution Webhook] Nova mensagem recebida');
        
        const message = webhook.data;
        const messageData = message.message || message;
        
        // Determinar direção da mensagem
        const isFromMe = messageData.key?.fromMe || false;
        const direction = isFromMe ? 'outbound' : 'inbound';
        
        // Extrair conteúdo da mensagem
        let content = '';
        if (messageData.message?.conversation) {
          content = messageData.message.conversation;
        } else if (messageData.message?.extendedTextMessage?.text) {
          content = messageData.message.extendedTextMessage.text;
        } else if (messageData.message?.imageMessage?.caption) {
          content = messageData.message.imageMessage.caption;
        }

        // Extrair número do contato
        const remoteJid = messageData.key?.remoteJid || '';
        const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');

        // Buscar ou criar conversa
        let conversation;
        const { data: existingConversation } = await supabaseClient
          .from('conversations')
          .select('*')
          .eq('client_id', connection.client_id)
          .eq('contact_phone', phoneNumber)
          .single();

        if (existingConversation) {
          conversation = existingConversation;
          
          // Atualizar última mensagem
          await supabaseClient
            .from('conversations')
            .update({
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);
        } else {
          // Criar nova conversa
          const { data: agent } = await supabaseClient
            .from('agents')
            .select('*')
            .eq('client_id', connection.client_id)
            .eq('active', true)
            .limit(1)
            .single();

          const { data: newConversation } = await supabaseClient
            .from('conversations')
            .insert({
              client_id: connection.client_id,
              agent_id: agent?.id,
              contact_phone: phoneNumber,
              contact_name: messageData.pushName || phoneNumber,
              status: 'active',
              last_message_at: new Date().toISOString(),
            })
            .select()
            .single();

          conversation = newConversation;
        }

        if (conversation && content) {
          // Salvar mensagem
          await supabaseClient
            .from('messages')
            .insert({
              conversation_id: conversation.id,
              content: content,
              direction: direction,
              message_type: 'text',
              status: 'delivered',
              sent_at: new Date().toISOString(),
              delivered_at: new Date().toISOString(),
              metadata: {
                messageId: messageData.key?.id,
                fromMe: isFromMe,
                source: 'whatsapp',
              },
            });
        }
        break;

      case 'messages.update':
      case 'MESSAGES_UPDATE':
        console.log('[Evolution Webhook] Status de mensagem atualizado');
        // Atualizar status da mensagem no banco (lida, entregue, etc)
        break;

      default:
        console.log('[Evolution Webhook] Evento não tratado:', webhook.event);
    }

    return new Response(
      JSON.stringify({ received: true, processed: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Evolution Webhook] Erro:', error);
    return new Response(
      JSON.stringify({ 
        received: true, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Retornar 200 mesmo com erro para não re-enviar webhook
      }
    );
  }
});
