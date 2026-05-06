import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActiveTool } from '../types';

interface TopBarProps {
  title: string;
  onTitleChange: (val: string) => void;
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  onIngestClick: () => void;
  onExport: (format: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitView: () => void;
  zoom: number;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  propertiesOpen: boolean;
  setPropertiesOpen: (v: boolean) => void;
  
  // Auth Props
  user: { email: string; name: string; institution: string } | null;
  onLoginClick: () => void;
  isSyncing: boolean;
  sheetUrl: string;
  onSettingsClick: () => void;
}

const EXPORT_FORMATS = ['PNG_300DPI', 'PDF_PRINT', 'SVG_VECTOR', 'JSON_SOURCE'];

export default function TopBar({ 
  title, onTitleChange, activeTool, onToolChange, onIngestClick, 
  onExport, onZoomIn, onZoomOut, onZoomReset, onFitView, zoom,
  sidebarOpen, setSidebarOpen, propertiesOpen, setPropertiesOpen,
  user, onLoginClick, isSyncing, sheetUrl, onSettingsClick
}: TopBarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [toast, setToast] = useState('');

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleExport = (fmt: string) => {
    setShowExport(false);
    onExport(fmt);
    fireToast(`✓ Export ready — ${fmt}`);
  };

  return (
    <>
      <header style={{
        height: 70, background: 'rgba(5, 7, 10, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border2)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
        flexShrink: 0, position: 'relative', zIndex: 600, width: '100%'
      }}>
        
        {/* Mobile Sidebar Toggle */}
        <button 
          className="mobile-only"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: sidebarOpen ? 'rgba(83, 230, 212, 0.1)' : 'transparent',
            border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px',
            color: sidebarOpen ? 'var(--mint)' : 'var(--muted)', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          ☰
        </button>
        
        {/* LEFT ZONE: Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 300, flexShrink: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <img src="/logo.png" alt="SciEtch" style={{ width: 32, height: 32, borderRadius: 8, boxShadow: '0 4px 12px rgba(96, 69, 244, 0.3)', objectFit: 'cover' }} />
            <span className="desktop-only" style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>SciEtch</span>
          </div>
          
          <div style={{ width: 1, height: 24, background: 'var(--border2)', flexShrink: 0 }} className="desktop-only" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            {editingTitle ? (
              <input
                autoFocus
                style={{ fontSize: 16, margin: 0, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--mint)', borderRadius: 6, color: '#fff', outline: 'none', fontFamily: 'serif', width: 200 }}
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', overflow: 'hidden' }} onClick={() => setEditingTitle(true)}>
                <h1 style={{ fontSize: 18, margin: 0, color: '#fff', fontFamily: 'serif', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                  {title}
                </h1>
                <div style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)', borderRadius: 6, fontSize: 9, color: 'var(--muted)', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0 }} className="rename-btn">
                  RENAME
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER ZONE: Technical Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center' }}>
          {/* Tools */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: 4, borderRadius: 12, border: '1px solid var(--border2)', flexShrink: 0 }}>
            {(['select', 'pan', 'arrow', 'rect', 'circle', 'text'] as const).map(tool => (
              <button
                key={tool}
                onClick={() => onToolChange(tool)}
                title={`${tool.toUpperCase()}_PROTOCOL`}
                style={{
                  width: 36, height: 36, border: 'none', borderRadius: 8,
                  background: activeTool === tool ? 'rgba(83, 230, 212, 0.1)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: activeTool === tool ? 'var(--mint)' : 'var(--muted)'
                }}
              >
                {tool === 'select' && <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderRadius: 2 }} />}
                {tool === 'pan' && <div style={{ fontSize: 16 }}>✋</div>}
                {tool === 'arrow' && <div style={{ fontSize: 16 }}>➚</div>}
                {tool === 'rect' && <div style={{ width: 14, height: 14, border: '2px solid currentColor' }} />}
                {tool === 'circle' && <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderRadius: '50%' }} />}
                {tool === 'text' && <div style={{ fontWeight: 900, fontSize: 14 }}>T</div>}
              </button>
            ))}
          </div>

          <div className="desktop-only" style={{ width: 1, height: 24, background: 'var(--border2)', flexShrink: 0 }} />

          {/* Zoom Controls */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border2)' }}>
              <button onClick={onZoomOut} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 900 }}>-</button>
              <div onClick={onZoomReset} style={{ padding: '8px 12px', borderLeft: '1px solid var(--border2)', borderRight: '1px solid var(--border2)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'Geist Mono' }}>{Math.round(zoom * 100)}%</div>
              <button onClick={onZoomIn} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 900 }}>+</button>
            </div>
            <button onClick={onFitView} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 10, fontWeight: 800, color: 'var(--soft-gray)', cursor: 'pointer', fontFamily: 'Geist Mono' }}>FIT_VIEW</button>
          </div>
        </div>

        {/* RIGHT ZONE: Research Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, justifyContent: 'flex-end', minWidth: 350 }}>
          
          {/* Sync Indicator */}
          {user && (
            <div 
              onClick={onSettingsClick}
              className="desktop-only" 
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', borderRadius: 100, cursor: 'pointer' }}
            >
              <div style={{ 
                width: 6, height: 6, borderRadius: '50%', 
                background: isSyncing ? 'var(--mint)' : (sheetUrl ? 'var(--mint)' : 'rgba(255,255,255,0.1)'),
                boxShadow: isSyncing ? '0 0 10px var(--mint)' : 'none',
                animation: isSyncing ? 'pulse 1.5s infinite' : 'none'
              }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', fontFamily: 'Geist Mono', letterSpacing: '0.05em' }}>
                {isSyncing ? 'SYNCING...' : (sheetUrl ? 'READY' : 'OFFLINE')}
              </span>
              <span style={{ fontSize: 10, marginLeft: 2 }}>⚙️</span>
            </div>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 0 }}>
              <div className="desktop-only" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{user.name}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--mint)', fontFamily: 'Geist Mono', opacity: 0.6 }}>{user.institution.toUpperCase()}</div>
              </div>
              <div style={{ 
                width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--royal), var(--mint))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff',
                boxShadow: '0 4px 12px rgba(96, 69, 244, 0.3)', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="btn btn-g"
              style={{ padding: '8px 16px', borderRadius: 10, fontSize: 10, fontWeight: 700, fontFamily: 'Geist Mono' }}
            >
              INITIALIZE_IDENTITY
            </button>
          )}

          <button 
            onClick={onIngestClick}
            style={{ 
              background: 'rgba(83, 230, 212, 0.08)', color: 'var(--mint)', border: '1px solid rgba(83, 230, 212, 0.2)', 
              padding: '10px 16px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Geist Mono',
              boxShadow: '0 4px 12px rgba(83, 230, 212, 0.1)', transition: 'all 0.2s'
            }}
          >INGEST</button>
          
          <div className="desktop-only" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExport(!showExport)}
              className="btn btn-p"
              style={{ 
                padding: '10px 16px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Geist Mono' 
              }}
            >EXPORT</button>
             {showExport && (
               <div style={{ 
                 position: 'absolute', top: 64, right: 0, width: 220, padding: 8, zIndex: 1000, 
                 background: 'rgba(10, 13, 18, 0.95)', border: '1px solid var(--border2)', 
                 borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)' 
               }}>
                 {EXPORT_FORMATS.map(f => (
                   <button 
                     key={f} 
                     onClick={() => handleExport(f)} 
                     style={{ 
                       width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', 
                       borderRadius: 10, textAlign: 'left', color: 'var(--muted)', fontSize: 13, 
                       fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'block'
                     }} 
                     onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }} 
                     onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
                   >
                     {f}
                   </button>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Mobile Properties Toggle */}
        <button 
          className="mobile-only"
          onClick={() => setPropertiesOpen(!propertiesOpen)}
          style={{
            background: propertiesOpen ? 'rgba(96, 69, 244, 0.1)' : 'transparent',
            border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px',
            color: propertiesOpen ? 'var(--royal)' : 'var(--muted)', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
        >
          ⚙️
        </button>

      </header>

      {/* Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}
          >
            <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--mint)', padding: '12px 24px', borderRadius: 12, fontSize: 12, fontWeight: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: 'Geist Mono', backdropFilter: 'blur(10px)' }}>
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
