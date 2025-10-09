import { Node, Edge } from '@xyflow/react';
import { ClipboardData } from '@/types/flow';

const CLIPBOARD_KEY = 'flow-editor-clipboard';

export const copyNodesToClipboard = (nodes: Node[], edges: Edge[]): void => {
  // Filtrar apenas as edges que conectam nós selecionados
  const nodeIds = nodes.map(n => n.id);
  const relevantEdges = edges.filter(
    e => nodeIds.includes(e.source) && nodeIds.includes(e.target)
  );
  
  const clipboardData: ClipboardData = {
    nodes,
    edges: relevantEdges,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

export const pasteNodesFromClipboard = (): ClipboardData | null => {
  try {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as ClipboardData;
  } catch (error) {
    console.error('Failed to paste from clipboard:', error);
    return null;
  }
};

export const generateNewIds = (data: ClipboardData): ClipboardData => {
  const idMap = new Map<string, string>();
  
  // Gerar novos IDs para todos os nós
  data.nodes.forEach(node => {
    idMap.set(node.id, `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  });
  
  // Atualizar IDs dos nós
  const newNodes = data.nodes.map(node => ({
    ...node,
    id: idMap.get(node.id) || node.id,
    position: {
      x: node.position.x + 50, // Offset para não colar em cima
      y: node.position.y + 50,
    },
    selected: true,
  }));
  
  // Atualizar IDs nas edges
  const newEdges = data.edges.map(edge => ({
    ...edge,
    id: `e${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
  }));
  
  return {
    nodes: newNodes,
    edges: newEdges,
    timestamp: Date.now(),
  };
};

export const hasClipboardData = (): boolean => {
  return localStorage.getItem(CLIPBOARD_KEY) !== null;
};
