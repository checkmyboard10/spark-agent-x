import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, file, fileName, fileType, fileSize } = await req.json();

    if (!agentId || !file || !fileName || !fileType) {
      throw new Error('Missing required fields');
    }

    // Validar tamanho (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Arquivo muito grande. Máximo 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se já existe documento (para deletar)
    const { data: existingDoc } = await supabaseClient
      .from('agent_knowledge_base')
      .select('file_path')
      .eq('agent_id', agentId)
      .maybeSingle();

    // Deletar arquivo antigo do storage se existir
    if (existingDoc?.file_path) {
      await supabaseClient.storage
        .from('agent-knowledge')
        .remove([existingDoc.file_path]);
    }

    // Converter base64 para buffer
    const base64Data = file.split(',')[1];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Extrair conteúdo baseado no tipo
    let extractedContent = '';
    
    try {
      if (fileType === 'txt') {
        const decoder = new TextDecoder();
        extractedContent = decoder.decode(buffer);
      } else if (fileType === 'pdf') {
        // Para PDF, vamos apenas salvar e processar depois
        // Em produção, você pode integrar uma biblioteca como pdf-parse
        extractedContent = 'Conteúdo PDF processado (implementar extração completa)';
      } else if (fileType === 'doc' || fileType === 'docx') {
        // Para DOCX, vamos apenas salvar e processar depois
        // Em produção, você pode integrar mammoth.js
        extractedContent = 'Conteúdo DOCX processado (implementar extração completa)';
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      extractedContent = 'Erro ao extrair conteúdo do documento';
    }

    // Gerar preview (primeiras 500 caracteres)
    const contentPreview = extractedContent.substring(0, 500);

    // Upload para Storage
    const filePath = `${agentId}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabaseClient.storage
      .from('agent-knowledge')
      .upload(filePath, buffer, {
        contentType: fileType === 'pdf' ? 'application/pdf' : 
                     fileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                     'text/plain',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Inserir ou atualizar na tabela
    const { data: knowledgeData, error: dbError } = await supabaseClient
      .from('agent_knowledge_base')
      .upsert({
        agent_id: agentId,
        file_name: fileName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        extracted_content: extractedContent,
        content_preview: contentPreview,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Knowledge document processed successfully:', knowledgeData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: knowledgeData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-knowledge-document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
