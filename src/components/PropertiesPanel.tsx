import React from 'react';
import { motion } from 'framer-motion';
import type { CanvasNode, CanvasEdge } from '../types';

interface PropertiesPanelProps {
  selectedNode: CanvasNode | null;
  selectedEdge: CanvasEdge | null;
  selectedCount: number;
  onUpdate: (id: string, updates: Partial<CanvasNode>) => void;
  onUpdateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  onUpdateLive: (id: string, updates: Partial<CanvasNode>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAlign: (dir: 'left' | 'top') => void;
  onDistribute: () => void;
}

const COLORS = ['#53E6D4', '#6045F4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#8B949E', '#2563EB'];

export default function PropertiesPanel({
  selectedNode,
  selectedEdge,
  selectedCount,
  onUpdate,
  onUpdateEdge,
  onUpdateLive,
  onDuplicate,
  onDelete,
  onAlign,
  onDistribute,
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div style={{ height: '100%', background: 'transparent', display: 'flex', flexDirection: 'column', padding: 32, gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 24, letterSpacing: '0.1em', fontFamily: 'Geist Mono' }}>PROPERTIES</h2>
          <div style={{ 
            padding: 32, background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--border2)', borderRadius: 20,
            textAlign: 'center', color: 'var(--muted)', fontSize: 12, lineHeight: 1.7, fontFamily: 'Geist Mono'
          }}>
            Select a research entity on the canvas to adjust its properties.
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 10, fontWeight: 800, color: 'var(--mint)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'Geist Mono' }}>Keyboard Protocols</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Del', 'Terminate'],
              ['Ctrl+D', 'Duplicate'],
              ['Ctrl+Z', 'Revert'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{desc}</span>
                <kbd style={{
                  fontSize: 10, color: 'var(--mint)', background: 'rgba(83, 230, 212, 0.1)', border: '1px solid rgba(83, 230, 212, 0.2)',
                  borderRadius: 6, padding: '6px 10px', fontFamily: "Geist Mono", fontWeight: 700
                }}>{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const labelStyle = { 
    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Geist Mono'
  };
  const inputStyle = { 
    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border2)', borderRadius: 10, 
    padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none', transition: 'all 0.3s', fontFamily: 'Geist Mono'
  };

  // If an edge is selected
  if (selectedEdge) {
    return (
      <div style={{ height: '100%', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '28px', borderBottom: '1px solid var(--border2)', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' 
        }}>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: '#fff', fontFamily: 'Geist Mono' }}>LINK_PROPERTIES</span>
          <div style={{ fontSize: 10, color: 'var(--mint)', fontWeight: 800, fontFamily: 'Geist Mono' }}>REF: {selectedEdge.id.toUpperCase().slice(0, 8)}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={onDuplicate} className="btn btn-g" style={{ padding: '12px', borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Geist Mono' }}>DUPLICATE</button>
              <button onClick={onDelete} style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, color: '#EF4444', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Geist Mono' }}>DELETE</button>
            </div>

            <div>
              <div style={{ ...labelStyle, marginBottom: 16 }}>Interaction / Logic</div>
              <textarea
                value={selectedEdge.label || ''}
                onChange={e => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
                placeholder="e.g. Inhibits, Catalyzes, Flows to..."
                style={{ ...inputStyle, resize: 'none', minHeight: 120, lineHeight: 1.7 }}
              />
            </div>

            <div style={{ padding: 20, background: 'rgba(83, 230, 212, 0.03)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ fontSize: 9, color: 'var(--mint)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Geist Mono' }}>Link Protocol</div>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>This link represents a directed relationship between research entities.</p>
            </div>
        </div>
      </div>
    );
  }

  // Null guard — if neither, return empty (covered above; this makes TS happy)
  if (!selectedNode) return null;

  return (
    <div style={{ height: '100%', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '28px', borderBottom: '1px solid var(--border2)', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' 
      }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: '#fff', fontFamily: 'Geist Mono' }}>ENTITY_PROPERTIES</span>
        <div style={{ fontSize: 10, color: 'var(--mint)', fontWeight: 800, fontFamily: 'Geist Mono' }}>REF: {selectedNode.id.toUpperCase().slice(0, 8)}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button 
              onClick={onDuplicate}
              className="btn btn-g"
              style={{ padding: '12px', borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Geist Mono' }}
            >DUPLICATE</button>
            <button 
              onClick={onDelete}
              style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, color: '#EF4444', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Geist Mono' }}
            >DELETE</button>
          </div>

          {selectedCount > 1 && (
              <div style={{ borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(96, 69, 244, 0.05)', border: '1px solid rgba(96, 69, 244, 0.1)' }}>
                 <div style={{ fontSize: 10, color: 'var(--royal)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Geist Mono' }}>Batch Operations ({selectedCount})</div>
                 <div style={{ display: 'flex', gap: 10 }}>
                   <button onClick={() => onAlign('left')} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', borderRadius: 8, color: '#fff', fontSize: 9, cursor: 'pointer', fontWeight: 800, fontFamily: 'Geist Mono' }}>ALIGN_L</button>
                   <button onClick={() => onAlign('top')} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', borderRadius: 8, color: '#fff', fontSize: 9, cursor: 'pointer', fontWeight: 800, fontFamily: 'Geist Mono' }}>ALIGN_T</button>
                   <button onClick={onDistribute} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', borderRadius: 8, color: '#fff', fontSize: 9, cursor: 'pointer', fontWeight: 800, fontFamily: 'Geist Mono' }}>SPREAD</button>
                 </div>
              </div>
          )}

          {/* Label Unit */}
          <div>
            <div style={{ ...labelStyle, marginBottom: 16 }}>Scientific Label</div>
            <textarea
              value={selectedNode.label}
              onChange={e => onUpdate(selectedNode.id, { label: e.target.value })}
              style={{
                ...inputStyle,
                resize: 'none', minHeight: 120, lineHeight: 1.7,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--mint)'; }}
              onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Color Selection */}
          <div>
            <div style={{ ...labelStyle, marginBottom: 16 }}>Color Protocol</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {COLORS.map(c => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onUpdate(selectedNode.id, { color: c })}
                  style={{
                    aspectRatio: '1', borderRadius: 12, background: c,
                    border: selectedNode.color === c ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedNode.color === c ? `0 0 15px ${c}60` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dimensions & Position Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: 12 }}>Width</div>
              <input
                type="number"
                value={selectedNode.width || 160}
                onChange={e => onUpdateLive(selectedNode.id, { width: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 12 }}>Height</div>
              <input
                type="number"
                value={selectedNode.height || 60}
                onChange={e => onUpdateLive(selectedNode.id, { height: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 12 }}>Pos X</div>
              <input
                type="number"
                value={Math.round(selectedNode.x)}
                onChange={e => onUpdateLive(selectedNode.id, { x: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 12 }}>Pos Y</div>
              <input
                type="number"
                value={Math.round(selectedNode.y)}
                onChange={e => onUpdateLive(selectedNode.id, { y: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>
      </div>
    </div>
  );
}
