import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CanvasNode, CanvasEdge, ActiveTool } from '../types';
import { NodeFigure } from './NodeRenderer';

interface CanvasAreaProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedIds: string[];
  activeTool: ActiveTool;
  onSelectNodes: (ids: string[]) => void;
  onMoveNodes: (ids: string[], dx: number, dy: number) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  onAddEdge: (edge: CanvasEdge) => void;
  onDeleteEdge: (id: string) => void;
  onAddNodeAt: (x: number, y: number, w?: number, h?: number) => void;
  onDragEnd: () => void;
  onToolChange?: (tool: ActiveTool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
}

const NODE_W = 160;
const NODE_H = 60;
const SNAP_SIZE = 8;

const FLOWCHART_TYPES = ['process', 'decision', 'input', 'output'];
const isScienceNode = (type: string) => !FLOWCHART_TYPES.includes(type);

function getFlowchartShape(type: string) {
  switch (type) {
    case 'decision': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    case 'input': return { clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)' };
    case 'output': return { borderRadius: 999 };
    default: return { borderRadius: 12 };
  }
}

// ─── SVG Arrow ─────────────────────────────────────────────────────────
function Arrow({ from, to, edge, onDelete, hovered, onHover, selected, onSelect, onEdit }: {
  from: CanvasNode; to: CanvasNode; edge: CanvasEdge;
  onDelete: (id: string) => void; hovered: boolean; onHover: (id: string | null) => void;
  selected: boolean; onSelect: (id: string) => void; onEdit: (id: string) => void;
}) {
  const fw = from.width ?? NODE_W, fh = from.height ?? NODE_H;
  const tw = to.width ?? NODE_W, th = to.height ?? NODE_H;
  const x1 = from.x + fw, y1 = from.y + fh / 2;
  const x2 = to.x, y2 = to.y + th / 2;
  
  let d = '';
  let mx = 0, my = 0;

  if (x1 > x2) {
    const drop = 80 + Math.abs(x1 - x2) * 0.1;
    d = `M ${x1 - fw/2} ${y1 + fh/2} C ${x1 - fw/2} ${y1 + drop}, ${x2 + tw/2} ${y2 + drop}, ${x2 + tw/2} ${y2 + th/2}`;
    mx = (x1 - fw/2 + x2 + tw/2) / 2;
    my = y1 + drop * 0.75;
  } else {
    const dx = Math.abs(x2 - x1);
    d = `M ${x1} ${y1} C ${x1 + Math.max(dx * 0.35, 30)} ${y1}, ${x2 - Math.max(dx * 0.35, 30)} ${y2}, ${x2} ${y2}`;
    mx = (x1 + x2) / 2;
    my = (y1 + y2) / 2 - 12;
  }

  const strokeColor = selected ? 'var(--mint)' : (hovered ? '#fff' : 'rgba(255, 255, 255, 0.15)');

  return (
    <g id={edge.id} style={{ pointerEvents: 'all' }} 
      onClick={e => { e.stopPropagation(); onSelect(edge.id); }}
      onDoubleClick={e => { e.stopPropagation(); onEdit(edge.id); }}>
      <path d={d} fill="none" stroke="transparent" strokeWidth={16}
        onMouseEnter={() => onHover(edge.id)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }} />
      <path d={d} fill="none" stroke={strokeColor}
        strokeWidth={selected || hovered ? 2.5 : 1.5} 
        strokeDasharray={selected ? 'none' : (hovered ? '6 4' : 'none')}
        markerEnd={selected || hovered ? 'url(#arrowhead-hover)' : 'url(#arrowhead)'}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s', pointerEvents: 'none' }} 
      />
      {edge.label && (
        <text x={mx} y={my} textAnchor="middle" fill={selected || hovered ? '#fff' : 'var(--muted)'} fontSize={10}
          fontFamily="'Geist Mono', monospace" style={{ pointerEvents: 'none', fontWeight: 600 }}>{edge.label}</text>
      )}
      {(hovered || selected) && (
        <foreignObject x={mx - 10} y={my + 4} width={20} height={20} style={{ pointerEvents: 'all' }}>
          <button onClick={e => { e.stopPropagation(); onDelete(edge.id); }}
            style={{ width: 18, height: 18, background: '#EF4444', border: 'none', borderRadius: '50%',
              color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>✕</button>
        </foreignObject>
      )}
    </g>
  );
}

// ─── Main Canvas ───────────────────────────────────────────────────────
export default function CanvasArea({
  nodes, edges, selectedIds, activeTool, onSelectNodes, onMoveNodes, onUpdateNode,
  onAddEdge, onDeleteEdge, onAddNodeAt, onDragEnd, onToolChange, zoom, onZoomChange, pan, onPanChange
}: CanvasAreaProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ ids: string[]; sx: number; sy: number; lastDx: number; lastDy: number; moved: boolean } | null>(null);
  const panRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [arrowFrom, setArrowFrom] = useState<string | null>(null);
  const [hovEdge, setHovEdge] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; sw: number; sh: number; sx: number; sy: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEdgeId, setEditEdgeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const curX = (clientX - r.left - pan.x) / zoom;
    const curY = (clientY - r.top - pan.y) / zoom;
    setMousePos({ x: curX, y: curY });

    if (panRef.current) {
      const { sx, sy, ox, oy } = panRef.current;
      onPanChange({ x: ox + clientX - sx, y: oy + clientY - sy });
      return;
    }
    if (marquee) {
      setMarquee(m => m ? { ...m, x2: curX, y2: curY } : null);
      return;
    }
    if (drawing) {
      setDrawing(d => d ? { ...d, x2: curX, y2: curY } : null);
      return;
    }
    if (resizing) {
      const dx = (clientX - resizing.sx) / zoom;
      const dy = (clientY - resizing.sy) / zoom;
      const nw = Math.max(40, Math.round((resizing.sw + dx) / SNAP_SIZE) * SNAP_SIZE);
      const nh = Math.max(24, Math.round((resizing.sh + dy) / SNAP_SIZE) * SNAP_SIZE);
      onUpdateNode(resizing.id, { width: nw, height: nh });
      return;
    }
    if (!dragRef.current || activeTool !== 'select') return;
    const { ids, sx, sy, lastDx, lastDy } = dragRef.current;
    
    // Snap dragging to grid
    const dx = Math.round(((clientX - sx) / zoom) / SNAP_SIZE) * SNAP_SIZE;
    const dy = Math.round(((clientY - sy) / zoom) / SNAP_SIZE) * SNAP_SIZE;
    
    if (dx !== lastDx || dy !== lastDy) {
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragRef.current.moved = true;
        isDragging.current = true;
      }
      onMoveNodes(ids, dx - lastDx, dy - lastDy);
      dragRef.current.lastDx = dx;
      dragRef.current.lastDy = dy;
    }
  }, [activeTool, zoom, onMoveNodes, marquee, drawing, resizing, pan, onUpdateNode, onPanChange]);

  const onUp = useCallback(() => { 
    if (panRef.current) panRef.current = null;
    if (marquee) {
      const xMin = Math.min(marquee.x1, marquee.x2), xMax = Math.max(marquee.x1, marquee.x2);
      const yMin = Math.min(marquee.y1, marquee.y2), yMax = Math.max(marquee.y1, marquee.y2);
      const inside = nodes.filter(n => {
        const w = n.width ?? NODE_W, h = n.height ?? NODE_H;
        return n.x < xMax && n.x + w > xMin && n.y < yMax && n.y + h > yMin;
      }).map(n => n.id);
      onSelectNodes(inside);
      setMarquee(null);
    }
    if (drawing) {
      const x1 = Math.round(Math.min(drawing.x1, drawing.x2) / SNAP_SIZE) * SNAP_SIZE;
      const y1 = Math.round(Math.min(drawing.y1, drawing.y2) / SNAP_SIZE) * SNAP_SIZE;
      // Minimum 80×50 so drawn nodes are always visible
      const w = Math.round(Math.max(Math.abs(drawing.x2 - drawing.x1), 80) / SNAP_SIZE) * SNAP_SIZE;
      const h = Math.round(Math.max(Math.abs(drawing.y2 - drawing.y1), 50) / SNAP_SIZE) * SNAP_SIZE;
      onAddNodeAt(x1, y1, w, h);
      setDrawing(null);
      // Auto-switch back to select so the new node is immediately selectable
      onToolChange?.('select');
    }
    if (resizing) {
      onDragEnd();
      setResizing(null);
    }
    if (dragRef.current?.moved) onDragEnd(); 
    dragRef.current = null;
    isDragging.current = false;
  }, [onDragEnd, marquee, drawing, resizing, nodes, onSelectNodes, onAddNodeAt, onToolChange]);

  // Global mouse & touch listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', onUp);
    
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', onUp); 
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [onMove, onUp]);

  // Wheel listener for zoom/pan
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        onZoomChange(Math.max(0.25, Math.min(3, zoom - e.deltaY * 0.005)));
      } else {
        onPanChange({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, onZoomChange, pan, onPanChange]);

  const nodeDown = (clientX: number, clientY: number, id: string, shiftKey: boolean) => {
    if (activeTool === 'arrow') {
      if (!arrowFrom) setArrowFrom(id);
      else if (arrowFrom !== id) { onAddEdge({ id: `e-${Math.random().toString(36).substr(2,9)}`, from: arrowFrom, to: id }); setArrowFrom(null); }
      return;
    }

    let next = [...selectedIds];
    if (shiftKey) {
      if (next.includes(id)) next = next.filter(x => x !== id);
      else next.push(id);
    } else {
      if (!next.includes(id)) next = [id];
    }
    onSelectNodes(next);

    if (activeTool === 'select') {
      dragRef.current = { ids: next, sx: clientX, sy: clientY, lastDx: 0, lastDy: 0, moved: false };
    }
  };

  const canvasDown = (clientX: number, clientY: number, button: number) => {
    if (button === 1 || activeTool === 'pan') {
      panRef.current = { sx: clientX, sy: clientY, ox: pan.x, oy: pan.y };
      return;
    }
    // In arrow mode, clicking empty canvas cancels the source selection but doesn't deselect nodes
    if (activeTool === 'arrow') {
      setArrowFrom(null);
      setCtxMenu(null);
      return;
    }
    onSelectNodes([]); setCtxMenu(null); setEditId(null);
    const r = canvasRef.current!.getBoundingClientRect();
    const x = (clientX - r.left - pan.x) / zoom;
    const y = (clientY - r.top - pan.y) / zoom;
    if (activeTool === 'select') {
      setMarquee({ x1: x, y1: y, x2: x, y2: y });
    } else if (['rect', 'circle', 'text'].includes(activeTool)) {
      setDrawing({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const ctxHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    const r = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setCtxMenu({ x, y, cx: (x - pan.x) / zoom, cy: (y - pan.y) / zoom });
  };

  return (
    <div ref={wrapperRef} style={{ 
      position: 'relative', overflow: 'hidden', width: '100%', height: '100%',
      cursor: activeTool === 'pan' ? 'grab' : activeTool === 'arrow' ? 'crosshair' : 'default'
    }}>
      
      <div ref={canvasRef} 
        onMouseDown={e => canvasDown(e.clientX, e.clientY, e.button)}
        onTouchStart={e => {
          if (e.touches.length === 1) canvasDown(e.touches[0].clientX, e.touches[0].clientY, 0);
        }}
        onContextMenu={ctxHandler}
        style={{
          width: '100%', height: '100%', position: 'absolute',
          backgroundImage: 'radial-gradient(circle, rgba(83, 230, 212, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`, backgroundColor: 'transparent',
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}>
        
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>

        {/* SVG layer */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.2)" /></marker>
            <marker id="arrowhead-hover" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--mint)" /></marker>
          </defs>
          {edges.map(edge => {
            const f = nodes.find(n => n.id === edge.from), t = nodes.find(n => n.id === edge.to);
            if (!f || !t) return null;
            return (
              <Arrow 
                key={edge.id} edge={edge} from={f} to={t} 
                onDelete={onDeleteEdge} 
                hovered={hovEdge === edge.id} 
                onHover={setHovEdge} 
                selected={selectedIds.includes(edge.id)} 
                onSelect={id => onSelectNodes([id])}
                onEdit={id => setEditEdgeId(id)}
              />
            );
          })}
        </svg>

        {/* ── NODES ─────────────────────────────────────────── */}
        <>
          {nodes.map(node => {
            const sel = selectedIds.includes(node.id);
            const arrSrc = arrowFrom === node.id;
            const editing = editId === node.id;
            const w = node.width ?? NODE_W, h = node.height ?? NODE_H;
            const isScience = isScienceNode(node.type);

            const onNodeDown = (e: React.MouseEvent) => { e.stopPropagation(); nodeDown(e.clientX, e.clientY, node.id, e.shiftKey); };
            const onNodeTouchStart = (e: React.TouchEvent) => { e.stopPropagation(); if (e.touches.length === 1) nodeDown(e.touches[0].clientX, e.touches[0].clientY, node.id, false); };
            const onNodeDoubleClick = (e: React.MouseEvent) => { e.stopPropagation(); setEditId(node.id); onSelectNodes([node.id]); };

            if (node.type === 'text') {
              return (
                <div key={node.id} id={node.id}
                  onMouseDown={onNodeDown} onTouchStart={onNodeTouchStart} onDoubleClick={onNodeDoubleClick}
                  style={{
                    position: 'absolute', top: node.y, left: node.x, width: w, height: h,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: activeTool === 'select' ? (editing ? 'text' : 'grab') : 'crosshair',
                    userSelect: 'none', zIndex: sel ? 10 : 1,
                    background: 'transparent',
                    border: sel ? `1.5px dashed var(--mint)` : '1.5px solid transparent',
                    borderRadius: 8,
                    transition: 'left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>
                  {editing ? (
                    <textarea
                      autoFocus
                      value={node.label}
                      rows={3}
                      onChange={e => onUpdateNode(node.id, { label: e.target.value })}
                      onBlur={() => setEditId(null)}
                      onKeyDown={e => { if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') setEditId(null); }}
                      onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
                      onFocus={e => e.target.select()}
                      style={{ 
                        width: '100%', textAlign: 'center', background: 'rgba(5, 7, 10, 0.8)', border: '1px solid var(--mint)',
                        borderRadius: 4, outline: 'none', fontSize: node.fontSize ?? 14, fontFamily: "'Geist Mono', monospace",
                        color: '#fff', fontWeight: 500, padding: '4px', resize: 'none', overflow: 'hidden',
                        userSelect: 'text', WebkitUserSelect: 'text', pointerEvents: 'all' 
                      }} 
                    />
                  ) : (
                    <span style={{ 
                      fontSize: node.fontSize ?? 14, fontFamily: "'Geist Mono', monospace", color: '#fff',
                      fontWeight: 500, textAlign: 'center', lineHeight: 1.4, maxWidth: '100%',
                      wordBreak: 'break-word', pointerEvents: 'none', opacity: sel ? 1 : 0.9,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      {node.label}
                    </span>
                  )}
                  {sel && (
                    <div 
                      onMouseDown={e => { e.stopPropagation(); setResizing({ id: node.id, sw: w, sh: h, sx: e.clientX, sy: e.clientY }); }}
                      style={{
                        position: 'absolute', bottom: -6, right: -6, width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'nwse-resize', pointerEvents: 'all', zIndex: 100,
                      }}>
                      <div style={{ width: 8, height: 8, background: 'var(--mint)', border: '1.5px solid var(--black)', borderRadius: '2px' }} />
                    </div>
                  )}
                </div>
              );
            }

            if (isScience) {
              return (
                <div key={node.id} id={node.id}
                  onMouseDown={onNodeDown} onTouchStart={onNodeTouchStart} onDoubleClick={onNodeDoubleClick}
                  style={{
                    position: 'absolute', top: node.y, left: node.x,
                    width: w, height: h + 24,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: activeTool === 'select' ? 'grab' : 'crosshair',
                    userSelect: 'none', zIndex: sel ? 10 : 1,
                    background: sel ? `rgba(83, 230, 212, 0.05)` : 'rgba(13, 18, 28, 0.7)',
                    border: sel ? `1.5px solid var(--mint)` : arrSrc ? '1.5px solid var(--royal)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: node.borderRadius ?? 16,
                    boxShadow: sel ? `0 0 30px rgba(83, 230, 212, 0.1)` : '0 10px 30px rgba(0,0,0,0.5)',
                    padding: 8,
                    gap: 4,
                    transition: 'left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}>
                  <NodeFigure label={node.label} color={node.color} w={w} h={h} />
                  {editing ? (
                    <textarea
                      autoFocus
                      value={node.label}
                      rows={3}
                      onChange={e => onUpdateNode(node.id, { label: e.target.value })}
                      onBlur={() => setEditId(null)}
                      onKeyDown={e => { if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') setEditId(null); }}
                      onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
                      onFocus={e => e.target.select()}
                      style={{ width: '100%', textAlign: 'center', background: 'rgba(5, 7, 10, 0.9)', border: '1px solid var(--mint)',
                        borderRadius: 8, outline: 'none', fontSize: node.fontSize ?? 11, fontFamily: "'Geist', sans-serif",
                        color: '#fff', fontWeight: 600, padding: '8px', resize: 'none', overflow: 'hidden',
                        userSelect: 'text', WebkitUserSelect: 'text', pointerEvents: 'all' }} />
                  ) : (
                    <span style={{ fontSize: node.fontSize ?? 11, fontFamily: "'Geist', sans-serif", color: 'var(--soft-gray)',
                      fontWeight: 600, textAlign: 'center', lineHeight: 1.4, maxWidth: '100%',
                      wordBreak: 'break-word', pointerEvents: 'none', opacity: sel ? 1 : 0.85 }}>
                      {node.label}
                    </span>
                  )}
                  {sel && (
                    <div 
                      onMouseDown={e => { e.stopPropagation(); setResizing({ id: node.id, sw: w, sh: h, sx: e.clientX, sy: e.clientY }); }}
                      onTouchStart={e => { e.stopPropagation(); setResizing({ id: node.id, sw: w, sh: h, sx: e.touches[0].clientX, sy: e.touches[0].clientY }); }}
                      style={{
                        position: 'absolute', bottom: -8, right: -8, width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'nwse-resize', pointerEvents: 'all', zIndex: 100,
                      }}>
                      <div style={{ width: 12, height: 12, background: 'var(--mint)', border: '2px solid var(--black)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(83, 230, 212, 0.5)' }} />
                    </div>
                  )}
                </div>
              );
            }

            const shape = getFlowchartShape(node.type);
            const hasClip = !!shape.clipPath;
            const cw = node.type === 'decision' ? Math.max(w, h) * 1.1 : w;
            const ch = node.type === 'decision' ? Math.max(w, h) * 1.1 : h;

            return (
              <div key={node.id} id={node.id}
                onMouseDown={onNodeDown} onTouchStart={onNodeTouchStart} onDoubleClick={onNodeDoubleClick}
                style={{
                  position: 'absolute', top: node.y, left: node.x, width: cw, height: ch,
                  zIndex: sel ? 10 : 1,
                  filter: sel && hasClip ? `drop-shadow(0 8px 16px rgba(0,0,0,0.1))` : 'none',
                  transition: 'left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                <div style={{
                  width: '100%', height: '100%', background: node.color,
                  clipPath: shape.clipPath, borderRadius: hasClip ? undefined : (node.borderRadius ?? shape.borderRadius ?? 10),
                  border: sel ? '2px solid var(--mint)' : '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: activeTool === 'select' ? (editing ? 'text' : 'grab') : 'crosshair',
                  userSelect: 'none', position: 'relative',
                  boxShadow: hasClip ? 'none'
                    : sel ? `0 0 40px ${node.color}50`
                    : `0 10px 30px rgba(0,0,0,0.4)`,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  padding: '8px 12px',
                }}>
                  {editing ? (
                    <textarea autoFocus value={node.label} rows={4}
                      onChange={e => onUpdateNode(node.id, { label: e.target.value })}
                      onBlur={() => setEditId(null)}
                      onKeyDown={e => { if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') setEditId(null); }}
                      onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
                      onFocus={e => e.target.select()}
                      style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none',
                        fontSize: node.fontSize ?? 12, fontFamily: "'Geist', sans-serif", resize: 'none', overflow: 'hidden',
                        color: '#fff', fontWeight: 700,
                        userSelect: 'text', WebkitUserSelect: 'text', pointerEvents: 'all' }} />
                  ) : (
                    <span style={{ fontSize: node.fontSize ?? 12, fontFamily: "'Geist', sans-serif",
                      color: '#fff', fontWeight: 700, textAlign: 'center', lineHeight: 1.4,
                      wordBreak: 'break-word', maxWidth: '100%', pointerEvents: 'none',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      {node.label}
                    </span>
                  )}
                </div>
                {sel && (
                  <div 
                    onMouseDown={e => { e.stopPropagation(); setResizing({ id: node.id, sw: cw, sh: ch, sx: e.clientX, sy: e.clientY }); }}
                    onTouchStart={e => { e.stopPropagation(); setResizing({ id: node.id, sw: cw, sh: ch, sx: e.touches[0].clientX, sy: e.touches[0].clientY }); }}
                    style={{
                      position: 'absolute', bottom: -8, right: -8, width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'nwse-resize', pointerEvents: 'all', zIndex: 100,
                    }}>
                    <div style={{ width: 12, height: 12, background: 'var(--mint)', border: '2px solid var(--black)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(83, 230, 212, 0.5)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </>
        </div>

        {/* Arrow mode indicator */}
        <AnimatePresence>
          {arrowFrom && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
              background: '#0F172A', border: '1px solid var(--royal)', borderRadius: 12,
              padding: '8px 18px', zIndex: 50, boxShadow: '0 8px 30px rgba(96, 69, 244, 0.3)',
              fontSize: 12, color: '#fff', fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '0.05em' }}>
              ➚ Select target to connect
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context menu */}
        <AnimatePresence>
          {ctxMenu && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', left: ctxMenu.x, top: ctxMenu.y,
                background: 'rgba(13, 18, 28, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border2)', borderRadius: 12, padding: '6px 0', zIndex: 100, minWidth: 200,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              {[
                { label: 'Add Reference Node', action: () => { onAddNodeAt(ctxMenu.cx - 80, ctxMenu.cy - 30); setCtxMenu(null); } },
                { label: 'Enter Link Mode', action: () => { setCtxMenu(null); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 18px',
                    background: 'none', border: 'none', textAlign: 'left', color: 'var(--soft-gray)', fontSize: 13,
                    cursor: 'pointer', fontWeight: 600, fontFamily: 'Geist Mono',
                    borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                >{item.label}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edge Label Editor Overlay */}
        <AnimatePresence>
          {editEdgeId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
              position: 'absolute', inset: 0, zIndex: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(5, 7, 10, 0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
            }} onClick={() => setEditEdgeId(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                style={{ background: 'var(--dark)', border: '1px solid var(--mint)', borderRadius: 16, padding: 24, width: 320, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 10, color: 'var(--mint)', fontWeight: 800, fontFamily: 'Geist Mono', marginBottom: 16, letterSpacing: '0.1em' }}>EDIT_LINK_LABEL</div>
                <input
                  autoFocus
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 20 }}
                  value={edges.find(e => e.id === editEdgeId)?.label || ''}
                  onChange={e => {
                    const edge = edges.find(ex => ex.id === editEdgeId);
                    if (edge) onAddEdge({ ...edge, label: e.target.value });
                  }}
                  onKeyDown={e => e.key === 'Enter' && setEditEdgeId(null)}
                />
                <button className="btn btn-p" style={{ width: '100%', fontSize: 12, fontFamily: 'Geist Mono', padding: '12px' }} onClick={() => setEditEdgeId(null)}>CONFIRM_CHANGES</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Marquee UI */}
        {marquee && (
          <div style={{
            position: 'absolute', zIndex: 1000, pointerEvents: 'none',
            left: Math.min(marquee.x1, marquee.x2) * zoom + pan.x,
            top: Math.min(marquee.y1, marquee.y2) * zoom + pan.y,
            width: Math.abs(marquee.x2 - marquee.x1) * zoom,
            height: Math.abs(marquee.y2 - marquee.y1) * zoom,
            background: 'rgba(83, 230, 212, 0.05)',
            border: '1px solid var(--mint)',
            borderRadius: 8
          }} />
        )}

        {/* Drawing Preview */}
        {drawing && (
          <div style={{
            position: 'absolute', zIndex: 1000, pointerEvents: 'none',
            left: (Math.min(drawing.x1, drawing.x2) * zoom) + pan.x,
            top: (Math.min(drawing.y1, drawing.y2) * zoom) + pan.y,
            width: Math.abs(drawing.x2 - drawing.x1) * zoom,
            height: Math.abs(drawing.y2 - drawing.y1) * zoom,
            border: '2px solid var(--mint)',
            background: 'rgba(83, 230, 212, 0.03)',
            borderRadius: activeTool === 'circle' ? '50%' : '12px',
          }} />
        )}

        {/* Spatial HUD */}
        <div style={{
          position: 'absolute', bottom: 24, left: 24, pointerEvents: 'none',
          background: 'rgba(13, 18, 28, 0.6)', border: '1px solid var(--border2)',
          padding: '10px 16px', borderRadius: 12, zIndex: 100,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'
        }}>
          <div style={{ fontSize: 9, color: 'var(--mint)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.1em', fontFamily: 'Geist Mono' }}>Coord_System</div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#fff', fontWeight: 600 }}>
            X:{Math.round(mousePos.x).toString().padStart(4, '0')} Y:{Math.round(mousePos.y).toString().padStart(4, '0')}
          </div>
        </div>
      </div>
    );
}
