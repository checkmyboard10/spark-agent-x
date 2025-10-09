import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { ConditionNodeData } from '@/types/flow';

const ConditionNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ConditionNodeData;
  
  return (
    <div className={`relative ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-300 border-2 border-white"
      />
      
      <div className="px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-400 min-w-[220px] transform rotate-45">
        <div className="transform -rotate-45">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Condição</div>
              <div className="text-sm font-bold text-white">{nodeData.label || 'Se/Senão'}</div>
            </div>
          </div>
          {nodeData.variable && (
            <div className="mt-2 text-xs text-white/90 font-mono bg-black/20 px-2 py-1 rounded">
              {nodeData.variable} {nodeData.operator} {nodeData.value}
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="w-3 h-3 !bg-green-400 border-2 border-white"
        style={{ top: '30%' }}
      />
      <div className="absolute right-[-50px] top-[25%] text-xs font-semibold text-green-600">
        Sim
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 !bg-red-400 border-2 border-white"
      />
      <div className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 text-xs font-semibold text-red-600">
        Não
      </div>
    </div>
  );
};

export default memo(ConditionNode);
