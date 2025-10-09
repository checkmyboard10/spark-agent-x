import StartNode from './StartNode';
import EndNode from './EndNode';
import MessageNode from './MessageNode';
import ConditionNode from './ConditionNode';
import WaitNode from './WaitNode';
import HttpNode from './HttpNode';
import AiNode from './AiNode';
import VariableNode from './VariableNode';

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  message: MessageNode,
  condition: ConditionNode,
  wait: WaitNode,
  http: HttpNode,
  ai: AiNode,
  variable: VariableNode,
};

export { 
  StartNode, 
  EndNode, 
  MessageNode, 
  ConditionNode, 
  WaitNode, 
  HttpNode, 
  AiNode, 
  VariableNode 
};
