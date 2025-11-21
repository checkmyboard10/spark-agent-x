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

    // Get connection details
    const { data: connection, error: fetchError } = await supabaseClient
      .from('whatsapp_connections')
      .select('instance_name')
      .eq('client_id', clientId)
      .single();

    if (fetchError || !connection) {
      throw new Error('WhatsApp connection not found');
    }

    if (!connection.instance_name) {
      throw new Error('Instance name not found');
    }

    // Delete instance from Evolution API
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API configuration missing');
    }

    const deleteResponse = await fetch(
      `${evolutionApiUrl}/instance/delete/${connection.instance_name}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': evolutionApiKey,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Evolution API delete error:', errorText);
      throw new Error(`Failed to delete instance: ${errorText}`);
    }

    console.log('Instance deleted successfully:', connection.instance_name);

    // Update database status to disconnected
    const { error } = await supabaseClient
      .from('whatsapp_connections')
      .update({
        status: 'disconnected',
        phone_number: null,
        connected_at: null,
        instance_name: null,
        qr_code: null,
        last_seen: new Date().toISOString(),
      })
      .eq('client_id', clientId);

    if (error) {
      console.error('Error updating database:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in disconnect-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
