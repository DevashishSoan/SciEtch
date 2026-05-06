import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  category: string;
}

export default function InfoModal({ isOpen, onClose, title, content, category }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(16px)' }} 
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="glass-panel"
            style={{ 
              width: '100%', maxWidth: 600, borderRadius: 24, padding: 48, position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
              background: 'var(--dark)'
            }}
          >
            <div className="neural-glow" style={{ opacity: 0.3 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 8 }}>{category.toUpperCase()} // PROTOCOL_INFO</span>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h2>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ fontSize: 16, color: 'var(--soft-gray)', lineHeight: 1.8, maxHeight: '60vh', overflowY: 'auto', paddingRight: 12 }}>
              {content.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: 20 }}>{para}</p>
              ))}
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border2)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn btn-p" style={{ padding: '12px 32px' }}>Acknowledge</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
