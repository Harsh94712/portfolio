import { useEffect, useRef, useState } from 'react';
import profile from '../../../shared/profile.json';
import { askAI } from '../api.js';
import { THEMES, applyTheme } from '../theme.js';

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COMMANDS = ['help', 'whoami', 'about', 'skills', 'projects', 'experience', 'education', 'certs',
  'contact', 'resume', 'github', 'linkedin', 'ask', 'neofetch', 'theme', 'clear'];

const HELP = [
  ['about', 'who I am'],
  ['skills', 'languages, frameworks and tools'],
  ['projects', 'what I have built'],
  ['experience', 'internships and roles'],
  ['education', 'degree and schools'],
  ['certs', 'certifications'],
  ['contact', 'email, phone and message form'],
  ['resume', 'open the PDF resume'],
  ['github, linkedin', 'open my profiles'],
  ['ask <question>', 'ask the AI assistant about me'],
  ['neofetch', 'system info, the nerdy way'],
  ['theme <name>', Object.keys(THEMES).join(', ')],
  ['clear', 'clear the screen'],
  ['/', 'jump to this terminal from anywhere'],
];

const Row = ({ k, children }) => (
  <div className="row"><span className="k">{k}</span><span>{children}</span></div>
);

const outputs = {
  whoami: () => (
    <div><strong className="hl">{profile.name}</strong><br />{profile.role}. {profile.tagline}</div>
  ),
  help: () => (
    <div>
      {HELP.map(([c, d]) => <Row key={c} k={c}>{d}</Row>)}
      <p className="dim">Anything else you type is sent to the AI assistant.</p>
    </div>
  ),
  about: () => <div>{profile.summary.map((p) => <p key={p}>{p}</p>)}</div>,
  skills: () => (
    <div>{Object.entries(profile.skills).map(([k, v]) => <Row key={k} k={k}>{v.join(', ')}</Row>)}</div>
  ),
  projects: () => (
    <div>
      {profile.projects.map((p, i) => (
        <div className="blk" key={p.name}>
          <span className="hl">{i + 1}. {p.name}</span> <span className="dim">{p.period}</span>
          <div>{p.summary}</div>
          <div className="dim">{p.stack.join(', ')}</div>
        </div>
      ))}
      <a href="#projects">Jump to project details</a>
    </div>
  ),
  experience: () => (
    <div>
      {profile.experience.map((e) => (
        <div className="blk" key={e.role + e.period}>
          <span className="hl">{e.role}</span>, {e.org}
          <div className="dim">{e.period}</div>
        </div>
      ))}
      <a href="#experience">Jump to experience details</a>
    </div>
  ),
  education: () => (
    <div>
      {profile.education.map((e) => (
        <div className="blk" key={e.school}>
          <span className="hl">{e.degree}</span>
          <div>{e.school}</div>
          <div className="dim">{e.period}{e.note ? `. ${e.note}` : ''}</div>
        </div>
      ))}
    </div>
  ),
  neofetch: () => (
    <div>
      <Row k={`${profile.handle}@portfolio`}>{'-'.repeat(16)}</Row>
      <Row k="role">{profile.role}</Row>
      <Row k="host">Raj Kumar Goel Institute of Technology, Ghaziabad</Row>
      <Row k="uptime">coding since Aug 2023</Row>
      <Row k="shell">React + Express + SQLite</Row>
      <Row k="languages">{profile.skills.Languages.join(', ')}</Row>
      <Row k="editor">VS Code, Cursor, Claude Code</Row>
      <Row k="status">open to internships and collaborations</Row>
    </div>
  ),
  certs: () => <ul className="plain">{profile.certifications.map((c) => <li key={c}>{c}</li>)}</ul>,
  contact: () => (
    <div>
      <Row k="email"><a href={`mailto:${profile.email}`}>{profile.email}</a></Row>
      <Row k="phone">{profile.phone}</Row>
      <Row k="location">{profile.location}</Row>
      <a href="#contact">Open the message form</a>
    </div>
  ),
};

export default function Terminal() {
  const [lines, setLines] = useState([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(true);
  const [history, setHistory] = useState([]);
  const histIdx = useRef(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const chat = useRef([]);
  const nextId = useRef(0);
  const booted = useRef(false);

  const push = (kind, node) => {
    const id = nextId.current++;
    setLines((l) => [...l, { id, kind, node }]);
    return id;
  };
  const replace = (id, node) => setLines((l) => l.map((x) => (x.id === id ? { ...x, node } : x)));

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  async function ask(question) {
    const id = push('out', <span className="dim">thinking…</span>);
    setBusy(true);
    try {
      const { reply } = await askAI(question, chat.current);
      chat.current = [...chat.current, { role: 'user', text: question }, { role: 'model', text: reply }].slice(-8);
      replace(id, <div className="ai">{reply}</div>);
    } catch (err) {
      replace(id, <span className="err">{err.message}. Try again, or use the contact form.</span>);
    } finally {
      setBusy(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  async function run(raw) {
    const text = raw.trim();
    push('cmd', text);
    if (!text) return;
    setHistory((h) => [text, ...h]);
    histIdx.current = -1;

    const [first, ...rest] = text.split(/\s+/);
    const cmd = first.toLowerCase();
    const arg = rest.join(' ');

    if (outputs[cmd]) return push('out', outputs[cmd]());
    switch (cmd) {
      case 'clear': return setLines([]);
      case 'resume':
        window.open('/Harsh_Sinha_Resume.pdf', '_blank', 'noopener');
        return push('out', <span>Opening Harsh_Sinha_Resume.pdf in a new tab.</span>);
      case 'github':
      case 'linkedin':
        window.open(profile[cmd], '_blank', 'noopener');
        return push('out', <span>Opening {cmd} in a new tab.</span>);
      case 'ask':
        if (!arg) return push('out', <span>Usage: ask &lt;question&gt;. Example: ask what did you build at Tata?</span>);
        return ask(arg);
      case 'theme': {
        const name = arg.toLowerCase();
        if (!name) return push('out', <span>Usage: theme &lt;name&gt;. Options: {Object.keys(THEMES).join(', ')}.</span>);
        return push('out', applyTheme(name)
          ? <span>Accent changed to <span className="hl">{name}</span>.</span>
          : <span className="err">Unknown theme "{arg}". Options: {Object.keys(THEMES).join(', ')}.</span>);
      }
      case 'sudo':
        return push('out', <span>{/hire/i.test(arg)
          ? <>Permission granted. <a href="#contact">Say hello</a>.</>
          : 'harsh is not in the sudoers file. This incident will be reported.'}</span>);
      default:
        push('out', <span className="dim">{cmd}: command not found. Asking the assistant instead.</span>);
        return ask(text);
    }
  }

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const typeCmd = async (cmd) => {
        if (!reduceMotion) {
          for (let i = 1; i <= cmd.length; i++) { setValue(cmd.slice(0, i)); await sleep(65); }
          await sleep(300);
          setValue('');
        }
        await run(cmd);
        if (!reduceMotion) await sleep(450);
      };
      push('out', <span className="dim">Last login: {new Date().toDateString()}</span>);
      await typeCmd('whoami');
      await typeCmd('help');
      setBusy(false);
    })();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('top')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      const v = value;
      setValue('');
      run(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(histIdx.current + 1, history.length - 1);
      if (i >= 0) { histIdx.current = i; setValue(history[i]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = histIdx.current - 1;
      histIdx.current = Math.max(i, -1);
      setValue(i >= 0 ? history[i] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const m = COMMANDS.filter((c) => c.startsWith(value.toLowerCase()));
      if (value && !value.includes(' ') && m.length === 1) setValue(m[0] + (m[0] === 'ask' ? ' ' : ''));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  const chips = ['projects', 'skills', 'experience', 'ask what did you do at Tata?'];

  return (
    <div className="term" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div className="term-title">{profile.handle}@portfolio: ~</div>
      <div className="term-body" ref={bodyRef} role="log" aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className={`line ${l.kind}`}>
            {l.kind === 'cmd' ? <><span className="prompt">$</span> {l.node}</> : l.node}
          </div>
        ))}
        <div className="line cmd input-line">
          <span className="prompt">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={busy}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal command. Type help to list commands."
            placeholder={busy ? '' : 'type a command, or a question'}
          />
        </div>
      </div>
      <div className="chips">
        {chips.map((c) => (
          <button key={c} type="button" disabled={busy} onClick={(e) => { e.stopPropagation(); run(c); }}>{c}</button>
        ))}
      </div>
    </div>
  );
}
