import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasNode, CanvasEdge, ActiveTool } from './types';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import IngestModal from './components/IngestModal';
import AuthModal from './components/AuthModal';
import CloudSettingsModal from './components/CloudSettingsModal';
import QuickGuide from './components/QuickGuide';
import LandingPage from './components/LandingPage';
import { useStore } from './store';
import { exportToPNG, exportToPDF, exportToSVG } from './utils/export';
import { AnimatePresence } from 'framer-motion';

const uid = () => `n-${Math.random().toString(36).substr(2, 9)}`;

export default function App() {
  const {
    nodes, edges, selectedIds, activeTool, zoom, title, pan,
    setNodes, setEdges, setSelectedIds, setActiveTool, setZoom, setTitle, setPan,
    moveNodes, deleteSelected, duplicateSelected,
    user, setUser, isSyncing, setIsSyncing, sheetUrl, setSheetUrl
  } = useStore();

  const { undo, redo } = useStore.temporal.getState();
  const [showIngest, setShowIngest] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  const [view, setView] = useState<'landing' | 'editor'>('landing');

  // Mobile layout state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const updateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, ...updates } : n));
  }, [setNodes]);

  const updateEdge = useCallback((id: string, updates: Partial<CanvasEdge>) => {
    setEdges(es => es.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setEdges]);

  const addNode = useCallback((def: { label: string; type: string; color: string }) => {
    const id = uid();
    // Drop new node at the current viewport center so it's always visible
    const vw = window.innerWidth - 280 - 340; // subtract sidebar + properties
    const vh = window.innerHeight - 70;
    const centerX = (vw / 2 - pan.x) / zoom;
    const centerY = (vh / 2 - pan.y) / zoom;
    const newNode: CanvasNode = {
      id,
      label: def.label,
      type: def.type as CanvasNode['type'],
      x: centerX - 80 + (Math.random() - 0.5) * 80,
      y: centerY - 30 + (Math.random() - 0.5) * 80,
      color: def.color,
      fontSize: 12,
      width: 160,
      height: 60,
    };
    setNodes(ns => [...ns, newNode]);
    setSelectedIds([id]);
    setSidebarOpen(false);
  }, [setNodes, setSelectedIds, pan, zoom]);

  const addNodeAt = useCallback((x: number, y: number, w?: number, h?: number) => {
    const id = uid();
    let type: CanvasNode['type'] = 'process';
    let label = 'New Node';
    let color = '#53E6D4'; // Mint default

    if (activeTool === 'rect') type = 'process';
    if (activeTool === 'circle') { type = 'output'; color = '#6045F4'; } // Royal Purple
    if (activeTool === 'text') { type = 'text'; label = 'Click to edit text...'; color = 'transparent'; }

    const newNode: CanvasNode = {
      id, label, type, x, y, color,
      fontSize: 12,
      width: w ?? 160,
      height: h ?? 60,
    };
    setNodes(ns => [...ns, newNode]);
    setSelectedIds([id]);
  }, [setNodes, setSelectedIds, activeTool]);

  const selectAll = useCallback(() => {
    setSelectedIds(nodes.map(n => n.id));
  }, [nodes, setSelectedIds]);

  const alignNodes = useCallback((dir: 'left' | 'top') => {
    if (selectedIds.length < 2) return;
    const selNodes = nodes.filter(n => selectedIds.includes(n.id));
    if (dir === 'left') {
      const minX = Math.min(...selNodes.map(n => n.x));
      setNodes(ns => ns.map(n => selectedIds.includes(n.id) ? { ...n, x: minX } : n));
    } else {
      const minY = Math.min(...selNodes.map(n => n.y));
      setNodes(ns => ns.map(n => selectedIds.includes(n.id) ? { ...n, y: minY } : n));
    }
  }, [nodes, selectedIds, setNodes]);

  const distributeNodes = useCallback(() => {
    if (selectedIds.length < 3) return;
    const selNodes = [...nodes.filter(n => selectedIds.includes(n.id))].sort((a, b) => a.x - b.x);
    const minX = selNodes[0].x;
    const maxX = selNodes[selNodes.length - 1].x;
    const totalW = maxX - minX;
    const step = totalW / (selNodes.length - 1);
    
    setNodes(ns => ns.map(n => {
      const idx = selNodes.findIndex(sn => sn.id === n.id);
      return idx !== -1 ? { ...n, x: minX + idx * step } : n;
    }));
  }, [nodes, selectedIds, setNodes]);

  const clipboard = useRef<{ nodes: CanvasNode[]; edges: CanvasEdge[] } | null>(null);

  const copyToClipboard = useCallback(() => {
    if (selectedIds.length === 0) return;
    const copiedNodes = nodes.filter(n => selectedIds.includes(n.id));
    const copiedEdges = edges.filter(e => selectedIds.includes(e.from) && selectedIds.includes(e.to));
    clipboard.current = { nodes: structuredClone(copiedNodes), edges: structuredClone(copiedEdges) };
  }, [nodes, edges, selectedIds]);

  const fitView = useCallback(() => {
    if (nodes.length === 0) {
      setZoom(1);
      return;
    }
    const padding = 120;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + (n.width || 160)));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + (n.height || 80)));

    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const vw = window.innerWidth;
    const vh = window.innerHeight - 70;

    const targetZoom = Math.max(0.2, Math.min(1.2, Math.min(vw / contentW, vh / contentH)));
    setZoom(targetZoom);
    
    setPan({
      x: (vw / 2) - (maxX + minX) / 2 * targetZoom,
      y: (vh / 2) - (maxY + minY) / 2 * targetZoom
    });
  }, [nodes, setZoom, setPan]);

  const pasteFromClipboard = useCallback(() => {
    if (!clipboard.current) return;
    const newNodes: CanvasNode[] = [];
    const idMap: Record<string, string> = {};

    clipboard.current.nodes.forEach(n => {
      const newId = uid();
      idMap[n.id] = newId;
      newNodes.push({ ...structuredClone(n), id: newId, x: n.x + 40, y: n.y + 40 });
    });

    const newEdges: CanvasEdge[] = clipboard.current.edges.map(e => ({
      ...structuredClone(e),
      id: `e-${Date.now()}-${Math.random()}`,
      from: idMap[e.from],
      to: idMap[e.to]
    })).filter(e => e.from && e.to);

    setNodes(ns => [...ns, ...newNodes]);
    setEdges(es => [...es, ...newEdges]);
    setSelectedIds(newNodes.map(n => n.id));
  }, [setNodes, setEdges, setSelectedIds]);

  const addEdge = useCallback((edge: CanvasEdge) => {
    if (edge.from === edge.to) return;
    setEdges(es => {
      const idx = es.findIndex(e => e.id === edge.id || (e.from === edge.from && e.to === edge.to));
      if (idx !== -1) {
        const next = [...es];
        next[idx] = { ...next[idx], ...edge };
        return next;
      }
      return [...es, edge];
    });
  }, [setEdges]);

  const deleteEdge = useCallback((id: string) => {
    setEdges(es => es.filter(e => e.id !== id));
  }, [setEdges]);

  const handleIngestApply = useCallback((newNodes: CanvasNode[], newEdges: CanvasEdge[], newTitle: string) => {
    setNodes([]);
    setEdges([]);
    if (newTitle) setTitle(newTitle);
    setSelectedIds([]);

    let i = 0;
    const addedNodeIds = new Set<string>();
    const interval = setInterval(() => {
      if (i < newNodes.length) {
        const nextNode = newNodes[i];
        addedNodeIds.add(nextNode.id);
        setNodes(prev => [...prev, nextNode]);
        const validEdges = newEdges.filter(e => addedNodeIds.has(e.from) && addedNodeIds.has(e.to));
        setEdges(validEdges);
        i++;
      } else {
        clearInterval(interval);
        setEdges(newEdges);
      }
    }, 120);
    // Cleanup on unmount would need a ref — acceptable for now as the interval is short-lived
  }, [setNodes, setEdges, setTitle, setSelectedIds]);

  const loadTemplate = useCallback((name: string) => {
    const startX = 120;
    const y = 300;
    const w = 160;
    const gap = 220;
    const h = 60;

    if (name === 'Blank Canvas') {
      setNodes([]);
      setEdges([]);
    } else if (name === 'CRISPR Workflow') {
      const n1 = 'node-crispr-1', n2 = 'node-crispr-2', n3 = 'node-crispr-3', n4 = 'node-crispr-4', n5 = 'node-crispr-5';
      setNodes([
        { id: n1, label: 'Cell Cultures', type: 'input', x: startX, y, color: '#F59E0B', fontSize: 12, width: w, height: h },
        { id: n2, label: 'Lipofection', type: 'process', x: startX + gap, y, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: n3, label: 'Viability Assessment', type: 'process', x: startX + gap * 2, y, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: n4, label: 'Protein Knockdown', type: 'process', x: startX + gap * 3, y, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: n5, label: 'Editing Efficiency', type: 'output', x: startX + gap * 4, y, color: '#6045F4', fontSize: 12, width: w, height: h },
      ]);
      setEdges([
        { id: 'edge-crispr-1', from: n1, to: n2 },
        { id: 'edge-crispr-2', from: n2, to: n3 },
        { id: 'edge-crispr-3', from: n3, to: n4 },
        { id: 'edge-crispr-4', from: n4, to: n5 },
      ]);
    } else if (name === 'Clinical Trial') {
      const ids = ['ct-1','ct-2','ct-3','ct-4','ct-5','ct-6','ct-7','ct-8'];
      setNodes([
        { id: ids[0], label: 'Patient Recruitment\n(n=240)', type: 'input', x: startX, y: 160, color: '#F59E0B', fontSize: 12, width: w, height: h },
        { id: ids[1], label: 'Eligibility Screening', type: 'decision', x: startX + gap, y: 160, color: '#10B981', fontSize: 12, width: w, height: h },
        { id: ids[2], label: 'Randomization\n1:1:1', type: 'process', x: startX + gap * 2, y: 160, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: ids[3], label: 'Phase I\nSafety (n=80)', type: 'process', x: startX, y: 360, color: '#6045F4', fontSize: 12, width: w, height: h },
        { id: ids[4], label: 'Phase II\nEfficacy (n=80)', type: 'process', x: startX + gap, y: 360, color: '#6045F4', fontSize: 12, width: w, height: h },
        { id: ids[5], label: 'Phase III\nRCT (n=80)', type: 'process', x: startX + gap * 2, y: 360, color: '#6045F4', fontSize: 12, width: w, height: h },
        { id: ids[6], label: 'Safety Analysis\n(DSMB Review)', type: 'decision', x: startX + gap, y: 560, color: '#EF4444', fontSize: 12, width: w, height: h },
        { id: ids[7], label: 'Primary Endpoint\n(p < 0.05)', type: 'output', x: startX + gap * 2, y: 560, color: '#53E6D4', fontSize: 12, width: w, height: h },
      ]);
      setEdges([
        { id: 'ct-e1', from: ids[0], to: ids[1] },
        { id: 'ct-e2', from: ids[1], to: ids[2] },
        { id: 'ct-e3', from: ids[2], to: ids[3] },
        { id: 'ct-e4', from: ids[2], to: ids[4] },
        { id: 'ct-e5', from: ids[2], to: ids[5] },
        { id: 'ct-e6', from: ids[3], to: ids[6] },
        { id: 'ct-e7', from: ids[4], to: ids[6] },
        { id: 'ct-e8', from: ids[5], to: ids[7] },
        { id: 'ct-e9', from: ids[6], to: ids[7], label: 'Approved' },
      ]);
    } else if (name === 'ML Pipeline') {
      const ids = ['ml-1','ml-2','ml-3','ml-4','ml-5','ml-6','ml-7','ml-8','ml-9'];
      setNodes([
        { id: ids[0], label: 'Raw Dataset\n(CSV / Parquet)', type: 'input', x: startX, y: 200, color: '#F59E0B', fontSize: 12, width: w, height: h },
        { id: ids[1], label: 'Data Cleaning\n& Imputation', type: 'process', x: startX + gap, y: 200, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: ids[2], label: 'Feature Engineering\n(PCA / Embeddings)', type: 'process', x: startX + gap * 2, y: 200, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: ids[3], label: 'Train / Val / Test\nSplit (70/15/15)', type: 'process', x: startX + gap * 3, y: 200, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: ids[4], label: 'Model Training\n(Transformer / XGB)', type: 'process', x: startX, y: 400, color: '#6045F4', fontSize: 12, width: w, height: h },
        { id: ids[5], label: 'Hyperparameter\nOptimization', type: 'process', x: startX + gap, y: 400, color: '#6045F4', fontSize: 12, width: w, height: h },
        { id: ids[6], label: 'Validation\n(AUC / F1 / RMSE)', type: 'decision', x: startX + gap * 2, y: 400, color: '#10B981', fontSize: 12, width: w, height: h },
        { id: ids[7], label: 'Model Export\n(ONNX / TorchScript)', type: 'process', x: startX + gap * 3, y: 400, color: '#53E6D4', fontSize: 12, width: w, height: h },
        { id: ids[8], label: 'Production\nDeployment', type: 'output', x: startX + gap * 3, y: 600, color: '#6045F4', fontSize: 12, width: w, height: h },
      ]);
      setEdges([
        { id: 'ml-e1', from: ids[0], to: ids[1] },
        { id: 'ml-e2', from: ids[1], to: ids[2] },
        { id: 'ml-e3', from: ids[2], to: ids[3] },
        { id: 'ml-e4', from: ids[3], to: ids[4] },
        { id: 'ml-e5', from: ids[4], to: ids[5] },
        { id: 'ml-e6', from: ids[5], to: ids[6] },
        { id: 'ml-e7', from: ids[6], to: ids[4], label: 'Retrain' },
        { id: 'ml-e8', from: ids[6], to: ids[7], label: 'Pass' },
        { id: 'ml-e9', from: ids[7], to: ids[8] },
      ]);
    }
    setSelectedIds([]);
    setSidebarOpen(false);
  }, [setNodes, setEdges, setSelectedIds]);

  const handleExport = useCallback((format: string) => {
    if (format.includes('PNG')) exportToPNG(nodes, edges, title);
    else if (format.includes('PDF')) exportToPDF(nodes, edges, title);
    else if (format.includes('SVG')) exportToSVG(nodes, edges, title);
  }, [nodes, edges, title]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'a') { e.preventDefault(); selectAll(); }
      if (ctrl && e.key === 'c') { e.preventDefault(); copyToClipboard(); }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteFromClipboard(); }
      if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) { e.preventDefault(); deleteSelected(); }
      }

      if (!ctrl) {
        if (e.key === 'v' || e.key === 'V') setActiveTool('select');
        if (e.key === 'h' || e.key === 'H') setActiveTool('pan');
        if (e.key === 't' || e.key === 'T') setActiveTool('text');
        if (e.key === 'a' || e.key === 'A') setActiveTool('arrow');
        if (e.key === 'r' || e.key === 'R') setActiveTool('rect');
        if (e.key === 'c' || e.key === 'C') setActiveTool('circle');
        if (e.key === 'Escape') { 
          setSelectedIds([]); setActiveTool('select'); 
          setSidebarOpen(false); setPropertiesOpen(false);
        }
        if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.1, 3));
        if (e.key === '-') setZoom(z => Math.max(z - 0.1, 0.25));
        if (e.key === '0') setZoom(1);

        // Arrow Key Movement
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 8 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          moveNodes(selectedIds, dx, dy);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectAll, copyToClipboard, pasteFromClipboard, duplicateSelected, deleteSelected, selectedIds, setActiveTool, setZoom]);

  const lastSelectedId = selectedIds[selectedIds.length - 1];
  const selectedNode = nodes.find(n => n.id === lastSelectedId) ?? null;
  const selectedEdge = edges.find(e => e.id === lastSelectedId) ?? null;

  // Google Sheets Sync Simulation
  useEffect(() => {
    if (!user || !sheetUrl || nodes.length === 0) return;
    
    const sync = async () => {
      setIsSyncing(true);
      try {
        // REAL SYNC: POST to Google Apps Script
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            user,
            nodes,
            edges,
            timestamp: new Date().toISOString()
          })
        });
        console.log('SYNC_REAL: Push success to Google Sheets.');
      } catch (e) {
        console.error('SYNC_FAIL:', e);
      } finally {
        // Add a small delay so the user sees the 'Stable' status transition
        await new Promise(r => setTimeout(r, 600));
        setIsSyncing(false);
      }
    };

    const timer = setTimeout(sync, 2500); // Debounced sync
    return () => clearTimeout(timer);
  }, [nodes, edges, title, user, sheetUrl, setIsSyncing]);

  // Auto-open properties when something is selected on mobile
  useEffect(() => {
    if (selectedIds.length > 0 && window.innerWidth <= 1024) {
      setPropertiesOpen(true);
      setSidebarOpen(false);
    }
  }, [selectedIds]);

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('editor')} />;
  }

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', 
      background: 'var(--black)', position: 'relative', color: 'var(--soft-gray)' 
    }}>
      {/* Background Atmosphere */}
      <div className="neural-glow" />
      <div className="noise" />

      {/* Neural Framework (Dark) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100,
        border: '1px solid rgba(255, 255, 255, 0.03)', margin: 12, borderRadius: 20
      }}>
        <div className="hud-bracket hud-tl" style={{ position: 'absolute', top: 0, left: 0 }} />
        <div className="hud-bracket hud-tr" style={{ position: 'absolute', top: 0, right: 0 }} />
        <div className="hud-bracket hud-bl" style={{ position: 'absolute', bottom: 0, left: 0 }} />
        <div className="hud-bracket hud-br" style={{ position: 'absolute', bottom: 0, right: 0 }} />
        
        {/* Status Tag */}
        <div className="tech-tag" style={{ 
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          borderTop: 'none', borderRadius: '0 0 12px 12px'
        }}>
          PROTOCOL_V4 // UPLINK_STABLE
        </div>

        {/* Metadata */}
        <div className="desktop-only" style={{ position: 'absolute', bottom: 16, left: 24, fontSize: 10, color: 'var(--muted)', fontWeight: 600, fontFamily: 'Geist Mono', letterSpacing: '0.1em' }}>
          ENTITIES: {nodes.length} // LINKS: {edges.length}
        </div>
        <div className="desktop-only" style={{ position: 'absolute', bottom: 16, right: 24, fontSize: 10, color: 'var(--muted)', fontWeight: 600, fontFamily: 'Geist Mono', letterSpacing: '0.1em' }}>
          JOURNAL_PRESET: NATURE_STD
        </div>
      </div>

      <TopBar
        title={title}
        onTitleChange={setTitle}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onIngestClick={() => setShowIngest(true)}
        onExport={handleExport}
        onZoomIn={() => setZoom(z => Math.min(z + 0.1, 3))}
        onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.25))}
        onZoomReset={() => setZoom(1)}
        onFitView={fitView}
        zoom={zoom}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        propertiesOpen={propertiesOpen}
        setPropertiesOpen={setPropertiesOpen}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        isSyncing={isSyncing}
        sheetUrl={sheetUrl}
        onSettingsClick={() => setShowCloudSettings(true)}
      />

      <div className="editor-layout">
        
        {/* Mobile Overlay Background */}
        <div 
          className={`mobile-overlay-bg ${sidebarOpen || propertiesOpen ? 'active' : ''}`}
          onClick={() => { setSidebarOpen(false); setPropertiesOpen(false); }}
        />

        {/* Sidebar */}
        <div className={`glass-panel sidebar-panel ${sidebarOpen ? 'open' : ''}`} style={{ borderRadius: 20, overflow: 'hidden', display: 'flex' }}>
          <Sidebar onAddComponent={addNode} onLoadTemplate={loadTemplate} />
        </div>

        {/* Canvas Area */}
        <div className="glass-panel canvas-container" style={{ flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden', zIndex: 10 }}>
          <CanvasArea
            nodes={nodes}
            edges={edges}
            selectedIds={selectedIds}
            activeTool={activeTool}
            onSelectNodes={setSelectedIds}
            onMoveNodes={moveNodes}
            onUpdateNode={updateNode}
            onAddEdge={addEdge}
            onDeleteEdge={deleteEdge}
            onAddNodeAt={addNodeAt}
            onDragEnd={() => {}}
            onToolChange={setActiveTool}
            zoom={zoom}
            onZoomChange={setZoom}
            pan={pan}
            onPanChange={setPan}
          />
          <QuickGuide />
        </div>

        {/* Properties Panel */}
        <div className={`glass-panel properties-panel ${propertiesOpen ? 'open' : ''}`} style={{ borderRadius: 20, overflow: 'hidden' }}>
          <PropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            selectedCount={selectedIds.length}
            onUpdate={updateNode}
            onUpdateEdge={updateEdge}
            onUpdateLive={(id, updates) => {
              const n = nodes.find(x => x.id === id);
              if (n) {
                const dx = updates.x !== undefined ? updates.x - n.x : 0;
                const dy = updates.y !== undefined ? updates.y - n.y : 0;
                if (dx !== 0 || dy !== 0) moveNodes([id], dx, dy);
                else updateNode(id, updates);
              } else {
                updateEdge(id, updates as any);
              }
            }}
            onDelete={deleteSelected}
            onDuplicate={duplicateSelected}
            onAlign={alignNodes}
            onDistribute={distributeNodes}
          />
        </div>

      </div>

      {showIngest && <IngestModal onClose={() => setShowIngest(false)} onApply={handleIngestApply} />}
      <AnimatePresence>
        {showAuth && (
          <AuthModal 
            onClose={() => setShowAuth(false)} 
            onSuccess={(u) => { setUser(u); setShowAuth(false); }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCloudSettings && (
          <CloudSettingsModal 
            url={sheetUrl} 
            onUrlChange={setSheetUrl} 
            onClose={() => setShowCloudSettings(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
