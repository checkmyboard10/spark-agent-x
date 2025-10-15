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

    const { clientId, phone, message } = await req.json();

    if (!clientId || !phone || !message) {
      throw new Error('clientId, phone e message são obrigatórios');
    }

    // Buscar instância no banco
    const { data: connection, error: selectError } = await supabaseClient
      .from('whatsapp_connections')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (selectError || !connection) {
      throw new Error('Conexão não encontrada');
    }

    if (connection.status !== 'connected') {
      throw new Error('WhatsApp não está conectado');
    }

    if (!connection.instance_name) {
      throw new Error('Instância não configurada');
    }

    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Configuração da Evolution API não encontrada');
    }

    console.log('[Evolution Send] Enviando mensagem via:', connection.instance_name);

    // Enviar mensagem via Evolution API
    const sendResponse = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${connection.instance_name}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: phone.replace(/\D/g, ''), // Remove caracteres não numéricos
          textMessage: {
            text: message,
          },
        }),
      }
    );

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('[Evolution Send] Erro ao enviar:', errorText);
      throw new Error(`Erro ao enviar mensagem: ${errorText}`);
    }

    const sendData = await sendResponse.json();
    console.log('[Evolution Send] Mensagem enviada:', sendData);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: sendData,
        message: 'Mensagem enviada com sucesso!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Evolution Send] Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
