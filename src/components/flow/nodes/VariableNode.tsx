import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Variable } from 'lucide-react';
import { VariableNodeData } from '@/types/flow';

const VariableNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as VariableNodeData;
  
  const operationLabels = {
    set: 'Definir',
    increment: 'Incrementar',
    append: 'Adicionar',
    clear: 'Limpar',
  };
  
  return (
    <div className={`px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 border-2 border-teal-400 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-teal-300 border-2 border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <Variable className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Variável</div>
          <div className="text-sm font-bold text-white">{nodeData.label || 'Definir Variável'}</div>
        </div>
      </div>
      
      {nodeData.variableName && (
        <div className="mt-2 text-xs text-white/90 bg-black/20 px-2 py-1 rounded">
          <span className="font-semibold">{operationLabels[nodeData.operation]}</span>
          <span className="font-mono ml-1">{`{{${nodeData.variableName}}}`}</span>
          {nodeData.operation !== 'clear' && nodeData.value && (
            <span className="ml-1">= {nodeData.value}</span>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-teal-300 border-2 border-white"
      />
    </div>
  );
};

export default memo(VariableNode);
