import {
  Plus,
  Clipboard,
  ZoomIn,
  ZoomOut,
  Maximize,
  LayoutGrid,
  Image as ImageIcon,
  X,
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

interface FlowCanvasContextMenuProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onPaste: (position: { x: number; y: number }) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onExportImage: () => void;
  onClearSelection: () => void;
  hasClipboard: boolean;
  clickPosition: { x: number; y: number } | null;
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

export const FlowCanvasContextMenu = ({
  onAddNode,
  onPaste,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onExportImage,
  onClearSelection,
  hasClipboard,
  clickPosition,
  children,
}: FlowCanvasContextMenuProps) => {
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-56">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Nó
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {nodeTypesToAdd.map((type) => (
              <ContextMenuItem
                key={type.type}
                onClick={() => clickPosition && onAddNode(type.type, clickPosition)}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {hasClipboard && clickPosition && (
          <ContextMenuItem onClick={() => onPaste(clickPosition)}>
            <Clipboard className="mr-2 h-4 w-4" />
            Colar
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onZoomIn}>
          <ZoomIn className="mr-2 h-4 w-4" />
          Aumentar Zoom
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onZoomOut}>
          <ZoomOut className="mr-2 h-4 w-4" />
          Diminuir Zoom
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onFitView}>
          <Maximize className="mr-2 h-4 w-4" />
          Ajustar à Tela
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+1</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onAutoLayout}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          Auto Layout
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onExportImage}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Exportar como Imagem
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onClearSelection}>
          <X className="mr-2 h-4 w-4" />
          Limpar Seleção
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
