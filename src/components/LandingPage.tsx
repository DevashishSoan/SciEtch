import React, { useEffect, useRef } from 'react';
import { ParticleCanvas, HeroSignatureInteraction, FeatureVisualization } from './LandingComponents';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const ambientRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 1. Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 2. Parallax and Ambient Glow Logic (Optimized)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame: number;
    let isHeroVisible = true;
    
    // Observer to pause animation loop when hero is off-screen
    const heroObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    
    if (heroSectionRef.current) heroObserver.observe(heroSectionRef.current);

    if (!reduceMotion) {
      let targetX = 0, targetY = 0, curX = 0, curY = 0;
      
      const handleMouseMove = (e: MouseEvent) => {
        targetX = e.clientX - window.innerWidth / 2;
        targetY = e.clientY - window.innerHeight / 2;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const update = () => {
        if (isHeroVisible) {
          curX += (targetX - curX) * 0.05;
          curY += (targetY - curY) * 0.05;
          
          if (ambientRef.current) {
            ambientRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
          }
          
          if (heroCardRef.current && window.innerWidth > 1024) {
            const tiltX = (curY / window.innerHeight) * 15;
            const tiltY = -(curX / window.innerWidth) * 15;
            heroCardRef.current.style.transform = `perspective(2000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${Math.sin(Date.now() / 1000) * 8}px)`;
          } else if (heroCardRef.current) {
            heroCardRef.current.style.transform = 'none';
          }
        }
        animationFrame = requestAnimationFrame(update);
      };

      update();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrame);
        revealObserver.disconnect();
        heroObserver.disconnect();
      };
    }

    return () => revealObserver.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh', position: 'relative' }}>
      <div className="noise" aria-hidden="true" />
      <div className="grid-bg" aria-hidden="true" />
      <div className="ambient-glow" ref={ambientRef} aria-hidden="true" />
      <ParticleCanvas />

      {/* Nav */}
      <nav aria-label="Main Navigation" style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: 1200, height: 56, zIndex: 1000,
        background: 'rgba(10, 13, 18, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border2)', borderRadius: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        <a href="#" className="logo" aria-label="SciEtch Home">
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 12 }} />
          SciEtch
        </a>
        <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
          <a href="#features">Features</a>
          <a href="#how">Process</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button onClick={onLaunch} className="btn btn-p">Launch App</button>
      </nav>

      <main>
        {/* Hero Section */}
        <section ref={heroSectionRef} className="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, overflow: 'hidden' }}>
          <div className="wrap">
            <div className="hero-grid">
              <div className="reveal">
                <h1 style={{ fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 800, marginBottom: 24, color: '#fff', lineHeight: 1.1 }}>
                  The Future of<br /><span className="serif" style={{ fontSize: '1.25em', background: 'linear-gradient(135deg, var(--royal), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: 8, verticalAlign: 'baseline' }}>Scientific</span><br />Communication.
                </h1>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 300, color: 'var(--muted)', maxWidth: 580, marginBottom: 48, lineHeight: 1.6 }}>
                  Transform raw research abstracts into publication-quality schematics in seconds. Built for the world's most innovative laboratories.
                </p>
                <div className="hero-ctas" style={{ display: 'flex', gap: 24, marginBottom: 64 }}>
                  <button onClick={onLaunch} className="btn btn-p">Start Building Free</button>
                  <button onClick={() => { document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn btn-g">View Process</button>
                </div>
                <div className="hero-stats" style={{ display: 'flex', gap: 64, paddingTop: 40, borderTop: '1px solid var(--border2)' }}>
                  <div className="stat-item">
                    <span className="stat-val" style={{ fontWeight: 600, fontSize: 26, color: '#fff' }}>40k+</span>
                    <span className="stat-label" style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7, display: 'block' }}>papers processed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-val" style={{ fontWeight: 600, fontSize: 26, color: '#fff' }}>99.2%</span>
                    <span className="stat-label" style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7, display: 'block' }}>accuracy rate</span>
                  </div>
                </div>
              </div>

              <div className="demo-card-wrap reveal" ref={heroCardRef} style={{ perspective: 2000 }}>
                <div className="hero-badge" style={{ marginBottom: 24, marginLeft: 'auto', display: 'flex', width: 'fit-content', alignItems: 'center', gap: 10, padding: '6px 16px', background: 'rgba(83, 230, 212, 0.05)', border: '1px solid var(--border)', borderRadius: 100, fontSize: 11, fontWeight: 600, color: 'var(--mint)' }}>
                  <div className="pulse" style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 10px var(--mint)', animation: 'pulse 2.5s infinite' }} />
                  Next-Gen Research Platform · v2.9
                </div>
                <HeroSignatureInteraction onLaunch={onLaunch} />
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section aria-label="Trusted Institutions" className="marquee" style={{ borderTop: '1px solid var(--border2)', borderBottom: '1px solid var(--border2)', padding: '32px 0', overflow: 'hidden', opacity: 0.6 }}>
          <div className="marquee-inner" aria-hidden="true">
            {['Harvard Medical School', 'MIT Media Lab', 'Stanford University', 'CERN Research', 'NASA JPL', 'DeepMind AI', 'Oxford University', 'Max Planck Institute'].map((item, i) => (
              <div key={i} className="marquee-item" style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item}</div>
            ))}
            {['Harvard Medical School', 'MIT Media Lab', 'Stanford University', 'CERN Research', 'NASA JPL', 'DeepMind AI', 'Oxford University', 'Max Planck Institute'].map((item, i) => (
              <div key={i + 8} className="marquee-item" style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item}</div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '160px 0' }}>
          <div className="wrap">
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 80 }}>
              <span className="eyebrow">Advanced Infrastructure</span>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#fff' }}>Built for <span className="serif" style={{ background: 'linear-gradient(135deg, var(--royal), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scientific</span> Precision.</h2>
            </div>
            <div className="features-grid">
              {[
                { icon: '🧠', title: 'Neural Synthesis', desc: 'Proprietary LLM architectures designed to extract methodology primitives from raw text.', comp: 'neural' },
                { icon: '📐', title: 'Optimal Topology', desc: 'Advanced graph-theoretic algorithms that arrange research concepts into hierarchies.', comp: 'topology' },
                { icon: '🔗', title: 'Semantic Linking', desc: 'Live cross-referencing with PubMed and arXiv to validate and map every research node.', comp: 'link' }
              ].map((f, i) => (
                <div key={i} className="feature-card reveal" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border2)', borderRadius: 24, padding: 48 }}>
                  <div className="feature-icon" style={{ width: 56, height: 56, background: 'rgba(96, 69, 244, 0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--mint)', marginBottom: 32 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 20, marginBottom: 16, color: '#fff' }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'Geist Mono', fontWeight: 300 }}>{f.desc}</p>
                  <FeatureVisualization type={f.comp as any} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="section-alt" style={{ background: 'var(--dark)', padding: '160px 0' }}>
          <div className="wrap">
            <div className="steps-grid">
              <div className="reveal">
                <span className="eyebrow">Execution Protocol</span>
                <h2 style={{ marginBottom: 32, fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff' }}>From Abstract to<br /><span className="serif" style={{ background: 'linear-gradient(135deg, var(--royal), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Schematic</span> in 3 Steps.</h2>
                <div className="step-list" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  {[
                    { n: '01', t: 'Ingest Research', d: 'Upload your research paper or paste your abstract. Our neural engine parses the text for core scientific entities.' },
                    { n: '02', t: 'Synthesize Nodes', d: 'Watch as the AI generates a structured graph of your methodology, identifying causal links and experimental variables.' },
                    { n: '03', t: 'Export Figures', d: 'Customize styles and export in high-resolution vector formats (SVG/PDF) ready for journal submission.' }
                  ].map((s, i) => (
                    <div key={i} className="step-item" style={{ display: 'flex', gap: 24 }}>
                      <div className="step-num" style={{ width: 32, height: 32, border: '1px solid var(--mint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist Mono', fontSize: 12, color: 'var(--mint)', flexShrink: 0 }}>{s.n}</div>
                      <div className="step-content">
                        <h3 style={{ fontSize: 20, marginBottom: 12, color: '#fff' }}>{s.t}</h3>
                        <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6 }}>{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal">
                <div className="live-demo-window" style={{ background: 'var(--black)', border: '1px solid var(--border2)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="window-header" style={{ height: 40, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
                    <div className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border2)' }} /><div className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border2)' }} /><div className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border2)' }} />
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>neural_renderer_v4.app</span>
                  </div>
                  <div className="demo-canvas" style={{ height: 400, position: 'relative', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', overflow: 'hidden' }}>
                    <div className="node" style={{ top: '20%', left: '15%', position: 'absolute', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', fontFamily: 'Geist Mono', fontSize: 12, color: 'var(--mint)' }}>CRISPR-Cas9</div>
                    <div className="node" style={{ top: '50%', left: '40%', position: 'absolute', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', fontFamily: 'Geist Mono', fontSize: 12, color: 'var(--mint)' }}>Gene Edit</div>
                    <div className="node" style={{ top: '30%', left: '70%', position: 'absolute', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', fontFamily: 'Geist Mono', fontSize: 12, color: 'var(--mint)' }}>Phenotype</div>
                    <div className="node" style={{ top: '70%', left: '60%', position: 'absolute', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', fontFamily: 'Geist Mono', fontSize: 12, color: 'var(--mint)' }}>Analysis</div>
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <line x1="25%" y1="25%" x2="45%" y2="52%" stroke="var(--mint)" strokeWidth="1" opacity="0.2" />
                      <line x1="45%" y1="52%" x2="70%" y2="35%" stroke="var(--mint)" strokeWidth="1" opacity="0.2" />
                      <line x1="45%" y1="52%" x2="60%" y2="75%" stroke="var(--mint)" strokeWidth="1" opacity="0.2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Ethics Section */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border2)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="wrap">
            <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <span className="eyebrow">Academic Integrity</span>
                <h2 style={{ fontSize: 28, color: '#fff', marginBottom: 20 }}>Upholding the <span className="serif" style={{ color: 'var(--mint)' }}>Gold Standard</span> of Research.</h2>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>SciEtch is built with a deep respect for scientific data provenance. Every synthesized node maintains a metadata link to its source abstract, ensuring that your visual methodology remains a true reflection of your peer-reviewed findings.</p>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {['Peer-Reviewed', 'Provenance-Locked', 'Ethics-Aligned'].map(t => (
                  <div key={t} style={{ padding: '12px 20px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Geist Mono' }}>
                    {t.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '160px 0' }}>
          <div className="wrap">
            <div className="reveal" style={{ textAlign: 'center' }}>
              <span className="eyebrow">Availability & Pricing</span>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', marginBottom: 24 }}>Free for <span className="serif" style={{ background: 'linear-gradient(135deg, var(--royal), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Researchers.</span></h2>
              <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.6 }}>
                SciEtch is currently free for academic and personal use during our public beta. Build, export, and publish without limits.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: 'rgba(83, 230, 212, 0.05)', border: '1px solid var(--border)', borderRadius: 100, color: 'var(--mint)', fontFamily: 'Geist Mono', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <div style={{ width: 8, height: 8, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 10px var(--mint)', animation: 'pulse 2.5s infinite' }} />
                Commercial Tiers Coming Soon
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: '0 0 160px 0' }}>
          <div className="wrap">
            <div className="cta-box reveal" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border2)', borderRadius: 32, padding: '80px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', marginBottom: 24, color: '#fff' }}>Ready to define the<br /><span className="serif" style={{ background: 'linear-gradient(135deg, var(--royal), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Next Frontier.</span></h2>
              <p style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 48, maxWidth: 520 }}>Join the world's most innovative research teams and transform your scientific communication today.</p>
              <div className="hero-ctas" style={{ display: 'flex', gap: 24 }}>
                <button onClick={onLaunch} className="btn btn-p">Launch SciEtch Free</button>
                <button className="btn btn-g">Book a Research Demo</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--border2)', background: 'var(--dark)' }}>
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <a href="#" className="logo" style={{ marginBottom: 24, display: 'inline-flex' }}>
                <img src="/logo.png" alt="" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 12 }} />
                SciEtch
              </a>
              <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 280 }}>The AI-native platform for transforming complex research into publication-ready figures.</p>
            </div>
            <div key="Product">
              <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', color: '#fff' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="#" className="footer-link">AI Synthesis</a>
                <a href="#" className="footer-link">Cloud Sync</a>
                <a href="#" className="footer-link">Export Suite</a>
                <a href="#" className="footer-link">Protocols</a>
              </div>
            </div>
            <div key="Company">
              <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', color: '#fff' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="#" className="footer-link">About Us</a>
                <a href="#" className="footer-link">Mission</a>
                <a href="#" className="footer-link">Security</a>
                <a href="#" className="footer-link">Privacy</a>
              </div>
            </div>
            <div key="Connect">
              <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', color: '#fff' }}>Connect</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="https://github.com/DevashishSoan/SciEtch" className="footer-link">GitHub</a>
                <a href="#" className="footer-link">Discord</a>
                <a href="#" className="footer-link">Twitter</a>
                <a href="#" className="footer-link">Support</a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', fontFamily: 'Geist Mono', flexWrap: 'wrap', gap: 16 }}>
            <span>© 2026 SciEtch Research Platform. All rights reserved.</span>
            <span>Built for Scientists, by Scientists. <strong>Made by Devashish Soan</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
