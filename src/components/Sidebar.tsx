import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ComponentDef {
  label: string;
  icon: string;
  type: string;
  color: string;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  items: ComponentDef[];
}

const CATEGORIES: Category[] = [
  {
    id: 'flowchart', title: 'FLOWCHART', icon: '🔷',
    items: [
      { label: 'Process', icon: '▭', type: 'process', color: '#53E6D4' },
      { label: 'Decision', icon: '◇', type: 'decision', color: '#10B981' },
      { label: 'Input/Output', icon: '▱', type: 'input', color: '#F59E0B' },
      { label: 'Terminal', icon: '⬭', type: 'output', color: '#6045F4' },
    ],
  },
  {
    id: 'biology', title: 'BIOLOGY', icon: '🧬',
    items: [
      { label: 'Cell', icon: '⬡', type: 'biology', color: '#10B981' },
      { label: 'DNA Helix', icon: '🧬', type: 'biology', color: '#53E6D4' },
      { label: 'Protein', icon: '⬠', type: 'biology', color: '#6045F4' },
      { label: 'Virus', icon: '⬢', type: 'biology', color: '#EF4444' },
    ],
  },
  {
    id: 'chemistry', title: 'CHEMISTRY', icon: '⚗️',
    items: [
      { label: 'Molecule', icon: '⬡', type: 'chemistry', color: '#53E6D4' },
      { label: 'Rxn Arrow', icon: '⟶', type: 'chemistry', color: '#F59E0B' },
      { label: 'Flask', icon: '⊗', type: 'chemistry', color: '#6045F4' },
      { label: 'Beaker', icon: '⊕', type: 'chemistry', color: '#10B981' },
    ],
  },
  {
    id: 'data', title: 'DATA / STATS', icon: '📊',
    items: [
      { label: 'Bar Chart', icon: '▦', type: 'data', color: '#53E6D4' },
      { label: 'Scatter Plot', icon: '⁘', type: 'data', color: '#F59E0B' },
      { label: 'Heatmap', icon: '▤', type: 'data', color: '#EF4444' },
      { label: 'Table', icon: '⊞', type: 'data', color: '#6045F4' },
    ],
  },
];

const TEMPLATES = [
  { label: 'Blank Canvas', icon: '📄', desc: 'Start with an empty workspace' },
  { label: 'CRISPR Workflow', icon: '🧬', desc: '5-step gene editing pipeline' },
  { label: 'Clinical Trial', icon: '📊', desc: 'Phase I–III RCT diagram' },
  { label: 'ML Pipeline', icon: '🔷', desc: 'Data → Train → Evaluate' },
];

interface SidebarProps {
  onAddComponent: (def: ComponentDef) => void;
  onLoadTemplate?: (name: string) => void;
}

export default function Sidebar({ onAddComponent, onLoadTemplate }: SidebarProps) {
  const [tab, setTab] = useState<'components' | 'templates'>('components');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  const filtered = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter(cat => cat.items.length > 0)
    : CATEGORIES;

  return (
    <aside style={{
      width: '100%', background: 'transparent',
      display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0,
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border2)', background: 'rgba(255,255,255,0.02)' }}>
        {(['components', 'templates'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '16px', border: 'none', background: 'transparent',
              color: tab === t ? 'var(--mint)' : 'var(--muted)', fontSize: 10, fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.3s',
              borderBottom: tab === t ? '2px solid var(--mint)' : 'none',
              textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Geist Mono'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === 'components' && (
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border2)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border2)',
            borderRadius: 10, padding: '10px 16px',
          }}>
            <span style={{ color: 'var(--mint)', fontSize: 14, opacity: 0.5 }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter Protocols..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 11, width: '100%',
                fontFamily: "Geist Mono",
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }} className="custom-scrollbar">
        {tab === 'components' ? (
          filtered.map(cat => (
            <div key={cat.id} style={{ marginBottom: 4 }}>
              <button onClick={() => toggle(cat.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 20px', background: 'none', border: 'none',
                color: '#fff', fontSize: 9, fontWeight: 900, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Geist Mono'
              }}>
                <span style={{ opacity: 0.6 }}>{cat.icon}</span>
                <span style={{ flex: 1, letterSpacing: '0.2em', opacity: 0.8 }}>{cat.title}</span>
                <span style={{ fontSize: 8, transition: 'transform 0.3s', transform: collapsed[cat.id] ? 'rotate(-90deg)' : 'rotate(0)', opacity: 0.3 }}>▼</span>
              </button>
              {!collapsed[cat.id] && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '4px 16px 20px' }}>
                  {cat.items.map(item => (
                    <motion.button
                      key={item.label}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onAddComponent(item)}
                      style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)',
                        borderRadius: 14, padding: '14px 8px',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}40`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; }}
                    >
                      <div style={{ 
                        fontSize: 22, color: item.color, 
                        filter: `drop-shadow(0 0 10px ${item.color}30)` 
                      }}>{item.icon}</div>
                      <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 800, fontFamily: 'Geist Mono' }}>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TEMPLATES.map(t => (
              <motion.div 
                key={t.label} 
                whileHover={{ x: 4, borderColor: 'var(--mint)', background: 'rgba(255,255,255,0.03)' }}
                onClick={() => onLoadTemplate?.(t.label)} 
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)',
                  borderRadius: 16, padding: '18px', cursor: 'pointer', transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: 'Geist Mono', letterSpacing: '0.05em' }}>{t.label}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Version badge */}
      <div style={{
        padding: '20px', borderTop: '1px solid var(--border2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{
          background: 'rgba(83, 230, 212, 0.08)', border: '1px solid rgba(83, 230, 212, 0.2)',
          borderRadius: 6, padding: '4px 10px',
          fontSize: 9, color: 'var(--mint)', fontWeight: 800, fontFamily: 'Geist Mono'
        }}>v2.0.4-LTS</div>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', fontWeight: 900, fontFamily: 'Geist Mono', letterSpacing: '0.1em' }}>SciEtch_OS</span>
      </div>
    </aside>
  );
}
