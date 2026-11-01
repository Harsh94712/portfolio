import { useEffect, useRef, useState } from 'react';
import profile from '../../shared/profile.json';
import Terminal from './components/Terminal.jsx';
import { Experience, Projects, Skills, Education, Contact } from './components/Sections.jsx';

const NAV = ['about', 'experience', 'projects', 'skills', 'education', 'contact'];

function useScrollSpy() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = NAV.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    const top = () => window.scrollY < 300 && setActive('');
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, []);
  return active;
}

function ProgressBar() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return <div className="progress" ref={ref} aria-hidden="true" />;
}

export default function App() {
  const [tech, setTech] = useState(null);
  const [theme, setTheme] = useState('dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const active = useScrollSpy();
  const toggleTech = (t) => setTech((cur) => (cur === t ? null : t));

  return (
    <>
      <ProgressBar />
      <a className="skip" href="#main">Skip to content</a>
      <header className="bar">
        <a className="brand" href="#top">{profile.handle}@portfolio</a>
        <div className="bar-right">
          <nav aria-label="Sections">
            {NAV.map((n) => (
              <a key={n} href={`#${n}`} className={active === n ? 'on' : ''} aria-current={active === n ? 'true' : undefined}>{n}</a>
            ))}
          </nav>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <p className="hero-kicker"><span className="status-dot" /> AVAILABLE FOR INTERNSHIPS & COLLABORATIONS</p>
          <h1>{profile.name}<span className="hero-period">.</span></h1>
          <p className="hero-role">{profile.role}</p>
          <p className="lede">{profile.tagline}</p>
          <div className="hero-actions">
            <a className="hero-cta primary" href="#projects">Explore projects <span aria-hidden="true">↘</span></a>
            <a className="hero-cta secondary" href="https://chat.harshsinha.in" target="_blank" rel="noreferrer">Chat With My Resume ↗</a>
          </div>
          <div className="hero-meta"><span>{profile.location}</span><span>React · Node.js · Python · AI</span></div>
          <div className="hero-tech" aria-label="Core technologies">
            <a href="#skills" title="Explore React skills"><span className="tech-mark react-mark">⚛</span> React</a>
            <a href="#skills" title="Explore Python skills"><span className="tech-mark python-mark">Py</span> Python</a>
            <a href="#skills" title="Explore JavaScript skills"><span className="tech-mark js-mark">JS</span> JavaScript</a>
            <a href="#skills" title="Explore AI skills"><span className="tech-mark ai-mark">✳</span> AI / GenAI</a>
            <a href="#experience" title="View cybersecurity experience"><span className="tech-mark cyber-mark">⌘</span> Cybersecurity</a>
          </div>
          <div className="hero-proof" aria-label="Profile highlights">
            <div><strong>05</strong><span>Projects</span></div>
            <div><strong>01</strong><span>VAPT Internship</span></div>
            <div><strong>01</strong><span>Club President</span></div>
          </div>
          <Terminal />
          <p className="hint dim">Tip: press <kbd>/</kbd> anywhere to jump to the terminal. Try <code>theme violet</code> or <code>neofetch</code>.</p>
        </section>
        <section className="sec about-section" id="about">
          <h2><span className="path">~/</span>about</h2>
          <div className="about-layout">
            <div className="about-intro">
              <p className="about-eyebrow">A LITTLE ABOUT ME</p>
              <h3>Building useful products with <span>code</span> and <span>AI.</span></h3>
              <p>I’m a Computer Science Engineering student at RKGIT, Ghaziabad, interested in full-stack development, AI-powered applications and cybersecurity.</p>
            </div>
            <div className="about-details">
              <p>I enjoy turning ideas into working products—from responsive web interfaces to AI assistants and tools that solve practical problems.</p>
              <p>During my VAPT internship at Tata Advanced Systems, I worked with document processing, OCR, RAG workflows, Docker and model evaluation. I also lead the Binary Club, where I help organize technical events and build a stronger student tech community.</p>
              <div className="about-tags"><span>Full-stack development</span><span>AI / GenAI</span><span>Cybersecurity</span><span>Community leadership</span></div>
            </div>
          </div>
        </section>
        <Experience />
        <Projects tech={tech} onTech={toggleTech} />
        <Skills tech={tech} onTech={toggleTech} />
        <Education />
        <Contact />
      </main>

      <footer>
        <span>© 2026 {profile.name}. Built with React, Express and SQLite.</span>
        <span>
          <a href={profile.github} target="_blank" rel="noreferrer">github</a>{' '}
          <a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin</a>{' '}
          <a href="/Harsh_Sinha_Resume.pdf" target="_blank" rel="noreferrer">resume</a>
        </span>
      </footer>
    </>
  );
}
