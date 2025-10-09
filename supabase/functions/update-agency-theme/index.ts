import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      throw new Error('User has no agency');
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Only admins can update agency theme');
    }

    const { primary_color, secondary_color, settings } = await req.json();

    // Validate HSL format (basic validation)
    const hslRegex = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
    if (primary_color && !hslRegex.test(primary_color)) {
      throw new Error('Invalid primary_color format. Use HSL format: "160 84% 39%"');
    }
    if (secondary_color && !hslRegex.test(secondary_color)) {
      throw new Error('Invalid secondary_color format. Use HSL format: "186 100% 46%"');
    }

    const updates: any = {};
    if (primary_color) updates.primary_color = primary_color;
    if (secondary_color) updates.secondary_color = secondary_color;
    if (settings) updates.settings = settings;

    // Update agency
    const { error: updateError } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', profile.agency_id);

    if (updateError) {
      throw updateError;
    }

    console.log('Theme updated successfully for agency:', profile.agency_id);

    return new Response(
      JSON.stringify({ success: true, updates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating theme:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
