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
      throw new Error('Client ID is required');
    }

    // Generate simulated QR code
    const qrCode = `WHATSAPP_QR_${crypto.randomUUID()}`;

    // Create or update WhatsApp connection
    const { data: connection, error: upsertError } = await supabaseClient
      .from('whatsapp_connections')
      .upsert({
        client_id: clientId,
        status: 'connecting',
        qr_code: qrCode,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error creating connection:', upsertError);
      throw upsertError;
    }

    // Simulate connection success after 5 seconds
    setTimeout(async () => {
      await supabaseClient
        .from('whatsapp_connections')
        .update({
          status: 'connected',
          phone_number: `+55 11 ${Math.floor(Math.random() * 100000000)}`,
          connected_at: new Date().toISOString(),
          qr_code: null,
        })
        .eq('id', connection.id);
    }, 5000);

    return new Response(
      JSON.stringify({ connection, qrCode }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in connect-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
