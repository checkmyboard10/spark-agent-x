import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FlowToolbar } from '@/components/flow/FlowToolbar';
import { FlowSidebar } from '@/components/flow/FlowSidebar';
import { FlowCanvasWrapper } from '@/components/flow/FlowCanvas';
import { FlowVariablesPanel } from '@/components/flow/FlowVariablesPanel';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { autoLayout, validateFlow, getNodeStats } from '@/lib/flowHelpers';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FlowEditor = () => {
  const { agentId, flowId } = useParams<{ agentId: string; flowId?: string }>();
  
  if (!agentId) {
    return <div>Agent ID não fornecido</div>;
  }

  const {
    nodes,
    edges,
    flowName,
    isActive,
    isSaving,
    isLoading,
    setNodes,
    setFlowName,
    setIsActive,
    loadFlow,
    saveFlow,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
  } = useFlowEditor(agentId, flowId);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedNodes();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFlow();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedNodes, pasteNodes, duplicateSelectedNodes, saveFlow]);

  const handleAutoLayout = () => {
    const layoutedNodes = autoLayout(nodes, edges);
    setNodes(layoutedNodes);
  };

  const validation = validateFlow(nodes, edges);
  const stats = getNodeStats(nodes, edges);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <FlowToolbar
        flowName={flowName}
        isActive={isActive}
        isSaving={isSaving}
        onNameChange={setFlowName}
        onActiveToggle={setIsActive}
        onSave={saveFlow}
        onAutoLayout={handleAutoLayout}
        agentId={agentId}
      />

      <div className="flex flex-1 overflow-hidden">
        <FlowSidebar onAddNode={addNode} />
        
        <div className="flex-1 flex flex-col relative">
          <FlowCanvasWrapper
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onAddNode={addNode}
          />

          {/* Status Bar */}
          <div className="border-t bg-card px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {validation.errors.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validation.errors.length} erro(s)
                </Badge>
              )}
              {validation.warnings.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validation.warnings.length} aviso(s)
                </Badge>
              )}
              {validation.isValid && validation.warnings.length === 0 && (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Fluxo válido
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                {stats.totalNodes} nós
              </span>
              <span>•</span>
              <span>{stats.totalConnections} conexões</span>
            </div>
          </div>

          {/* Validation Messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="p-4 space-y-2">
              {validation.errors.map((error, i) => (
                <Alert key={`error-${i}`} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              ))}
              {validation.warnings.map((warning, i) => (
                <Alert key={`warning-${i}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{warning.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          
          {/* Variables Panel */}
          <div className="absolute top-4 right-4 z-10">
            <FlowVariablesPanel nodes={nodes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEditor;
