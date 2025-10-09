import { Node, Edge } from '@xyflow/react';
import { 
  MessageNodeData, 
  ConditionNodeData, 
  WaitNodeData, 
  HttpNodeData, 
  AiNodeData, 
  VariableNodeData 
} from '@/types/flow';

export interface ExecutionContext {
  flowId: string;
  conversationId: string;
  variables: Record<string, any>;
  currentNodeId: string;
  executionLog: ExecutionLogEntry[];
  status: 'running' | 'paused' | 'completed' | 'failed';
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeType: string;
  timestamp: string;
  input: any;
  output: any;
  duration: number;
  error?: string;
}

export class FlowEngine {
  private nodes: Node[];
  private edges: Edge[];
  private context: ExecutionContext;

  constructor(
    nodes: Node[], 
    edges: Edge[], 
    conversationId: string, 
    flowId: string,
    initialVariables: Record<string, any> = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = {
      flowId,
      conversationId,
      variables: initialVariables,
      currentNodeId: '',
      executionLog: [],
      status: 'running'
    };
  }

  getContext(): ExecutionContext {
    return { ...this.context };
  }

  findStartNode(): Node | undefined {
    return this.nodes.find(n => n.type === 'start');
  }

  findNextNode(currentNodeId: string, outputKey?: string): Node | undefined {
    const edge = this.edges.find(e => {
      if (outputKey) {
        return e.source === currentNodeId && e.sourceHandle === outputKey;
      }
      return e.source === currentNodeId;
    });

    if (!edge) return undefined;
    return this.nodes.find(n => n.id === edge.target);
  }

  addLogEntry(entry: Omit<ExecutionLogEntry, 'timestamp'>) {
    this.context.executionLog.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
  }

  updateVariable(name: string, value: any) {
    this.context.variables[name] = value;
  }

  getVariable(name: string): any {
    return this.context.variables[name];
  }

  interpolateVariables(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const value = this.getVariable(varName.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  evaluateCondition(condition: ConditionNodeData): boolean {
    const varValue = this.getVariable(condition.variable);
    const compareValue = condition.value;

    switch (condition.operator) {
      case '==':
        return varValue == compareValue;
      case '!=':
        return varValue != compareValue;
      case '>':
        return Number(varValue) > Number(compareValue);
      case '<':
        return Number(varValue) < Number(compareValue);
      case '>=':
        return Number(varValue) >= Number(compareValue);
      case '<=':
        return Number(varValue) <= Number(compareValue);
      case 'contains':
        return String(varValue).includes(String(compareValue));
      case 'startsWith':
        return String(varValue).startsWith(String(compareValue));
      case 'endsWith':
        return String(varValue).endsWith(String(compareValue));
      default:
        return false;
    }
  }

  setStatus(status: ExecutionContext['status']) {
    this.context.status = status;
  }

  setCurrentNode(nodeId: string) {
    this.context.currentNodeId = nodeId;
  }
}
