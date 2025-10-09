import { useEffect, useRef } from 'react';
import {
  Copy,
  Clipboard,
  Trash2,
  Edit,
  Palette,
  Lock,
  Unlock,
  Copy as Duplicate,
  Plus,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { nodeColorSchemes } from '@/lib/flowColorSchemes';

interface FlowContextMenuProps {
  nodeId: string;
  nodeType: string;
  isLocked?: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onToggleLock: () => void;
  onAddAfter: (type: string) => void;
  hasClipboard: boolean;
  children: React.ReactNode;
}

const nodeTypesToAdd = [
  { type: 'message', label: 'Mensagem', icon: '💬' },
  { type: 'condition', label: 'Condição', icon: '🔀' },
  { type: 'wait', label: 'Aguardar', icon: '⏱️' },
  { type: 'http', label: 'HTTP', icon: '🌐' },
  { type: 'ai', label: 'IA', icon: '🤖' },
  { type: 'variable', label: 'Variável', icon: '📝' },
  { type: 'agent', label: 'Delegar Agente', icon: '👤' },
  { type: 'end', label: 'Fim', icon: '🏁' },
];

export const FlowContextMenu = ({
  nodeId,
  nodeType,
  isLocked = false,
  onCopy,
  onPaste,
  onDuplicate,
  onEdit,
  onDelete,
  onChangeColor,
  onToggleLock,
  onAddAfter,
  hasClipboard,
  children,
}: FlowContextMenuProps) => {
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
          <span className="ml-auto text-xs text-muted-foreground">Enter</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
        </ContextMenuItem>
        
        {hasClipboard && (
          <ContextMenuItem onClick={onPaste}>
            <Clipboard className="mr-2 h-4 w-4" />
            Colar
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={onDuplicate}>
          <Duplicate className="mr-2 h-4 w-4" />
          Duplicar
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+D</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Alterar Cor
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {nodeColorSchemes.map((color) => (
              <ContextMenuItem
                key={color.value}
                onClick={() => onChangeColor(color.value)}
              >
                <div className={`w-4 h-4 rounded mr-2 bg-gradient-to-br ${color.gradient}`} />
                {color.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuItem onClick={onToggleLock}>
          {isLocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Destravar Posição
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Travar Posição
            </>
          )}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Após
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {nodeTypesToAdd.map((type) => (
              <ContextMenuItem
                key={type.type}
                onClick={() => onAddAfter(type.type)}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
          <span className="ml-auto text-xs text-muted-foreground">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
