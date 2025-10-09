import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StopCircle } from 'lucide-react';

const EndNode = ({ data }: NodeProps) => {
  return (
    <div className="px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-red-500 to-rose-600 border-2 border-red-400 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-300 border-2 border-white"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <StopCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Fim</div>
          <div className="text-sm font-bold text-white">{(data.label as string) || 'Fim do Fluxo'}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(EndNode);
