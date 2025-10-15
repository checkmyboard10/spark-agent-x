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

    // Buscar instância no banco
    const { data: connection, error: selectError } = await supabaseClient
      .from('whatsapp_connections')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (selectError || !connection) {
      throw new Error('Conexão não encontrada');
    }

    if (!connection.instance_name) {
      throw new Error('Instância não configurada');
    }

    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Configuração da Evolution API não encontrada');
    }

    console.log('[Evolution QR] Buscando QR Code para:', connection.instance_name);

    // Buscar QR Code da Evolution API
    const qrResponse = await fetch(
      `${EVOLUTION_API_URL}/instance/qrcode/${connection.instance_name}`,
      {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY,
        },
      }
    );

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text();
      console.error('[Evolution QR] Erro ao buscar QR:', errorText);
      
      // Verificar status da conexão
      const statusResponse = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${connection.instance_name}`,
        {
          headers: {
            'apikey': EVOLUTION_API_KEY,
          },
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('[Evolution QR] Status da conexão:', statusData);

        // Atualizar status no banco
        if (statusData.state === 'open') {
          await supabaseClient
            .from('whatsapp_connections')
            .update({
              status: 'connected',
              qr_code: null,
              connected_at: new Date().toISOString(),
            })
            .eq('client_id', clientId);

          return new Response(
            JSON.stringify({ 
              status: 'connected',
              message: 'WhatsApp já está conectado!' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }

      throw new Error('QR Code não disponível');
    }

    const qrData = await qrResponse.json();
    console.log('[Evolution QR] QR Code recebido');

    // Atualizar QR code no banco
    await supabaseClient
      .from('whatsapp_connections')
      .update({
        qr_code: qrData.base64 || qrData.code,
        status: 'connecting',
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId);

    return new Response(
      JSON.stringify({ 
        qrCode: qrData.base64 || qrData.code,
        pairingCode: qrData.pairingCode,
        status: 'connecting' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Evolution QR] Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
