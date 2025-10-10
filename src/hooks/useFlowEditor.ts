import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Node, Edge, addEdge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  copyNodesToClipboard, 
  pasteNodesFromClipboard, 
  generateNewIds, 
  hasClipboardData 
} from '@/lib/flowClipboard';

interface FlowData {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  variables: Record<string, any>;
  is_active: boolean;
}

// Generate unique flow name
const generateUniqueName = async (agentId: string): Promise<string> => {
  const { data } = await supabase
    .from('agent_flows')
    .select('name')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });
  
  if (!data || data.length === 0) {
    return 'Flow 1';
  }
  
  // Find highest number
  let maxNum = 0;
  data.forEach(flow => {
    const match = flow.name.match(/^Flow (\d+)$/);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1]));
    }
  });
  
  return `Flow ${maxNum + 1}`;
};

export const useFlowEditor = (agentId: string, flowId?: string) => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [flowName, setFlowName] = useState('Novo Flow');
  const [flowDescription, setFlowDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load flow data
  const loadFlow = useCallback(async () => {
    if (!flowId) {
      // Generate unique name for new flow
      const uniqueName = await generateUniqueName(agentId);
      setFlowName(uniqueName);
      
      // Initialize with a start node
      setNodes([{
        id: 'start-node',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Início' }
      }]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agent_flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (error) throw error;

      if (data) {
        setFlowName(data.name);
        setFlowDescription(data.description || '');
        setNodes((data.nodes as unknown as Node[]) || []);
        setEdges((data.edges as unknown as Edge[]) || []);
        setIsActive(data.is_active);
      }
    } catch (error: any) {
      console.error('Error loading flow:', error);
      toast.error('Erro ao carregar flow');
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  // Save flow
  const saveFlow = useCallback(async () => {
    if (!flowName.trim()) {
      toast.error('Digite um nome para o flow');
      return;
    }

    setSaving(true);
    try {
      const flowData = {
        agent_id: agentId,
        name: flowName,
        description: flowDescription,
        nodes: nodes as any,
        edges: edges as any,
        is_active: isActive,
      };

      if (flowId) {
        // Update existing flow
        const { error } = await supabase
          .from('agent_flows')
          .update(flowData)
          .eq('id', flowId);

        if (error) throw error;
        setLastSaved(new Date());
        toast.success('✓ Flow salvo');
      } else {
        // Check for duplicate name before creating
        const { data: existing } = await supabase
          .from('agent_flows')
          .select('id')
          .eq('agent_id', agentId)
          .eq('name', flowName)
          .maybeSingle();
        
        if (existing) {
          toast.error('Já existe um flow com este nome. Escolha outro nome.');
          setSaving(false);
          return;
        }
        
        // Create new flow
        const { data, error } = await supabase
          .from('agent_flows')
          .insert(flowData)
          .select()
          .single();

        if (error) throw error;
        setLastSaved(new Date());
        toast.success('✓ Flow criado');
        navigate(`/flows/${agentId}/${data.id}`);
      }
    } catch (error: any) {
      console.error('Error saving flow:', error);
      toast.error('Erro ao salvar: ' + (error.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  }, [agentId, flowId, flowName, flowDescription, nodes, edges, isActive, navigate]);

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  // Add new node
  const addNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: type === 'start' ? 'Início' : type === 'end' ? 'Fim' : 'Mensagem' }
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return !(sourceNode?.selected || targetNode?.selected);
    }));
  }, [nodes]);

  // Copy selected nodes
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => 
      selectedNodes.some(n => n.id === e.source || n.id === e.target)
    );
    
    if (selectedNodes.length === 0) {
      toast.error('Nenhum nó selecionado');
      return;
    }
    
    copyNodesToClipboard(selectedNodes, selectedEdges);
    toast.success(`${selectedNodes.length} nó(s) copiado(s)`);
  }, [nodes, edges]);

  // Paste nodes from clipboard
  const pasteNodes = useCallback(() => {
    const clipboardData = pasteNodesFromClipboard();
    
    if (!clipboardData) {
      toast.error('Nada para colar');
      return;
    }
    
    const newData = generateNewIds(clipboardData);
    
    // Deselect all current nodes
    setNodes(nodes => nodes.map(n => ({ ...n, selected: false })));
    
    // Add new nodes and edges
    setNodes(nodes => [...nodes, ...newData.nodes]);
    setEdges(edges => [...edges, ...newData.edges]);
    
    toast.success(`${newData.nodes.length} nó(s) colado(s)`);
  }, []);

  // Duplicate selected nodes
  const duplicateSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => 
      selectedNodes.some(n => n.id === e.source || n.id === e.target)
    );
    
    if (selectedNodes.length === 0) {
      toast.error('Nenhum nó selecionado');
      return;
    }
    
    const clipboardData = { nodes: selectedNodes, edges: selectedEdges, timestamp: Date.now() };
    const newData = generateNewIds(clipboardData);
    
    // Deselect all current nodes
    setNodes(nodes => nodes.map(n => ({ ...n, selected: false })));
    
    // Add duplicated nodes and edges
    setNodes(nodes => [...nodes, ...newData.nodes]);
    setEdges(edges => [...edges, ...newData.edges]);
    
    toast.success(`${newData.nodes.length} nó(s) duplicado(s)`);
  }, [nodes, edges]);

  return {
    // State
    nodes,
    edges,
    flowName,
    flowDescription,
    isActive,
    isSaving,
    isLoading,
    lastSaved,
    
    // Setters
    setNodes,
    setEdges,
    setFlowName,
    setFlowDescription,
    setIsActive,
    
    // Actions
    loadFlow,
    saveFlow,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedNodes,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    hasClipboard: hasClipboardData(),
  };
};
