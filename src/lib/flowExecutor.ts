import { Node } from '@xyflow/react';
import { FlowEngine } from './flowEngine';
import { 
  MessageNodeData, 
  ConditionNodeData, 
  WaitNodeData, 
  HttpNodeData, 
  AiNodeData, 
  VariableNodeData 
} from '@/types/flow';

export interface NodeExecutor {
  execute(node: Node, engine: FlowEngine): Promise<{ 
    success: boolean; 
    output?: any; 
    nextNodeId?: string;
    pause?: boolean;
  }>;
}

export class MessageNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as MessageNodeData;
    
    try {
      const interpolatedMessage = engine.interpolateVariables(data.message);
      
      // Aqui integraria com send-whatsapp-message
      console.log('Sending message:', interpolatedMessage);
      
      const duration = Date.now() - startTime;
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'message',
        input: data.message,
        output: interpolatedMessage,
        duration
      });

      return { success: true, output: interpolatedMessage };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'message',
        input: data.message,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    }
  }
}

export class ConditionNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as ConditionNodeData;
    
    try {
      const result = engine.evaluateCondition(data);
      const outputKey = result ? 'yes' : 'no';
      
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'condition',
        input: { variable: data.variable, operator: data.operator, value: data.value },
        output: { result, branch: outputKey },
        duration: Date.now() - startTime
      });

      const nextNode = engine.findNextNode(node.id, outputKey);
      return { 
        success: true, 
        output: result,
        nextNodeId: nextNode?.id
      };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'condition',
        input: data,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    }
  }
}

export class WaitNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as WaitNodeData;
    
    try {
      let milliseconds = data.duration;
      switch (data.unit) {
        case 'seconds':
          milliseconds *= 1000;
          break;
        case 'minutes':
          milliseconds *= 60000;
          break;
        case 'hours':
          milliseconds *= 3600000;
          break;
        case 'days':
          milliseconds *= 86400000;
          break;
      }

      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'wait',
        input: { duration: data.duration, unit: data.unit },
        output: { milliseconds },
        duration: Date.now() - startTime
      });

      // Pausar execução - será retomada depois
      return { 
        success: true, 
        output: { pauseUntil: Date.now() + milliseconds },
        pause: true
      };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'wait',
        input: data,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    }
  }
}

export class HttpNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as HttpNodeData;
    
    try {
      const url = engine.interpolateVariables(data.url);
      const body = data.body ? engine.interpolateVariables(data.body) : undefined;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), data.timeout || 30000);

      const response = await fetch(url, {
        method: data.method,
        headers: data.headers || {},
        body: body ? JSON.stringify(JSON.parse(body)) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();
      
      if (data.saveResponseTo) {
        engine.updateVariable(data.saveResponseTo, responseData);
      }

      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'http',
        input: { url, method: data.method, body },
        output: { status: response.status, data: responseData },
        duration: Date.now() - startTime
      });

      const nextNode = response.ok 
        ? engine.findNextNode(node.id, 'success')
        : engine.findNextNode(node.id, 'error');

      return { 
        success: response.ok, 
        output: responseData,
        nextNodeId: nextNode?.id
      };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'http',
        input: data,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      const errorNode = engine.findNextNode(node.id, 'error');
      return { 
        success: false,
        nextNodeId: errorNode?.id
      };
    }
  }
}

export class AiNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as AiNodeData;
    
    try {
      const prompt = engine.interpolateVariables(data.prompt);
      
      // Aqui integraria com Lovable AI via edge function
      console.log('Calling AI with prompt:', prompt);
      
      // Simulação de resposta
      const aiResponse = `AI response to: ${prompt}`;
      
      if (data.saveResponseTo) {
        engine.updateVariable(data.saveResponseTo, aiResponse);
      }

      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'ai',
        input: { prompt, model: data.model },
        output: aiResponse,
        duration: Date.now() - startTime
      });

      return { success: true, output: aiResponse };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'ai',
        input: data,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    }
  }
}

export class VariableNodeExecutor implements NodeExecutor {
  async execute(node: Node, engine: FlowEngine) {
    const startTime = Date.now();
    const data = node.data as unknown as VariableNodeData;
    
    try {
      const currentValue = engine.getVariable(data.variableName);
      let newValue: any;

      switch (data.operation) {
        case 'set':
          newValue = engine.interpolateVariables(data.value);
          break;
        case 'increment':
          newValue = (Number(currentValue) || 0) + Number(data.value);
          break;
        case 'append':
          newValue = String(currentValue || '') + String(data.value);
          break;
        case 'clear':
          newValue = null;
          break;
        default:
          newValue = data.value;
      }

      engine.updateVariable(data.variableName, newValue);

      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'variable',
        input: { name: data.variableName, operation: data.operation, value: data.value },
        output: { oldValue: currentValue, newValue },
        duration: Date.now() - startTime
      });

      return { success: true, output: newValue };
    } catch (error) {
      engine.addLogEntry({
        nodeId: node.id,
        nodeType: 'variable',
        input: data,
        output: null,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    }
  }
}

export class NodeExecutorFactory {
  static getExecutor(nodeType: string): NodeExecutor {
    switch (nodeType) {
      case 'message':
        return new MessageNodeExecutor();
      case 'condition':
        return new ConditionNodeExecutor();
      case 'wait':
        return new WaitNodeExecutor();
      case 'http':
        return new HttpNodeExecutor();
      case 'ai':
        return new AiNodeExecutor();
      case 'variable':
        return new VariableNodeExecutor();
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }
}
