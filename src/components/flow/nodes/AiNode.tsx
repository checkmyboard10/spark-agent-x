import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { AiNodeData } from '@/types/flow';

const AiNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as AiNodeData;
  
  return (
    <div className={`px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 border-2 border-pink-400 min-w-[220px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-pink-300 border-2 border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">IA Response</div>
          <div className="text-sm font-bold text-white">{nodeData.label || 'Gerar Resposta'}</div>
        </div>
      </div>
      
      {nodeData.model && (
        <div className="mt-2 text-xs text-white/90 bg-black/20 px-2 py-1 rounded font-mono">
          🤖 {nodeData.model}
        </div>
      )}
      
      {nodeData.saveResponseTo && (
        <div className="mt-1 text-[10px] text-white/70">
          → salvar em: {nodeData.saveResponseTo}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-pink-300 border-2 border-white"
      />
    </div>
  );
};

export default memo(AiNode);
