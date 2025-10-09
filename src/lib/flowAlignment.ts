import { Node } from '@xyflow/react';

export const alignNodes = {
  left: (nodes: Node[]): Node[] => {
    const minX = Math.min(...nodes.map(n => n.position.x));
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, x: minX },
    }));
  },

  center: (nodes: Node[]): Node[] => {
    const centerX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, x: centerX },
    }));
  },

  right: (nodes: Node[]): Node[] => {
    const maxX = Math.max(...nodes.map(n => n.position.x));
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, x: maxX },
    }));
  },

  top: (nodes: Node[]): Node[] => {
    const minY = Math.min(...nodes.map(n => n.position.y));
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, y: minY },
    }));
  },

  middle: (nodes: Node[]): Node[] => {
    const centerY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, y: centerY },
    }));
  },

  bottom: (nodes: Node[]): Node[] => {
    const maxY = Math.max(...nodes.map(n => n.position.y));
    return nodes.map(node => ({
      ...node,
      position: { ...node.position, y: maxY },
    }));
  },
};

export const distributeNodes = {
  horizontal: (nodes: Node[]): Node[] => {
    if (nodes.length < 3) return nodes;
    
    const sorted = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalDistance = last.position.x - first.position.x;
    const spacing = totalDistance / (sorted.length - 1);

    return sorted.map((node, i) => ({
      ...node,
      position: { ...node.position, x: first.position.x + (spacing * i) },
    }));
  },

  vertical: (nodes: Node[]): Node[] => {
    if (nodes.length < 3) return nodes;
    
    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalDistance = last.position.y - first.position.y;
    const spacing = totalDistance / (sorted.length - 1);

    return sorted.map((node, i) => ({
      ...node,
      position: { ...node.position, y: first.position.y + (spacing * i) },
    }));
  },
};
