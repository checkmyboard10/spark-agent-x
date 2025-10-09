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

    const { token, password, full_name } = await req.json();

    if (!token || !password || !full_name) {
      throw new Error('Token, password and full_name are required');
    }

    // Find invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invite) {
      throw new Error('Invalid or expired invite');
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Invite has expired');
    }

    // Create user account
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (signUpError) {
      throw signUpError;
    }

    console.log('User created:', newUser.user.id);

    // Update profile with agency
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ agency_id: invite.agency_id })
      .eq('id', newUser.user.id);

    if (profileError) {
      throw profileError;
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: invite.role,
      });

    if (roleError) {
      throw roleError;
    }

    // Mark invite as accepted
    const { error: updateError } = await supabase
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Invite accepted successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Conta criada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
