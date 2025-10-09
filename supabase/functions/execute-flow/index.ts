import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { flowId, conversationId, variables = {} } = await req.json();

    console.log('Executing flow:', { flowId, conversationId });

    // Buscar fluxo
    const { data: flow, error: flowError } = await supabase
      .from('agent_flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (flowError || !flow) {
      throw new Error('Flow not found');
    }

    console.log('Flow loaded:', flow.name);

    // Criar registro de execução
    const { data: execution, error: executionError } = await supabase
      .from('flow_executions')
      .insert({
        flow_id: flowId,
        conversation_id: conversationId,
        status: 'running',
        variables: variables,
        execution_log: [],
        current_node_id: null
      })
      .select()
      .single();

    if (executionError) {
      throw executionError;
    }

    console.log('Execution created:', execution.id);

    // Iniciar execução do fluxo
    const nodes = flow.nodes || [];
    const edges = flow.edges || [];
    
    // Encontrar nó inicial
    const startNode = nodes.find((n: any) => n.type === 'start');
    if (!startNode) {
      throw new Error('Start node not found');
    }

    const executionLog: any[] = [];
    let currentNodeId = startNode.id;
    let executionVariables = { ...variables };
    let status = 'running';
    let errorMessage = null;

    // Engine de execução simples (modo teste)
    const maxSteps = 50; // Prevenir loops infinitos
    let steps = 0;

    while (currentNodeId && steps < maxSteps) {
      steps++;
      
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) {
        console.log('Node not found, ending execution');
        break;
      }

      console.log(`Step ${steps}: Executing node ${currentNode.type}`);

      const startTime = Date.now();
      
      try {
        // Processar nó baseado no tipo
        if (currentNode.type === 'end') {
          status = 'completed';
          executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'end',
            timestamp: new Date().toISOString(),
            input: null,
            output: 'Flow completed',
            duration: Date.now() - startTime
          });
          break;
        }

        if (currentNode.type === 'message') {
          const message = currentNode.data?.message || '';
          executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'message',
            timestamp: new Date().toISOString(),
            input: message,
            output: `Message sent: ${message}`,
            duration: Date.now() - startTime
          });
        } else if (currentNode.type === 'variable') {
          const varName = currentNode.data?.variableName || 'unknown';
          const value = currentNode.data?.value || '';
          executionVariables[varName] = value;
          executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'variable',
            timestamp: new Date().toISOString(),
            input: { name: varName, value },
            output: { [varName]: value },
            duration: Date.now() - startTime
          });
        } else if (currentNode.type === 'wait') {
          // Em modo teste, apenas logamos
          executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'wait',
            timestamp: new Date().toISOString(),
            input: currentNode.data,
            output: 'Wait node (skipped in test mode)',
            duration: Date.now() - startTime
          });
        }

        // Encontrar próximo nó
        const nextEdge = edges.find((e: any) => e.source === currentNodeId);
        if (nextEdge) {
          currentNodeId = nextEdge.target;
        } else {
          console.log('No next edge found, ending execution');
          break;
        }

      } catch (error) {
        console.error('Error executing node:', error);
        status = 'failed';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        executionLog.push({
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          timestamp: new Date().toISOString(),
          input: currentNode.data,
          output: null,
          duration: Date.now() - startTime,
          error: errorMessage
        });
        break;
      }
    }

    // Atualizar execução com resultado
    await supabase
      .from('flow_executions')
      .update({
        status,
        current_node_id: currentNodeId,
        variables: executionVariables,
        execution_log: executionLog,
        completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
        error_message: errorMessage
      })
      .eq('id', execution.id);

    console.log('Execution completed:', { status, steps, logEntries: executionLog.length });

    return new Response(
      JSON.stringify({ 
        success: true, 
        executionId: execution.id,
        status,
        steps,
        logEntries: executionLog.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in execute-flow:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
