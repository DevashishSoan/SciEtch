import { create } from 'zustand';
import { temporal } from 'zundo';
import type { CanvasNode, CanvasEdge, ActiveTool } from './types';

interface SchemaState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedIds: string[];
  activeTool: ActiveTool;
  zoom: number;
  pan: { x: number; y: number };
  title: string;

  setNodes: (nodes: CanvasNode[] | ((ns: CanvasNode[]) => CanvasNode[])) => void;
  setEdges: (edges: CanvasEdge[] | ((es: CanvasEdge[]) => CanvasEdge[])) => void;
  setSelectedIds: (ids: string[]) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setZoom: (zoom: number | ((z: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((p: { x: number; y: number }) => { x: number; y: number })) => void;
  setTitle: (title: string) => void;

  moveNodes: (ids: string[], dx: number, dy: number) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  // Auth & Sync State
  user: { email: string; name: string; institution: string } | null;
  setUser: (user: { email: string; name: string; institution: string } | null) => void;
  isSyncing: boolean;
  setIsSyncing: (v: boolean) => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
}

export const useStore = create<SchemaState>()(
  temporal((set) => ({
    nodes: [],
    edges: [],
    selectedIds: [],
    activeTool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    title: 'New Scientific Abstract',
    
    user: null,
    isSyncing: false,
    sheetUrl: 'https://script.google.com/macros/s/AKfycbxXKmIbLxQoUCoUyW24-LXl4dOf8Ds_do6vyDuV7R8ok4vQ4z5IA5YCyCMUejLl4uuZ/exec',

    setNodes: (nodes) => set((state) => ({ nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes })),
    setEdges: (edges) => set((state) => ({ edges: typeof edges === 'function' ? edges(state.edges) : edges })),
    setSelectedIds: (selectedIds) => set({ selectedIds }),
    setActiveTool: (activeTool) => set({ activeTool }),
    setZoom: (zoom) => set((state) => ({ zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom })),
    setPan: (pan) => set((state) => ({ pan: typeof pan === 'function' ? pan(state.pan) : pan })),
    setTitle: (title) => set({ title }),

    setUser: (user) => set({ user }),
    setIsSyncing: (isSyncing) => set({ isSyncing }),
    setSheetUrl: (sheetUrl) => set({ sheetUrl }),

    moveNodes: (ids, dx, dy) => set((state) => ({
      nodes: state.nodes.map(n => {
        if (!ids.includes(n.id)) return n;
        return { ...n, x: n.x + dx, y: n.y + dy };
      })
    })),

    deleteSelected: () => set((state) => {
      const { selectedIds, nodes, edges } = state;
      return {
        nodes: nodes.filter(n => !selectedIds.includes(n.id)),
        edges: edges.filter(e => !selectedIds.includes(e.id) && !selectedIds.includes(e.from) && !selectedIds.includes(e.to)),
        selectedIds: []
      };
    }),

    duplicateSelected: () => set((state) => {
      const { selectedIds, nodes, edges } = state;
      if (selectedIds.length === 0) return state;
      
      const newNodes: CanvasNode[] = [];
      const idMap: Record<string, string> = {};

      selectedIds.forEach(id => {
        const src = nodes.find(n => n.id === id);
        if (src) {
          const newId = `n-${Math.random().toString(36).substr(2, 9)}`;
          idMap[id] = newId;
          newNodes.push({ ...structuredClone(src), id: newId, x: src.x + 40, y: src.y + 40 });
        }
      });

      const newEdges: CanvasEdge[] = [];
      edges.forEach(e => {
        if (selectedIds.includes(e.from) && selectedIds.includes(e.to)) {
          newEdges.push({
            ...structuredClone(e),
            id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            from: idMap[e.from],
            to: idMap[e.to]
          });
        }
      });

      return {
        nodes: [...nodes, ...newNodes],
        edges: [...edges, ...newEdges],
        selectedIds: newNodes.map(n => n.id)  // Only node IDs — edge IDs are not valid for canvas selection
      };
    })
  }), {
    limit: 100, // Handle 30+ rapid changes easily
  })
);
