/** Servicios de los formularios para Node/Vercel. Sin credenciales completas, el envío queda desactivado. */
import { fingerprint } from './guestbook-token';

export interface ServerEnvironment {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  TURNSTILE_SECRET_KEY?: string;
  GUESTBOOK_SECRET?: string;
  SITE_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

interface Email {
  from: { email: string; name: string };
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}

// INCR y EXPIRE son atómicos; el contador es compartido entre instancias y desaparece al minuto.
const COUNT = "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end; return n";

export function createServerServices(env: ServerEnvironment, fetcher: typeof fetch = fetch) {
  const limiter = (scope: string, maximum: number) => ({
    async limit({ key }: { key: string }): Promise<{ success: boolean }> {
      if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return { success: false };
      try {
        const response = await fetcher(env.UPSTASH_REDIS_REST_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(['EVAL', COUNT, '1', `mike-os:${scope}:${await fingerprint(key)}`]),
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return { success: false };
        const data: { result?: unknown; error?: unknown } = await response.json();
        return { success: !data.error && typeof data.result === 'number' && data.result > 0 && data.result <= maximum };
      } catch {
        // Un fallo del límite nunca habilita envíos sin protección.
        return { success: false };
      }
    },
  });
  const ready = !!(env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO && env.TURNSTILE_SECRET_KEY && env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  return {
    ready,
    guestbookReady: ready && (env.GUESTBOOK_SECRET?.length ?? 0) >= 32 && !!env.SITE_URL,
    contactLimiter: limiter('contact', 3),
    guestbookLimiter: limiter('guestbook', 5),
    keyLimiter: limiter('guestbook-key', 1),
    config: { to: env.CONTACT_TO, from: env.CONTACT_FROM, siteUrl: env.SITE_URL, secret: env.GUESTBOOK_SECRET },
    turnstileSecret: env.TURNSTILE_SECRET_KEY ?? '',
    async sendEmail(message: Email): Promise<void> {
      if (!env.RESEND_API_KEY) throw new Error('Correo sin configurar');
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${message.from.name} <${message.from.email}>`,
          to: [message.to],
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(10000),
      });
      // No registrar la respuesta del proveedor: puede contener datos del mensaje.
      if (!response.ok) throw new Error('No se pudo enviar el correo');
    },
  };
}
