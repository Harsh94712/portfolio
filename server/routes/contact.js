import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { notify, mailEnabled } from '../mailer.js';

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v) => String(v ?? '').trim();

router.post('/contact', async (req, res) => {
  const { firstName, lastName, email, message, website } = req.body ?? {};
  // Honeypot: silently accept bot submissions without sending email.
  if (website) return res.json({ ok: true });

  const f = clean(firstName), l = clean(lastName), e = clean(email), m = clean(message);
  if (f.length < 1 || f.length > 40) return res.status(400).json({ error: 'Enter your first name.' });
  if (l.length > 40) return res.status(400).json({ error: 'Last name is too long (40 characters max).' });
  if (!EMAIL.test(e) || e.length > 120) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (m.length < 10 || m.length > 2000) return res.status(400).json({ error: 'Write a message of 10–2000 characters.' });
  if (!mailEnabled) return res.status(503).json({ error: 'Email service is not configured yet. Please try again later.' });

  const name = `${f} ${l}`.trim();
  try {
    await notify({ name, email: e, message: m });
    return res.status(200).json({ ok: true, emailed: true });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return res.status(502).json({ error: 'Your message could not be sent. Please try again or email me directly.' });
  }
});

export default router;
