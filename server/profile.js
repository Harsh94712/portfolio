import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const profile = JSON.parse(
  fs.readFileSync(path.join(here, '..', 'shared', 'profile.json'), 'utf8')
);

export const SYSTEM_PROMPT = `You are the assistant on ${profile.name}'s portfolio website. Visitors are usually recruiters or collaborators.
Answer ONLY from the facts below. If something isn't covered, say you don't have that detail and suggest emailing ${profile.email}.
Write in plain text (no markdown), in the third person about Harsh, in under 90 words.

FACTS:
${JSON.stringify(profile, null, 1)}`;

// Used when no Gemini key is set, or when the API call fails.
export function localAnswer(question) {
  const q = question.toLowerCase();
  const has = (...w) => w.some((x) => q.includes(x));
  const p = profile;
  if (has('tata', 'vapt', 'iso', 'ocr', 'docker', 'langgraph'))
    return `At Tata Advanced Systems (${p.experience[0].period}) Harsh worked on an internal ISO compliance tool: he integrated OpenOCR into the document pipeline, Dockerized the app for local-network access, explored a LangChain-to-LangGraph migration and ran SOUP testing on a Chinese AI model.`;
  if (has('skill', 'tech', 'stack', 'language', 'know'))
    return `Languages: ${p.skills.Languages.join(', ')}. Frameworks: ${p.skills.Frameworks.join(', ')}. AI and APIs: ${p.skills['AI and APIs'].join(', ')}.`;
  if (has('project', 'built', 'build', 'mindbridge', 'agronova', 'resume gen'))
    return p.projects.map((x) => `${x.name}: ${x.summary}`).join(' ');
  if (has('intern', 'experience', 'work', 'job', 'club', 'president'))
    return p.experience.map((e) => `${e.role}, ${e.org} (${e.period})`).join('. ') + '.';
  if (has('educat', 'college', 'study', 'degree', 'sgpa', 'cgpa', 'school'))
    return `${p.education[0].degree} at ${p.education[0].school} (${p.education[0].period}). ${p.education[0].note}.`;
  if (has('cert', 'course'))
    return p.certifications.join('; ') + '.';
  if (has('contact', 'email', 'reach', 'hire', 'phone', 'linkedin', 'github'))
    return `Email ${p.email}, call ${p.phone}, or use the message form on this page. GitHub: ${p.github}`;
  if (has('who', 'about', 'yourself', 'harsh'))
    return `${p.tagline} ${p.summary[1]}`;
  return `I can answer questions about Harsh's projects, internships, skills, education and certifications. For anything else, email ${p.email}.`;
}
