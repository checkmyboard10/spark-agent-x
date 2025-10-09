import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

export const validateFlow = (nodes: Node[], edges: Edge[]) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push('O fluxo precisa ter um nó de Início');
  } else if (startNodes.length > 1) {
    warnings.push('O fluxo tem mais de um nó de Início');
  }

  // Check for end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    warnings.push('Recomendado: adicione pelo menos um nó de Fim');
  }

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const disconnectedNodes = nodes.filter(
    n => n.type !== 'start' && !connectedNodeIds.has(n.id)
  );
  
  if (disconnectedNodes.length > 0) {
    warnings.push(`${disconnectedNodes.length} nó(s) desconectado(s)`);
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

export const autoLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 50,
      },
    };
  });
};

export const getNodeStats = (nodes: Node[], edges: Edge[]) => {
  return {
    totalNodes: nodes.length,
    totalConnections: edges.length,
    startNodes: nodes.filter(n => n.type === 'start').length,
    endNodes: nodes.filter(n => n.type === 'end').length,
    messageNodes: nodes.filter(n => n.type === 'message').length,
  };
};
