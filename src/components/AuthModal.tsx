import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; institution: string }) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !acceptedTerms) return;
    setLoading(true);
    // Simulate Google Sheets Auth / API call
    setTimeout(() => {
      onSuccess({ 
        email, 
        name: isLogin ? (email.split('@')[0]) : name, 
        institution: isLogin ? 'Independent Researcher' : institution 
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(5, 7, 10, 0.8)', backdropFilter: 'blur(12px)' }} 
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel"
        style={{ 
          width: '100%', maxWidth: 440, borderRadius: 24, padding: 40, position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
        }}
      >
        <div className="neural-glow" />
        
        {/* HUD Elements */}
        <div className="hud-bracket hud-tl" style={{ position: 'absolute', top: 12, left: 12 }} />
        <div className="hud-bracket hud-tr" style={{ position: 'absolute', top: 12, right: 12 }} />
        <div className="hud-bracket hud-bl" style={{ position: 'absolute', bottom: 12, left: 12 }} />
        <div className="hud-bracket hud-br" style={{ position: 'absolute', bottom: 12, right: 12 }} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="SciEtch" style={{ 
            width: 56, height: 56, borderRadius: 14, 
            margin: '0 auto 20px auto', 
            boxShadow: '0 8px 24px rgba(96, 69, 244, 0.4)'
          }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {isLogin ? 'Neural Link Initialized' : 'Create Research Identity'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'Geist Mono' }}>
            {isLogin ? 'ACCESS_LEVEL: RESTRICTED' : 'INITIALIZING_UPLINK_PROTOCOL'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, fontFamily: 'Geist Mono', marginLeft: 4 }}>NAME_STRING</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Dr. Jane Doe" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, fontFamily: 'Geist Mono', marginLeft: 4 }}>EMAIL_ID</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="researcher@institute.edu" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, fontFamily: 'Geist Mono', marginLeft: 4 }}>PASS_PHRASE</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          </div>

          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, fontFamily: 'Geist Mono', marginLeft: 4 }}>INSTITUTION_ID</label>
              <input required value={institution} onChange={e => setInstitution(e.target.value)} type="text" placeholder="MIT / CERN / Independent" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
            </div>
          )}
          
          {!isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input 
                type="checkbox" 
                id="tc"
                required
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--mint)', width: 16, height: 16 }}
              />
              <label htmlFor="tc" style={{ fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                I agree to the <span style={{ color: 'var(--mint)', fontWeight: 700 }}>Terms of Protocol</span> and Research Integrity standards.
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || (!isLogin && !acceptedTerms)}
            className="btn btn-p" 
            style={{ marginTop: 12, width: '100%', height: 50, borderRadius: 12, fontSize: 14, fontWeight: 800, position: 'relative' }}
          >
            {loading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              isLogin ? 'AUTHORIZE_UPLINK' : 'CREATE_IDENTITY'
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            {isLogin ? "Don't have an identity? Register here" : "Already have an identity? Authorized Login"}
          </button>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: 'Geist Mono' }}>
            <div style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%' }} />
            ENCRYPTED_AES256
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, fontFamily: 'Geist Mono' }}>
            <div style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%' }} />
            GOOGLE_SHEETS_DB
          </div>
        </div>
      </motion.div>
    </div>
  );
}
