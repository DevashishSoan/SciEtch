import React from 'react';
import { motion } from 'framer-motion';

interface CloudSettingsModalProps {
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
}

export default function CloudSettingsModal({ url, onUrlChange, onClose }: CloudSettingsModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(5, 7, 10, 0.8)', backdropFilter: 'blur(12px)' }} 
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel"
        style={{ 
          width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
        }}
      >
        <div className="neural-glow" />
        
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Google Sheets Bridge</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Paste your Google Apps Script Web App URL below to enable real-time cloud synchronization. All changes will be saved as new rows in your spreadsheet.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, fontFamily: 'Geist Mono' }}>WEBHOOK_ENDPOINT_URL</label>
          <input 
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', 
              borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none', width: '100%' 
            }} 
          />
        </div>

        <div style={{ padding: 16, background: 'rgba(83, 230, 212, 0.05)', borderRadius: 12, border: '1px solid rgba(83, 230, 212, 0.2)', marginBottom: 24 }}>
          <h4 style={{ fontSize: 12, color: 'var(--mint)', marginBottom: 8, fontWeight: 700 }}>CONNECTION_STATUS</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: url ? 'var(--mint)' : '#EF4444' }} />
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>
              {url ? 'UPLINK_READY_FOR_HANDSHAKE' : 'ENDPOINT_MISSING'}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="btn btn-p" 
          style={{ width: '100%', height: 48, borderRadius: 12, fontSize: 14, fontWeight: 800 }}
        >
          CONFIRM_UPLINK
        </button>

        <button 
          onClick={onClose}
          style={{ width: '100%', height: 48, background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
