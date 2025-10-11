import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

const StartNode = ({ data }: NodeProps) => {
  return (
    <div className="px-6 py-4 shadow-elegant rounded-lg bg-gradient-to-br from-[hsl(155,85%,45%)] to-[hsl(155,85%,60%)] border-2 border-[hsl(155,85%,60%)] min-w-[180px] transition-all duration-300 hover:shadow-glow">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <Play className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Início</div>
          <div className="text-sm font-bold text-white">{(data.label as string) || 'Início do Flow'}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-[hsl(155,85%,60%)] border-2 border-white"
      />
    </div>
  );
};

export default memo(StartNode);
