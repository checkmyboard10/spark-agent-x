import { Node, Edge } from '@xyflow/react';
import { ValidationResult, ValidationIssue } from '@/types/flow';

export const validateFlowAdvanced = (nodes: Node[], edges: Edge[]): ValidationResult => {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Check for start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'O flow precisa ter um nó de Início',
      code: 'NO_START_NODE',
    });
  } else if (startNodes.length > 1) {
    warnings.push({
      type: 'warning',
      message: 'O flow tem mais de um nó de Início',
      code: 'MULTIPLE_START_NODES',
    });
  }

  // Check for end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'Recomendado: adicione pelo menos um nó de Fim',
      code: 'NO_END_NODE',
    });
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
    disconnectedNodes.forEach(node => {
      warnings.push({
        type: 'warning',
        nodeId: node.id,
        message: `Nó "${node.data?.label || node.type}" está desconectado`,
        code: 'DISCONNECTED_NODE',
      });
    });
  }

  // Check condition nodes have both outputs
  nodes.filter(n => n.type === 'condition').forEach(node => {
    const yesEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'yes');
    const noEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'no');
    
    if (!yesEdge || !noEdge) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `Condição "${node.data?.label || 'Sem nome'}" precisa ter saídas SIM e NÃO conectadas`,
        code: 'INCOMPLETE_CONDITION',
      });
    }
  });

  // Check HTTP nodes have error handling
  nodes.filter(n => n.type === 'http').forEach(node => {
    const errorEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'error');
    
    if (!errorEdge) {
      warnings.push({
        type: 'warning',
        nodeId: node.id,
        message: `HTTP "${node.data?.label || 'Sem nome'}" deveria ter tratamento de erro`,
        code: 'NO_HTTP_ERROR_HANDLING',
      });
    }
  });

  // Detect dead ends (nodes that don't eventually reach an end node)
  const detectDeadEnds = () => {
    const visited = new Set<string>();
    const reachesEnd = new Set<string>();
    
    // Mark all end nodes as reaching end
    endNodes.forEach(node => reachesEnd.add(node.id));
    
    // Work backwards from end nodes
    const queue = [...endNodes.map(n => n.id)];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      visited.add(currentId);
      
      // Find all edges pointing to this node
      const incomingEdges = edges.filter(e => e.target === currentId);
      incomingEdges.forEach(edge => {
        if (!visited.has(edge.source)) {
          reachesEnd.add(edge.source);
          queue.push(edge.source);
        }
      });
    }
    
    // Any connected node that doesn't reach end is a dead end
    nodes.forEach(node => {
      if (node.type !== 'end' && connectedNodeIds.has(node.id) && !reachesEnd.has(node.id)) {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: `Nó "${node.data?.label || node.type}" não leva a um fim`,
          code: 'DEAD_END',
        });
      }
    });
  };
  
  if (endNodes.length > 0 && nodes.length > 2) {
    detectDeadEnds();
  }

  // Check for very long waits
  nodes.filter(n => n.type === 'wait').forEach(node => {
    const { duration, unit } = node.data || {};
    if (!duration || typeof duration !== 'number') return;
    
    const totalSeconds = 
      unit === 'days' ? duration * 86400 :
      unit === 'hours' ? duration * 3600 :
      unit === 'minutes' ? duration * 60 :
      duration;
    
    if (totalSeconds > 86400) { // > 1 day
      warnings.push({
        type: 'warning',
        nodeId: node.id,
        message: `Espera de ${duration} ${unit} é muito longa`,
        code: 'LONG_WAIT',
      });
    }
  });

  // Check for missing variable configurations
  nodes.filter(n => n.type === 'condition').forEach(node => {
    if (!node.data?.variable || !node.data?.operator || node.data?.value === undefined) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `Condição "${node.data?.label || 'Sem nome'}" precisa ser configurada`,
        code: 'INCOMPLETE_CONFIG',
      });
    }
  });

  nodes.filter(n => n.type === 'http').forEach(node => {
    if (!node.data?.url || !node.data?.method) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `HTTP "${node.data?.label || 'Sem nome'}" precisa de URL e método`,
        code: 'INCOMPLETE_CONFIG',
      });
    }
  });

  nodes.filter(n => n.type === 'ai').forEach(node => {
    if (!node.data?.model || !node.data?.prompt) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `IA "${node.data?.label || 'Sem nome'}" precisa de modelo e prompt`,
        code: 'INCOMPLETE_CONFIG',
      });
    }
  });

  nodes.filter(n => n.type === 'variable').forEach(node => {
    if (!node.data?.variableName) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `Variável "${node.data?.label || 'Sem nome'}" precisa de nome`,
        code: 'INCOMPLETE_CONFIG',
      });
    }
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
  };
};
