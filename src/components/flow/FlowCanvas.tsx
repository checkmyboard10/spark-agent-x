import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { FlowCanvasContextMenu } from './FlowCanvasContextMenu';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
  onAutoLayout: () => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  setNodes?: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
}

export const FlowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onAutoLayout,
  showGrid = true,
  snapToGrid = false,
  setNodes,
}: FlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleChangeColor = useCallback((nodeId: string, color: string) => {
    if (setNodes) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, color } }
            : node
        )
      );
      toast.success('Cor alterada');
    }
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) {
        console.warn('No node type in drag data');
        return;
      }

      if (!reactFlowInstance.current) {
        console.warn('ReactFlow instance not ready');
        return;
      }

      try {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        console.log('Dropping node', type, 'at position', position);
        onAddNode(type, position);
      } catch (error) {
        console.error('Error dropping node:', error);
      }
    },
    [onAddNode]
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!reactFlowInstance.current) return;
    
    const position = reactFlowInstance.current.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setClickPosition(position);
  }, []);

  const handlePaste = useCallback((position: { x: number; y: number }) => {
    // Implementado via useFlowEditor
  }, []);

  const handleExportImage = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    toPng(reactFlowWrapper.current, {
      backgroundColor: '#fff',
      width: reactFlowWrapper.current.offsetWidth,
      height: reactFlowWrapper.current.offsetHeight,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'flow-diagram.png';
        link.href = dataUrl;
        link.click();
        toast.success('Imagem exportada com sucesso!');
      })
      .catch(() => {
        toast.error('Erro ao exportar imagem');
      });
  }, []);

  const handleClearSelection = useCallback(() => {
    onNodesChange(
      nodes.map((node) => ({
        id: node.id,
        type: 'select',
        selected: false,
      }))
    );
  }, [nodes, onNodesChange]);

  return (
    <FlowCanvasContextMenu
      onAddNode={onAddNode}
      onPaste={handlePaste}
      onZoomIn={() => zoomIn()}
      onZoomOut={() => zoomOut()}
      onFitView={() => fitView()}
      onAutoLayout={onAutoLayout}
      onExportImage={handleExportImage}
      onClearSelection={handleClearSelection}
      hasClipboard={false}
      clickPosition={clickPosition}
    >
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={snapToGrid}
          snapGrid={[15, 15]}
          attributionPosition="bottom-left"
          selectionOnDrag
          panOnDrag={[1, 2]} // middle and right mouse button
          selectNodesOnDrag={true}
        >
          <Background gap={showGrid ? 16 : 0} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'start':
                  return '#10b981';
                case 'end':
                  return '#ef4444';
                case 'message':
                  return '#3b82f6';
                case 'agent':
                  return '#a855f7';
                default:
                  return '#6b7280';
              }
            }}
            nodeBorderRadius={8}
          />
        </ReactFlow>
      </div>
    </FlowCanvasContextMenu>
  );
};

export const FlowCanvasWrapper = (props: FlowCanvasProps) => (
  <ReactFlowProvider>
    <FlowCanvas {...props} />
  </ReactFlowProvider>
);
