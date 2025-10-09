import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  MoveHorizontal,
  MoveVertical,
  Trash2,
  Copy,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FlowSelectionToolbarProps {
  selectedCount: number;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export const FlowSelectionToolbar = ({
  selectedCount,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
  onCopy,
  onDelete,
}: FlowSelectionToolbarProps) => {
  if (selectedCount < 2) return null;

  return (
    <Card className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium px-2">
          {selectedCount} nós selecionados
        </span>
        
        <div className="h-6 w-px bg-border" />
        
        <TooltipProvider>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignLeft}>
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar à esquerda</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignCenter}>
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar ao centro</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignRight}>
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar à direita</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignTop}>
                  <AlignVerticalJustifyStart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar ao topo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignMiddle}>
                  <AlignVerticalJustifyCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar ao meio</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onAlignBottom}>
                  <AlignVerticalJustifyEnd className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinhar abaixo</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDistributeHorizontal}>
                  <MoveHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Distribuir horizontalmente</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDistributeVertical}>
                  <MoveVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Distribuir verticalmente</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </Card>
  );
};
