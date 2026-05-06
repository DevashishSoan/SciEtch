import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── WORLD-CLASS PARTICLE SYSTEM (WebGL-inspired Canvas) ────────────────────
export function ParticleCanvas() {
  const r = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const c = r.current;
    if (!c) return;
    const x = c.getContext('2d');
    if (!x) return;
    
    let id = 0;
    let P: any[] = [];
    
    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      x.scale(dpr, dpr);
      c.style.width = `${window.innerWidth}px`;
      c.style.height = `${window.innerHeight}px`;
      
      P = Array.from({ length: 60 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        s: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.2 + 0.1
      }));
    };

    init();

    const tick = () => {
      x.clearRect(0, 0, window.innerWidth, window.innerHeight);
      P.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
        x.beginPath(); x.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        x.fillStyle = `rgba(96, 69, 244, ${p.o})`; x.fill();
      });
      
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          if (d < 180) {
            x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y);
            x.strokeStyle = `rgba(83, 230, 212, ${0.08 * (1 - d / 180)})`; 
            x.lineWidth = 0.5; 
            x.stroke();
          }
        }
      }
      id = requestAnimationFrame(tick);
    };
    
    tick();
    
    const onR = () => { cancelAnimationFrame(id); init(); tick(); };
    window.addEventListener('resize', onR);
    
    return () => { 
      cancelAnimationFrame(id); 
      window.removeEventListener('resize', onR); 
    };
  }, []);
  
  return <canvas ref={r} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none', opacity: 0.4 }} />;
}

// ── FEATURE VISUALIZATION (Mini animated diagrams) ─────────────────────────
export function FeatureVisualization({ type }: { type: 'neural' | 'topology' | 'link' }) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div style={{ height: 100, width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginTop: 20, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
      {type === 'neural' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <motion.div key={i} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(83,230,212,0.3)', background: 'rgba(83,230,212,0.1)' }} animate={reduceMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          ))}
          <motion.div style={{ width: 40, height: 2, background: 'rgba(96,69,244,0.4)' }} animate={reduceMotion ? {} : { opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
          <motion.div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--royal)', background: 'rgba(96,69,244,0.1)' }} animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
        </div>
      )}
      {type === 'topology' && (
        <svg width="100%" height="100%" viewBox="0 0 200 100">
          <motion.path d="M40,50 L100,20 L160,50 L100,80 Z" fill="none" stroke="var(--mint)" strokeWidth="1" animate={reduceMotion ? {} : { strokeDashoffset: [400, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} strokeDasharray="400" opacity="0.5" />
          <motion.circle cx="100" cy="50" r="4" fill="var(--royal)" animate={reduceMotion ? {} : { opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
        </svg>
      )}
      {type === 'link' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
           <motion.div style={{ width: 30, height: 2, background: 'var(--mint)' }} animate={reduceMotion ? {} : { scaleX: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
           <div style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid var(--royal)' }} />
           <motion.div style={{ width: 30, height: 2, background: 'var(--mint)' }} animate={reduceMotion ? {} : { scaleX: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        </div>
      )}
    </div>
  );
}

// ── SIGNATURE INTERACTION: LIVE TRANSFORMATION ──────────────────────────────
export function HeroSignatureInteraction({ onLaunch }: { onLaunch: () => void }) {
  const [state, setState] = useState<'idle' | 'scanning' | 'generating' | 'complete'>('idle');
  const [text, setText] = useState('');
  
  const handleStart = () => {
    if (!text) return;
    setState('scanning');
    setTimeout(() => setState('generating'), 2500);
    setTimeout(() => setState('complete'), 5500);
  };

  const renderHighlightedText = () => {
    if (!text) return null;
    const words = text.split(' ');
    return words.map((w, i) => {
      const isKey = w.length > 5 && i % 4 === 0;
      return <span key={i} style={{ color: isKey ? 'var(--mint)' : 'var(--soft-gray)', textShadow: isKey ? '0 0 8px rgba(83, 230, 212, 0.4)' : 'none', transition: 'color 0.3s' }}>{w} </span>;
    });
  };

  return (
    <div className="glass-panel" style={{ padding: 32, width: '100%', borderRadius: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(96, 69, 244, 0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>// abstract ingest</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: state === 'idle' ? 'var(--muted)' : 'var(--mint)', boxShadow: state !== 'idle' ? '0 0 10px var(--mint)' : 'none' }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label htmlFor="abstract-input" className="sr-only" style={{ display: 'none' }}>Enter Research Abstract</label>
            <textarea 
              id="abstract-input"
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your research abstract here..."
              style={{ width: '100%', height: 140, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 20, color: '#fff', fontFamily: 'Geist Mono', fontSize: 13, resize: 'none', outline: 'none' }}
            />
            <button onClick={handleStart} className="btn btn-p" style={{ marginTop: 24, width: '100%' }}>
              Synthesize Schematic →
            </button>
          </motion.div>
        )}

        {state === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: 180 }}>
            <div style={{ fontFamily: 'Geist Mono', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 12, border: '1px solid var(--border2)' }}>
              {renderHighlightedText()}
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mint)', letterSpacing: '0.1em' }}>EXTRACTING PRIMITIVES...</div>
              <motion.div style={{ height: 2, background: 'var(--mint)', marginTop: 12, transformOrigin: 'left' }} animate={{ scaleX: [0, 1] }} transition={{ duration: 2.5, ease: 'linear' }} />
            </div>
          </motion.div>
        )}

        {state === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: 200, textAlign: 'center' }}>
            <ScientificViz size={180} animated={true} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--royal)', letterSpacing: '0.1em', marginTop: 24 }}>COMPUTING TOPOLOGY...</div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div key="complete" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', minHeight: 200 }}>
            <ScientificViz size={180} animated={false} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', margin: '24px 0' }}>✓ Topology Stable. Schematic Ready.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onLaunch} className="btn btn-p" style={{ flex: 1 }}>Open Editor</button>
              <button onClick={() => { setText(''); setState('idle'); }} className="btn btn-g" style={{ flex: 1 }}>Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ENHANCED SCIENTIFIC VISUALIZATION ──────────────────────────────────────
export function ScientificViz({ size = 340, animated = true }: { size?: number, animated?: boolean }) {
  const nodes = [{ x: 100, y: 80 }, { x: 260, y: 40 }, { x: 260, y: 140 }, { x: 420, y: 90 }, { x: 560, y: 90 }];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <svg width="100%" height={size} viewBox="0 0 620 180" style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 12px rgba(96, 69, 244, 0.2))' }}>
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--royal)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="var(--mint)" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <motion.line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="url(#lg)" strokeWidth="2" 
          initial={animated && !reduceMotion ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.6 }} 
          animate={{ pathLength: 1, opacity: 0.6 }} 
          transition={{ duration: 1.2, delay: i * 0.2 }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.g key={i} 
          initial={animated && !reduceMotion ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.4, delay: animated ? i * 0.15 : 0 }}
        >
          <rect x={n.x - 40} y={n.y - 20} width={80} height={40} rx={8} fill="rgba(13, 18, 28, 0.95)" stroke="var(--mint)" strokeWidth="1.5" />
          <text x={n.x} y={n.y + 4} fontFamily="Geist Mono" fontSize="10" fill="var(--soft-gray)" textAnchor="middle">NODE_{i}</text>
        </motion.g>
      ))}
    </svg>
  );
}
