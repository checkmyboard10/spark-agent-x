import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { alignNodes, distributeNodes } from '@/lib/flowAlignment';

interface UseFlowSelectionProps {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
}

export const useFlowSelection = ({ nodes, setNodes }: UseFlowSelectionProps) => {
  const getSelectedNodes = useCallback(() => {
    return nodes.filter(node => node.selected);
  }, [nodes]);

  const alignLeft = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.left(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const alignCenter = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.center(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const alignRight = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.right(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const alignTop = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.top(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const alignMiddle = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.middle(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const alignBottom = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;
    
    const aligned = alignNodes.bottom(selected);
    setNodes(nodes.map(node => 
      aligned.find(a => a.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const distributeHorizontal = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 3) return;
    
    const distributed = distributeNodes.horizontal(selected);
    setNodes(nodes.map(node => 
      distributed.find(d => d.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  const distributeVertical = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length < 3) return;
    
    const distributed = distributeNodes.vertical(selected);
    setNodes(nodes.map(node => 
      distributed.find(d => d.id === node.id) || node
    ));
  }, [nodes, setNodes, getSelectedNodes]);

  return {
    selectedCount: getSelectedNodes().length,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    distributeHorizontal,
    distributeVertical,
  };
};
