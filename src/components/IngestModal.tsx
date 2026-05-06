import React, { useState } from 'react';
import type { CanvasNode, CanvasEdge } from '../types';

interface IngestModalProps {
  onClose: () => void;
  onApply: (nodes: CanvasNode[], edges: CanvasEdge[], title: string) => void;
}

const SYSTEM_PROMPT = `You are a scientific diagram parser for complex research. Given a dense interdisciplinary research abstract (up to 600 words), extract the complete methodology as a high-fidelity process flow. 
Return ONLY valid JSON:
{
  "title": "short academic project title",
  "nodes": [
    {"id": "1", "label": "Specific Step (include metrics like 300 DPI, CMYK, or 8px grid if present)", "type": "process|input|output|decision"}
  ],
  "edges": [
    {"from": "1", "to": "2", "label": "transition context"}
  ]
}
Extract up to 20 detailed nodes. Types: "input" (materials/initial state), "process" (methods), "output" (final results), "decision" (branching/validation).
CRITICAL:
1. Capture ALL specific quantitative metrics and technical parameters.
2. Map complex feedback loops with backward edges.
3. For long abstracts, ensure the sequence of operations is strictly preserved.`;

const TYPE_COLOR: Record<string, string> = {
  input: '#F59E0B',
  process: '#00D4FF',
  output: '#8B5CF6',
  decision: '#10B981',
};

export default function IngestModal({ onClose, onApply }: IngestModalProps) {
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const steps = ['Reading abstract…', 'Extracting methodology…', 'Mapping process flow…', 'Optimising layout…', 'Finalising schematic…'];

  const analyze = async () => {
    if (!abstract.trim()) return;
    setLoading(true);
    setError('');
    setStep(0);

    const ticker = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_KEY || 'YOUR_API_KEY'}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SciEtch',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-27b-it',
          max_tokens: 2048,
          temperature: 0.1,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: abstract },
          ],
        }),
      });
      const data = await res.json();
      const rawContent = data?.choices?.[0]?.message?.content ?? '';
      // Strip markdown code fences that Gemma tends to wrap around JSON
      const raw = rawContent.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(raw);

      const NODE_W = 220, NODE_H = 80;
      const gapX = 280, gapY = 220;
      const nodesPerRow = 4;

      const nodes: CanvasNode[] = parsed.nodes.map((n: any, i: number) => {
        const row = Math.floor(i / nodesPerRow);
        const col = i % nodesPerRow;
        // Z-pattern layout for flow
        const isEvenRow = row % 2 === 0;
        const xPos = isEvenRow ? (80 + col * gapX) : (80 + (nodesPerRow - 1 - col) * gapX);

        return {
          id: n.id,
          label: n.label,
          type: n.type,
          x: xPos,
          y: 100 + row * gapY,
          color: TYPE_COLOR[n.type] ?? '#00D4FF',
          fontSize: 12,
          width: NODE_W,
          height: NODE_H,
        };
      });

      const edges: CanvasEdge[] = (parsed.edges ?? []).map((e: any, i: number) => ({
        id: `e-${i}`,
        from: e.from,
        to: e.to,
        label: e.label,
      }));

      clearInterval(ticker);
      onApply(nodes, edges, parsed.title || '');
      onClose();
    } catch (e: any) {
      clearInterval(ticker);
      setError('Failed to parse abstract. Check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-fade-in" style={{
        background: 'rgba(13, 18, 28, 0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid var(--border)', borderRadius: 20,
        width: 640, maxWidth: '95vw', padding: 40, position: 'relative',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(83, 230, 212, 0.1) inset',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 22 }}>✨</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Geist Mono', letterSpacing: '0.05em' }}>NEURAL_INGEST</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0 0' }}>Paste abstract to synthesize graph topology</p>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)',
            color: 'var(--muted)', fontSize: 16, cursor: 'pointer', width: 32, height: 32,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>✕</button>
        </div>

        {/* Textarea */}
        <textarea
          value={abstract}
          onChange={e => setAbstract(e.target.value)}
          placeholder="[PASTE RESEARCH ABSTRACT HERE]"
          disabled={loading}
          style={{
            width: '100%', minHeight: 180, background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border2)', borderRadius: 12, padding: '16px',
            color: '#fff', fontSize: 14, fontFamily: "'Geist Mono', monospace",
            resize: 'vertical', outline: 'none', lineHeight: 1.6,
            transition: 'all 0.3s', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = 'inset 0 4px 20px rgba(0,0,0,0.5), 0 0 20px rgba(83,230,212,0.1)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'inset 0 4px 20px rgba(0,0,0,0.5)' }}
        />

        {/* Loading overlay */}
        {loading && (
          <div style={{
            marginTop: 24, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '24px',
            border: '1px solid var(--border2)', textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(83, 230, 212, 0.05), transparent)', animation: 'shimmer 2s infinite', transform: 'translateX(-100%)' }} />
            <div style={{
              width: 48, height: 48, border: '3px solid rgba(83, 230, 212, 0.1)',
              borderTopColor: 'var(--mint)', borderRadius: '50%', margin: '0 auto 16px',
              animation: 'spin 1s linear infinite', boxShadow: '0 0 20px rgba(83,230,212,0.2)'
            }} />
            <p style={{ color: 'var(--mint)', fontSize: 13, fontFamily: "'Geist Mono', monospace", margin: 0, fontWeight: 700, letterSpacing: '0.1em' }}>
              {steps[step]}
            </p>
            <div style={{ marginTop: 16, height: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, var(--royal), var(--mint))',
                borderRadius: 2, width: `${((step + 1) / steps.length) * 100}%`,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 10px var(--mint)'
              }} />
            </div>
          </div>
        )}

        {error && (
          <p style={{ marginTop: 12, color: '#F85149', fontSize: 12, background: '#21262D', padding: '8px 12px', borderRadius: 6 }}>
            ⚠ {error}
          </p>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_COLOR).map(([t, c]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, color: '#8B949E', textTransform: 'capitalize' }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
          <button onClick={onClose} style={{
            padding: '12px 24px', background: 'transparent', border: '1px solid var(--border2)',
            borderRadius: 10, color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Geist Mono', monospace", fontWeight: 700, transition: 'all 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>CANCEL</button>
          <button
            onClick={analyze}
            disabled={loading || !abstract.trim()}
            style={{
              padding: '12px 32px',
              background: abstract.trim() && !loading ? 'rgba(83, 230, 212, 0.1)' : 'rgba(0,0,0,0.5)',
              border: `1px solid ${abstract.trim() && !loading ? 'var(--mint)' : 'var(--border2)'}`,
              borderRadius: 10, color: abstract.trim() && !loading ? 'var(--mint)' : 'var(--muted)',
              fontSize: 12, fontWeight: 800, cursor: loading || !abstract.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em',
              fontFamily: "'Geist Mono', monospace", transition: 'all 0.3s',
              boxShadow: abstract.trim() && !loading ? '0 0 20px rgba(83,230,212,0.2)' : 'none',
            }}
          >
            SYNTHESIZE_TOPOLOGY
          </button>
        </div>
      </div>
    </div>
  );
}
