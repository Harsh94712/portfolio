# Harsh Sinha: terminal-style portfolio

React + Vite frontend, Node/Express backend, SQLite database.

## Features
- Interactive terminal in the hero: `help`, `projects`, `skills`, `experience`, `ask <question>`, `resume`, Tab completion, arrow-key history. Anything it doesn't recognise goes to the AI assistant.
- AI assistant (`POST /api/chat`): Gemini, answering only from `shared/profile.json`. Without an API key it falls back to built-in answers.
- Contact card styled after your video: rotating GitHub / LinkedIn / email / phone icon, scrolling "Let's Connect" strip, glowing "Let's Talk" button. Posts to `POST /api/contact`, which validates, rate-limits, saves to SQLite and emails you.
- Interactive extras: expandable experience timeline, click any skill or project tag to filter projects by technology, cursor spotlight on project cards, scroll-progress bar with active section highlight, terminal `theme <amber|mint|coral|violet>` and `neofetch`, and `/` to jump back to the terminal.
- Resume PDF served from `client/public/`.

## Run it
Needs Node 20+.

```bash
npm install
cp server/.env.example server/.env     # then edit it
npm run dev                            # site on http://localhost:5173, API on :5000
```

## Edit your content
All text lives in `shared/profile.json`. The website and the chatbot both read it.
Add project links by replacing `"repo": null` and `"live": null` with URLs. The buttons appear automatically.

## Settings in `server/.env`
| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Free key from aistudio.google.com/apikey. Turns on the real AI chatbot. |
| `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` | Gmail address plus an App Password (myaccount.google.com/apppasswords) to get an email per message. |
| `ADMIN_TOKEN` | Lets you read saved messages: `curl -H "Authorization: Bearer <token>" http://localhost:5000/api/messages` |

Messages are saved to the database even if email is not configured.

## Deploy (single service, e.g. Render)
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add the `.env` values as environment variables.
- Note: free hosts often wipe the disk on redeploy, which would erase the SQLite file. Attach a persistent disk and set `DB_PATH` to it, or rely on the email notifications.


## Contact form email setup (no message storage)

The contact endpoint sends submissions directly through Resend. It does not write messages to SQLite or any other database.

Configure these environment variables on the backend (or in `server/.env` for local development):

- `RESEND_API_KEY` — your private Resend API key
- `CONTACT_TO=harshsinha79030@gmail.com`
- `CONTACT_FROM=Harsh Sinha <contact@send.harshsinha.in>`

Keep the API key server-side and never commit `.env`. The sender domain must be verified in Resend. The contact endpoint returns success only after Resend accepts the email. Failed sends return an error and are not stored for later delivery.
