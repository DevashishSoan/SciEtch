// SciEtch shared types

export type NodeType = 'process' | 'input' | 'output' | 'decision' | 'biology' | 'chemistry' | 'data' | 'physics' | 'text';

export interface CanvasNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  color: string;
  borderRadius?: number;
  fontSize?: number;
  width?: number;
  height?: number;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export type ActiveTool = 'select' | 'pan' | 'text' | 'arrow' | 'rect' | 'circle';

// Undo/redo snapshot
export interface Snapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
