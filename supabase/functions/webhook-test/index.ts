import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

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

    const { webhookId } = await req.json();

    if (!webhookId) {
      throw new Error('Webhook ID is required');
    }

    // Get webhook details
    const { data: webhook, error } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error || !webhook) {
      throw new Error('Webhook not found');
    }

    // Create test payload
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook dispatch',
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = await createHmacSignature(payloadString, webhook.secret);

    // Dispatch test webhook
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': 'test',
        },
        body: payloadString,
      });

      const responseBody = await response.text();

      // Log the test
      await supabaseClient
        .from('webhook_logs')
        .insert({
          webhook_id: webhook.id,
          event_type: 'test',
          payload: testPayload,
          response_status: response.status,
          response_body: responseBody.substring(0, 1000),
          attempt_number: 1,
          completed_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({
          success: response.ok,
          status: response.status,
          response: responseBody,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (fetchError) {
      // Log the error
      await supabaseClient
        .from('webhook_logs')
        .insert({
          webhook_id: webhook.id,
          event_type: 'test',
          payload: testPayload,
          attempt_number: 1,
          error_message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          triggered_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({
          success: false,
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error in webhook-test:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
