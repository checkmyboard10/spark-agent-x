import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node } from '@xyflow/react';
import { FlowToolbar } from '@/components/flow/FlowToolbar';
import { FlowSidebar } from '@/components/flow/FlowSidebar';
import { FlowCanvasWrapper } from '@/components/flow/FlowCanvas';
import { FlowVariablesPanel } from '@/components/flow/FlowVariablesPanel';
import { FlowTestPanel } from '@/components/flow/FlowTestPanel';
import { FlowExecutionsList } from '@/components/flow/FlowExecutionsList';
import { FlowExecutionViewer } from '@/components/flow/FlowExecutionViewer';
import { FlowSelectionToolbar } from '@/components/flow/FlowSelectionToolbar';
import { FlowQuickActions } from '@/components/flow/FlowQuickActions';
import { FlowSearchPanel } from '@/components/flow/FlowSearchPanel';
import { FlowStatsCard } from '@/components/flow/FlowStatsCard';
import { NodeEditDialog } from '@/components/flow/NodeEditDialog';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { useFlowSelection } from '@/hooks/useFlowSelection';
import { autoLayout, validateFlow, getNodeStats } from '@/lib/flowHelpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FlowEditor = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  if (!flowId) {
    return <div>Flow ID não fornecido</div>;
  }

  const {
    nodes,
    edges,
    flowName,
    isActive,
    isSaving,
    isLoading,
    lastSaved,
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
    deleteSelectedNodes,
  } = useFlowEditor(flowId);

  const selection = useFlowSelection({ nodes, setNodes });

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setNodes(nodes.map(n => ({ ...n, selected: true })));
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedNodes, pasteNodes, duplicateSelectedNodes, saveFlow, deleteSelectedNodes, nodes, setNodes]);

  const handleAutoLayout = () => {
    const layoutedNodes = autoLayout(nodes, edges);
    setNodes(layoutedNodes);
  };

  const handleFocusNode = (nodeId: string) => {
    setNodes(nodes.map(n => ({ ...n, selected: n.id === nodeId })));
  };

  const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setEditingNode(node);
    setDialogOpen(true);
  };

  const handleSaveNode = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...data } }
          : n
      )
    );
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
        lastSaved={lastSaved}
        onNameChange={setFlowName}
        onActiveToggle={setIsActive}
        onSave={saveFlow}
        onAutoLayout={handleAutoLayout}
      />

      <div className="flex flex-1 overflow-hidden">
        <FlowSidebar onAddNode={addNode} />
        
        <div className="flex-1 flex flex-col relative">
          {/* Selection Toolbar */}
          <FlowSelectionToolbar
            selectedCount={selection.selectedCount}
            onAlignLeft={selection.alignLeft}
            onAlignCenter={selection.alignCenter}
            onAlignRight={selection.alignRight}
            onAlignTop={selection.alignTop}
            onAlignMiddle={selection.alignMiddle}
            onAlignBottom={selection.alignBottom}
            onDistributeHorizontal={selection.distributeHorizontal}
            onDistributeVertical={selection.distributeVertical}
            onCopy={copySelectedNodes}
            onDelete={deleteSelectedNodes}
          />

          {/* Quick Actions */}
          <FlowQuickActions
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            onExport={() => {}}
            onSave={saveFlow}
            isSaving={isSaving}
          />

          {/* Search Panel */}
          {showSearch && (
            <div className="absolute top-20 left-4 z-20">
              <FlowSearchPanel
                nodes={nodes}
                onFocusNode={handleFocusNode}
                onClose={() => setShowSearch(false)}
              />
            </div>
          )}

          {/* Stats Card - Moved to right side */}
          <div className="absolute bottom-4 right-4 z-10 w-80">
            <FlowStatsCard nodes={nodes} edges={edges} />
          </div>

          <FlowCanvasWrapper
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onAddNode={addNode}
            onAutoLayout={handleAutoLayout}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            setNodes={setNodes}
            onNodeDoubleClick={handleNodeDoubleClick}
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
                  Flow válido
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
          <div className="absolute top-4 right-4 z-10 flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <FlowVariablesPanel nodes={nodes} />
          </div>

          {/* Right Panel - Test & Executions */}
          <div className="absolute top-4 right-80 bottom-4 w-96 z-10">
            <Tabs defaultValue="test" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="test">Testar</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
              <TabsContent value="test" className="h-[calc(100%-40px)] overflow-auto">
                {flowId && <FlowTestPanel flowId={flowId} />}
              </TabsContent>
              <TabsContent value="history" className="h-[calc(100%-40px)] overflow-auto">
                {flowId && selectedExecutionId ? (
                  <FlowExecutionViewer executionId={selectedExecutionId} />
                ) : (
                  flowId && <FlowExecutionsList 
                    flowId={flowId} 
                    onViewExecution={setSelectedExecutionId}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Node Edit Dialog */}
      <NodeEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        node={editingNode}
        onSave={handleSaveNode}
      />
    </div>
  );
};

export default FlowEditor;
