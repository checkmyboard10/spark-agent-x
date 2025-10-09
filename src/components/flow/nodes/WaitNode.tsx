import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { WaitNodeData } from '@/types/flow';
import { getColorScheme } from '@/lib/flowColorSchemes';

const WaitNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WaitNodeData;
  const colorScheme = getColorScheme(nodeData.color);
  
  const formatDuration = () => {
    const { duration, unit } = nodeData;
    if (!duration) return 'Configurar tempo';
    
    const labels = {
      seconds: duration === 1 ? 'segundo' : 'segundos',
      minutes: duration === 1 ? 'minuto' : 'minutos',
      hours: duration === 1 ? 'hora' : 'horas',
      days: duration === 1 ? 'dia' : 'dias',
    };
    
    return `${duration} ${labels[unit] || unit}`;
  };
  
  return (
    <div className={`px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br ${colorScheme.gradient} border-2 ${colorScheme.border} min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-300 border-2 border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Esperar</div>
          <div className="text-sm font-bold text-white">{nodeData.label || 'Aguardar'}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-white/90 bg-black/20 px-2 py-1 rounded text-center">
        ⏱️ {formatDuration()}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-300 border-2 border-white"
      />
    </div>
  );
};

export default memo(WaitNode);
