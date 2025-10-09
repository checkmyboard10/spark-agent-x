import { useState, useCallback } from 'react';
import { FlowVariable } from '@/types/flow';
import { Node } from '@xyflow/react';

const SYSTEM_VARIABLES: FlowVariable[] = [
  { name: 'contact.name', type: 'string', category: 'system', description: 'Nome do contato' },
  { name: 'contact.phone', type: 'string', category: 'system', description: 'Telefone do contato' },
  { name: 'agent.name', type: 'string', category: 'system', description: 'Nome do agente' },
  { name: 'conversation.id', type: 'string', category: 'system', description: 'ID da conversa' },
  { name: 'current.time', type: 'string', category: 'system', description: 'Hora atual' },
  { name: 'current.date', type: 'string', category: 'system', description: 'Data atual' },
];

export const useFlowVariables = (nodes: Node[]) => {
  const [customVariables, setCustomVariables] = useState<FlowVariable[]>([]);

  // Detectar variáveis capturadas automaticamente dos nós
  const getCapturedVariables = useCallback((): FlowVariable[] => {
    const captured: FlowVariable[] = [];
    
    nodes.forEach(node => {
      if (node.type === 'ai' && node.data?.saveResponseTo && typeof node.data.saveResponseTo === 'string') {
        captured.push({
          name: node.data.saveResponseTo,
          type: 'string',
          category: 'captured',
          description: `Resposta gerada pelo nó ${typeof node.data.label === 'string' ? node.data.label : 'IA'}`,
          usedIn: [node.id],
        });
      }
      
      if (node.type === 'http' && node.data?.saveResponseTo && typeof node.data.saveResponseTo === 'string') {
        captured.push({
          name: node.data.saveResponseTo,
          type: 'object',
          category: 'captured',
          description: `Resposta HTTP do nó ${typeof node.data.label === 'string' ? node.data.label : 'HTTP'}`,
          usedIn: [node.id],
        });
      }
      
      if (node.type === 'variable' && node.data?.variableName && typeof node.data.variableName === 'string') {
        captured.push({
          name: node.data.variableName,
          type: 'string',
          category: 'captured',
          description: `Definida pelo nó ${typeof node.data.label === 'string' ? node.data.label : 'Variável'}`,
          usedIn: [node.id],
        });
      }
    });
    
    // Remover duplicatas
    return captured.filter((v, i, arr) => 
      arr.findIndex(t => t.name === v.name) === i
    );
  }, [nodes]);

  // Todas as variáveis disponíveis
  const getAllVariables = useCallback((): FlowVariable[] => {
    return [...SYSTEM_VARIABLES, ...getCapturedVariables(), ...customVariables];
  }, [customVariables, getCapturedVariables]);

  // Adicionar variável customizada
  const addCustomVariable = useCallback((variable: Omit<FlowVariable, 'category'>) => {
    setCustomVariables(prev => [...prev, { ...variable, category: 'custom' }]);
  }, []);

  // Remover variável customizada
  const removeCustomVariable = useCallback((name: string) => {
    setCustomVariables(prev => prev.filter(v => v.name !== name));
  }, []);

  // Atualizar variável customizada
  const updateCustomVariable = useCallback((name: string, updates: Partial<FlowVariable>) => {
    setCustomVariables(prev => 
      prev.map(v => v.name === name ? { ...v, ...updates } : v)
    );
  }, []);

  // Verificar se variável existe
  const variableExists = useCallback((name: string): boolean => {
    return getAllVariables().some(v => v.name === name);
  }, [getAllVariables]);

  // Encontrar variáveis usadas mas não definidas
  const getUndefinedVariables = useCallback((): string[] => {
    const defined = getAllVariables().map(v => v.name);
    const used = new Set<string>();
    
    nodes.forEach(node => {
      const data = node.data;
      
      // Procurar por {{variavel}} em strings
      const checkString = (str: string) => {
        const matches = str.match(/\{\{([^}]+)\}\}/g);
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace(/\{\{|\}\}/g, '').trim();
            used.add(varName);
          });
        }
      };
      
      if (typeof data === 'object') {
        Object.values(data).forEach(value => {
          if (typeof value === 'string') checkString(value);
        });
      }
      
      // Variáveis específicas de cada nó
      if (node.type === 'condition' && data?.variable && typeof data.variable === 'string') {
        used.add(data.variable);
      }
    });
    
    return Array.from(used).filter(varName => !defined.includes(varName));
  }, [nodes, getAllVariables]);

  return {
    systemVariables: SYSTEM_VARIABLES,
    capturedVariables: getCapturedVariables(),
    customVariables,
    allVariables: getAllVariables(),
    addCustomVariable,
    removeCustomVariable,
    updateCustomVariable,
    variableExists,
    undefinedVariables: getUndefinedVariables(),
  };
};
