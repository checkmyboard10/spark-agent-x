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

async function dispatchWebhook(
  webhook: any,
  eventType: string,
  payload: any,
  supabaseClient: any,
  attemptNumber: number = 1
) {
  const payloadString = JSON.stringify(payload);
  const signature = await createHmacSignature(payloadString, webhook.secret);
  
  const logId = crypto.randomUUID();
  
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Event-Type': eventType,
      },
      body: payloadString,
    });

    const responseBody = await response.text();

    await supabaseClient
      .from('webhook_logs')
      .insert({
        id: logId,
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: response.status,
        response_body: responseBody.substring(0, 1000),
        attempt_number: attemptNumber,
        completed_at: new Date().toISOString(),
      });

    await supabaseClient
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status: response.ok ? 'success' : 'failed',
      })
      .eq('id', webhook.id);

    return response.ok;
  } catch (error) {
    console.error('Webhook dispatch error:', error);
    
    await supabaseClient
      .from('webhook_logs')
      .insert({
        id: logId,
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        attempt_number: attemptNumber,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        triggered_at: new Date().toISOString(),
      });

    await supabaseClient
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status: 'failed',
      })
      .eq('id', webhook.id);

    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { clientId, eventType, payload } = await req.json();

    if (!clientId || !eventType || !payload) {
      throw new Error('Client ID, event type, and payload are required');
    }

    // Get active webhooks for this client and event type
    const { data: webhooks, error } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('client_id', clientId)
      .eq('active', true)
      .contains('events', [eventType]);

    if (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No webhooks configured for this event' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Dispatch webhooks with retry logic
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const retryPolicy = webhook.retry_policy || { max_retries: 3, backoff_multiplier: 2 };
        let success = false;
        let attempt = 1;

        while (!success && attempt <= retryPolicy.max_retries) {
          success = await dispatchWebhook(webhook, eventType, payload, supabaseClient, attempt);
          
          if (!success && attempt < retryPolicy.max_retries) {
            const delay = 1000 * Math.pow(retryPolicy.backoff_multiplier, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          attempt++;
        }

        return { webhookId: webhook.id, success, attempts: attempt - 1 };
      })
    );

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in webhook-dispatch:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
