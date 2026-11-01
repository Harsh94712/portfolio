import { useEffect, useState } from 'react';
import profile from '../../../shared/profile.json';
import { sendMessage } from '../api.js';

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Section({ id, title, children }) {
  return (
    <section className="sec" id={id}>
      <h2><span className="path">~/</span>{title}</h2>
      {children}
    </section>
  );
}

const uses = (project, tech) => {
  const t = tech.toLowerCase();
  return project.stack.some((s) => { const x = s.toLowerCase(); return x.includes(t) || t.includes(x); });
};

/* ---------- experience: click a role to expand or collapse ---------- */
export function Experience() {
  const all = profile.experience.map((e) => e.role + e.period);
  const [open, setOpen] = useState(new Set([all[0]]));
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const allOpen = open.size === all.length;

  return (
    <Section id="experience" title="experience">
      <button type="button" className="textbtn" onClick={() => setOpen(allOpen ? new Set() : new Set(all))}>
        {allOpen ? 'Collapse all' : 'Expand all'}
      </button>
      <ol className="log">
        {profile.experience.map((e) => {
          const k = e.role + e.period;
          const isOpen = open.has(k);
          return (
            <li key={k} className={isOpen ? 'open' : ''}>
              <button type="button" className="log-head" aria-expanded={isOpen} aria-controls={`x-${k.replace(/\W/g, '')}`} onClick={() => toggle(k)}>
                <span className="caret" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                <h3>{e.role}</h3>
                <span className="org">{e.org}</span>
                <time>{e.period}</time>
              </button>
              {isOpen && (
                <div id={`x-${k.replace(/\W/g, '')}`} className="log-body">
                  {e.project && <p className="dim">Project: {e.project}</p>}
                  <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/* ---------- projects: featured work + compact project grid ---------- */
function ProjectCard({ p, dim, tech, onTech, featured = false }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <article className={`proj project-card${featured ? ' proj-featured' : ''}${dim ? ' dimmed' : ''}`} onMouseMove={move}>
      {p.image && (
        <div className={`project-media${p.secondaryImage ? ' project-media-dual' : ''}`}>
          <a className="project-image" href={p.live || p.repo} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}>
            <img src={p.image} alt={`${p.name} project preview`} loading="lazy" />
          </a>
          {p.secondaryImage && (
            <a className="project-image" href={p.live || p.repo} target="_blank" rel="noreferrer" aria-label={`View another ${p.name} screenshot`}>
              <img src={p.secondaryImage} alt={`${p.name} landing page preview`} loading="lazy" />
            </a>
          )}
        </div>
      )}
      <div className="project-content">
        <div className="log-head static project-title-row">
          <h3>{p.name}</h3>
          {p.period && <time>{p.period}</time>}
        </div>
        <p className="muted">{p.summary}</p>
        <p className="stack">
          {p.stack.map((s) => (
            <button key={s} type="button" className={`tag${tech && uses({ stack: [s] }, tech) ? ' on' : ''}`} onClick={() => onTech(s)} aria-pressed={tech === s}>{s}</button>
          ))}
        </p>
        <ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        {(p.live || p.repo) && (
          <p className="links">
            {p.live && <a href={p.live} target="_blank" rel="noreferrer">Live demo ↗</a>}
            {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">GitHub ↗</a>}
          </p>
        )}
      </div>
    </article>
  );
}

export function Projects({ tech, onTech }) {
  const projects = profile.projects;
  const matches = tech ? projects.filter((p) => uses(p, tech)).length : projects.length;
  const visibleProjects = tech ? projects.filter((p) => uses(p, tech)) : projects;
  return (
    <Section id="projects" title="projects">
      <p className="filter" role="status" aria-live="polite">
        {tech ? (
          <>
            <span className="hl">{tech}</span>{' '}
            {matches ? `is used in ${matches} of ${projects.length} projects.` : 'is not used in any project yet.'}{' '}
            <button type="button" className="textbtn" onClick={() => onTech(tech)}>Clear filter</button>
          </>
        ) : (
          <span className="dim">A selection of things I've built. Explore the live demos or source code.</span>
        )}
      </p>
      <div className="projects project-grid">
        {visibleProjects.map((p) => <ProjectCard key={p.name} p={p} tech={tech} onTech={onTech} />)}
      </div>
    </Section>
  );
}

export function Skills({ tech, onTech }) {
  return (
    <Section id="skills" title="skills">
      <dl className="skills">
        {Object.entries(profile.skills).map(([group, items]) => (
          <div key={group}>
            <dt>{group}</dt>
            <dd>
              {items.map((i) => (
                <button key={i} type="button" className={`chip${tech === i ? ' on' : ''}`} aria-pressed={tech === i} onClick={() => onTech(i)}>{i}</button>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="skill-note" role="status" aria-live="polite">
        {tech
          ? <>Filtering projects by <span className="hl">{tech}</span>. <a href="#projects">See the projects</a></>
          : <span className="dim">Click a skill to filter my projects by it.</span>}
      </p>
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education" title="education">
      <div className="two">
        <div>
          {profile.education.map((e) => (
            <div key={e.school} className="edu">
              <div className="log-head static"><h3>{e.school}</h3><time>{e.period}</time></div>
              <p>{e.degree}</p>
              {e.note && <p className="dim">{e.note}</p>}
            </div>
          ))}
        </div>
        <div>
          <h3 className="sub">Certifications</h3>
          <ul className="plain">{profile.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}

/* ---------- contact ---------- */
const Icon = {
  github: (
    <svg viewBox="0 0 16 16" width="30" height="30" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <text x="12" y="18" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="17" fill="currentColor">in</text>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

const SOCIALS = [
  { id: 'github', label: 'GitHub', href: profile.github, bg: '#ffffff', fg: '#111827', ext: true },
  { id: 'linkedin', label: 'LinkedIn', href: profile.linkedin, bg: '#2563eb', fg: '#ffffff', ext: true },
  { id: 'mail', label: 'Email', href: `mailto:${profile.email}`, bg: '#f59e0b', fg: '#1f2937' },
  { id: 'phone', label: 'Phone', href: `tel:+91${profile.phone}`, bg: '#22c55e', fg: '#06240f' },
];

function SocialRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduceMotion || paused) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % SOCIALS.length), 1800);
    return () => clearInterval(t);
  }, [paused]);
  const s = SOCIALS[i];
  return (
    <a
      key={s.id}
      className="soc"
      href={s.href}
      {...(s.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
      aria-label={`Open ${s.label}`}
      title={s.label}
      style={{ background: s.bg, color: s.fg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {Icon[s.id]}
    </a>
  );
}

const MARQUEE = Array.from({ length: 6 }, (_, i) => i);
const EMPTY = { firstName: '', lastName: '', email: '', message: '', website: '' };
const MAX = 2000;

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', text: '' });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (state.status !== 'sending') setState({ status: 'idle', text: '' });
  };

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending', text: '' });
    try {
      const r = await sendMessage(form);
      setForm(EMPTY);
      setState({
        status: 'ok',
        text: r.emailed
          ? 'Thanks! Your message has been emailed successfully. I will reply soon.'
          : 'Thanks! Your message was received. I will reply soon.',
      });
    } catch (err) {
      setState({ status: 'error', text: err.message });
    }
  }

  const label = { idle: "Let's Talk", sending: 'Sending…', ok: 'Sent', error: "Let's Talk" }[state.status];

  return (
    <Section id="contact" title="contact">
      <div className="cc">
        <div className="marquee" aria-hidden="true">
          <div className="track">
            {[0, 1].map((g) => (
              <div className="group" key={g}>
                {MARQUEE.map((n) => <span key={n}>Let's Connect ✶</span>)}
              </div>
            ))}
          </div>
        </div>

        <div className="cc-main">
          <div className="cc-head">
            <SocialRotator />
            <h3>Contact Me</h3>
          </div>
          <p className="cc-copy">
            Great work starts with great conversations. Whether you want to brainstorm ideas, collaborate on something
            exciting, or just say hi, I'm always open to meaningful chats. Let's connect and build something worth talking about.
          </p>

          <form className="cc-form" onSubmit={submit}>
            <div className="cc-grid">
              <label>
                <span>First name <b aria-hidden="true">*</b></span>
                <input value={form.firstName} onChange={set('firstName')} placeholder="Your First Name" autoComplete="given-name" required maxLength={40} />
              </label>
              <label>
                <span>Last name</span>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Your Last Name" autoComplete="family-name" maxLength={40} />
              </label>
            </div>
            <label>
              <span>Email <b aria-hidden="true">*</b></span>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" autoComplete="email" required maxLength={120} />
            </label>
            <label>
              <span>Message <b aria-hidden="true">*</b></span>
              <textarea rows={5} value={form.message} onChange={set('message')} placeholder="Write your message..." required minLength={10} maxLength={MAX} />
              <small className={form.message.length > MAX - 100 ? 'warn' : ''}>{form.message.length}/{MAX}</small>
            </label>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />

            <button type="submit" className={`talk ${state.status}`} disabled={state.status === 'sending'}>
              {label} <span className="wave" aria-hidden="true">{state.status === 'ok' ? '✓' : '👋'}</span>
            </button>
            <p className={`cc-status ${state.status}`} role="status" aria-live="polite">{state.text}</p>
          </form>
        </div>
      </div>
    </Section>
  );
}
