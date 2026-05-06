import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    { title: 'Draw & Drop', desc: 'Select a shape tool from the top bar or drag a scientific primitive from the left sidebar onto the canvas.' },
    { title: 'Connect Logic', desc: 'Use the Arrow tool (➚) to draw causal links between nodes. Click the source, then click the destination.' },
    { title: 'Refine Data', desc: 'Select any node to open the Properties Panel on the right. Edit labels, colors, and scientific metadata.' },
    { title: 'AI Synthesis', desc: 'Click INGEST to paste a research abstract. The Neural Engine will automatically generate a schematic.' },
    { title: 'Export Figure', desc: 'Click EXPORT to download your schematic as a high-resolution PNG, Print-Ready PDF, or scalable SVG.' }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'fixed', bottom: 24, right: 24, zIndex: 500, 
          width: 48, height: 48, borderRadius: '50%', background: 'var(--panel)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--mint)', fontSize: 20, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'all 0.2s', fontFamily: 'serif'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ?
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: 84, right: 24, zIndex: 600, width: 340,
              background: 'rgba(10, 13, 18, 0.95)', backdropFilter: 'blur(30px)',
              border: '1px solid var(--border2)', borderRadius: 20, padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 800 }}>SciEtch Quick Guide</h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}
              >✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ 
                    width: 24, height: 24, borderRadius: '50%', background: 'rgba(83, 230, 212, 0.1)', 
                    color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: 'Geist Mono'
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 13, color: '#fff', fontWeight: 700 }}>{s.title}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border2)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--soft-gray)', fontFamily: 'Geist Mono' }}>
                For further support, consult the documentation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
