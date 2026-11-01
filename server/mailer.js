const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;

export const mailEnabled = Boolean(
  RESEND_API_KEY &&
  CONTACT_TO &&
  CONTACT_FROM &&
  !RESEND_API_KEY.startsWith('your-')
);

export async function notify({ name, email, message }) {
  if (!mailEnabled) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `You received a new message through your portfolio.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${detail}`);
  }
  return true;
}
