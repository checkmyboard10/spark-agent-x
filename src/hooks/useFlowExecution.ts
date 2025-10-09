import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlowExecution {
  id: string;
  flow_id: string;
  conversation_id: string;
  status: string;
  current_node_id: string | null;
  variables: any;
  execution_log: any;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export const useFlowExecution = (flowId?: string) => {
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<FlowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadExecutions = useCallback(async () => {
    if (!flowId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('flow_id', flowId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading executions:', error);
      toast({
        title: 'Erro ao carregar execuções',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [flowId, toast]);

  const loadExecution = useCallback(async (executionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('flow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) throw error;
      setCurrentExecution(data);
      return data;
    } catch (error) {
      console.error('Error loading execution:', error);
      toast({
        title: 'Erro ao carregar execução',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const executeFlow = useCallback(async (
    conversationId: string,
    initialVariables: Record<string, any> = {}
  ) => {
    if (!flowId) {
      toast({
        title: 'Erro',
        description: 'Flow ID não fornecido',
        variant: 'destructive'
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-flow', {
        body: {
          flowId,
          conversationId,
          variables: initialVariables
        }
      });

      if (error) throw error;

      toast({
        title: 'Fluxo executado',
        description: 'A execução foi iniciada com sucesso'
      });

      await loadExecutions();
      return data;
    } catch (error) {
      console.error('Error executing flow:', error);
      toast({
        title: 'Erro ao executar fluxo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [flowId, toast, loadExecutions]);

  return {
    executions,
    currentExecution,
    isLoading,
    loadExecutions,
    loadExecution,
    executeFlow
  };
};
