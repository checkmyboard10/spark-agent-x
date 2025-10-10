import { Node, Edge } from '@xyflow/react';

// Tipos de nós
export type NodeType = 'start' | 'end' | 'message' | 'condition' | 'wait' | 'http' | 'ai' | 'variable' | 'agent';

// Operadores para condições
export type ConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';

// Tipos de variáveis
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object';

// Categoria de variáveis
export type VariableCategory = 'system' | 'captured' | 'custom';

// Configuração de cada tipo de nó
export interface MessageNodeData {
  label: string;
  message: string;
  type: 'text' | 'template' | 'media';
  templateId?: string;
  mediaUrl?: string;
  color?: string;
}

export interface ConditionNodeData {
  label: string;
  variable: string;
  operator: ConditionOperator;
  value: string | number;
  color?: string;
}

export interface WaitNodeData {
  label: string;
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
  color?: string;
}

export interface HttpNodeData {
  label: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  saveResponseTo: string;
  color?: string;
}

export interface AiNodeData {
  label: string;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  saveResponseTo: string;
  color?: string;
}

export interface VariableNodeData {
  label: string;
  variableName: string;
  operation: 'set' | 'increment' | 'append' | 'clear';
  value: string;
  color?: string;
}

export interface StartNodeData {
  label: string;
  trigger: 'first_message' | 'keyword' | 'new_conversation';
  keyword?: string;
}

export interface EndNodeData {
  label: string;
  action: 'mark_resolved' | 'add_tag' | 'transfer_human' | 'webhook';
  actionConfig?: {
    tag?: string;
    webhookUrl?: string;
  };
}

export interface AgentNodeData {
  label: string;
  agentId?: string;
  agentName?: string;
  maxTurns?: number;
  handoffCondition?: string;
  contextVariables?: string[];
  color?: string;
}

// Variável do flow
export interface FlowVariable {
  name: string;
  type: VariableType;
  category: VariableCategory;
  defaultValue?: any;
  description?: string;
  usedIn?: string[]; // IDs dos nós que usam esta variável
}

// Dados de qualquer nó
export type NodeData = 
  | MessageNodeData 
  | ConditionNodeData 
  | WaitNodeData 
  | HttpNodeData 
  | AiNodeData 
  | VariableNodeData
  | StartNodeData
  | EndNodeData
  | AgentNodeData;

// Erro/Warning de validação
export interface ValidationIssue {
  type: 'error' | 'warning';
  nodeId?: string;
  message: string;
  code: string;
}

// Resultado de validação
export interface ValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  isValid: boolean;
}

// Dados do clipboard
export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}
