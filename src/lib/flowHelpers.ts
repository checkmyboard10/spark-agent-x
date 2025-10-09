import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

// Re-export from flowValidation for backwards compatibility
export { validateFlowAdvanced as validateFlow } from './flowValidation';

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
    conditionNodes: nodes.filter(n => n.type === 'condition').length,
    waitNodes: nodes.filter(n => n.type === 'wait').length,
    httpNodes: nodes.filter(n => n.type === 'http').length,
    aiNodes: nodes.filter(n => n.type === 'ai').length,
    variableNodes: nodes.filter(n => n.type === 'variable').length,
  };
};
