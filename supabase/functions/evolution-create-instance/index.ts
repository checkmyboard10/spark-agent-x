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

    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('Client ID é obrigatório');
    }

    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Configuração da Evolution API não encontrada');
    }

    console.log('[Evolution] Criando instância para cliente:', clientId);

    // Gerar nome único para a instância
    const instanceName = `client_${clientId.substring(0, 8)}_${Date.now()}`;
    
    // Criar instância na Evolution API
    const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Evolution] Erro ao criar instância:', errorText);
      throw new Error(`Erro ao criar instância: ${errorText}`);
    }

    const instanceData = await createResponse.json();
    console.log('[Evolution] Instância criada:', instanceData);

    // Configurar webhook para receber mensagens
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`;
    
    const webhookResponse = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        url: webhookUrl,
        webhook_by_events: false,
        webhook_base64: false,
        events: [
          'QRCODE_UPDATED',
          'CONNECTION_UPDATE',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'SEND_MESSAGE',
        ],
      }),
    });

    if (!webhookResponse.ok) {
      console.error('[Evolution] Erro ao configurar webhook');
    }

    // Conectar instância
    const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    if (!connectResponse.ok) {
      console.error('[Evolution] Erro ao conectar instância');
    }

    // Salvar ou atualizar no banco de dados
    const { data: connection, error: upsertError } = await supabaseClient
      .from('whatsapp_connections')
      .upsert({
        client_id: clientId,
        instance_name: instanceName,
        webhook_url: webhookUrl,
        status: 'connecting',
        evolution_data: instanceData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('[Evolution] Erro ao salvar no banco:', upsertError);
      throw upsertError;
    }

    console.log('[Evolution] Conexão salva no banco:', connection);

    return new Response(
      JSON.stringify({ 
        success: true,
        connection,
        instanceName,
        message: 'Instância criada com sucesso. Aguarde o QR Code...' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Evolution] Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
