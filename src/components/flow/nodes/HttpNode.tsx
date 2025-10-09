import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { HttpNodeData } from '@/types/flow';

const HttpNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as HttpNodeData;
  
  const methodColors = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500',
  };
  
  return (
    <div className={`px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 border-2 border-purple-400 min-w-[220px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-300 border-2 border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wide">HTTP Request</div>
          <div className="text-sm font-bold text-white">{nodeData.label || 'API Call'}</div>
        </div>
      </div>
      
      {nodeData.method && (
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${methodColors[nodeData.method] || 'bg-gray-500'}`}>
            {nodeData.method}
          </span>
          {nodeData.url && (
            <span className="text-xs text-white/90 truncate flex-1 font-mono">
              {nodeData.url.length > 25 ? nodeData.url.substring(0, 25) + '...' : nodeData.url}
            </span>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="w-3 h-3 !bg-green-400 border-2 border-white"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        className="w-3 h-3 !bg-red-400 border-2 border-white"
        style={{ left: '70%' }}
      />
    </div>
  );
};

export default memo(HttpNode);
