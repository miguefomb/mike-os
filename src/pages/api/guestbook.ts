/**
 * POST /api/guestbook — paso 1 del Libro de visitas (S-09): valida la reseña y manda el enlace de confirmación al visitante.
 * Aquí solo se conectan los bindings reales; la lógica está en src/lib/guestbook-service.ts.
 */
import type { APIRoute } from 'astro';
import { serverServices } from '../../server/services';
import { handleSubmit } from '../../lib/guestbook-service';
import { jsonResponse } from '../../lib/json-response';
import { verifyTurnstile } from '../../lib/turnstile';

// El resto de páginas se pre-renderiza; esta se ejecuta bajo demanda.
export const prerender = false;

export const ALL: APIRoute = async ({ request, clientAddress }) => {
  const services = serverServices();
  if (request.method === 'POST' && !services.guestbookReady) return jsonResponse({ status: 503, body: { ok: false, code: 'not_configured' } });
  const length = request.headers.get('content-length');
  const result = await handleSubmit(
    {
      method: request.method,
      contentType: request.headers.get('content-type'),
      contentLength: length !== null && /^\d+$/.test(length) ? Number(length) : null,
      ip: clientAddress,
      readBody: () => request.text(),
    },
    {
      ipLimiter: services.guestbookLimiter,
      keyLimiter: services.keyLimiter,
      verifyTurnstile: (token, ip) => verifyTurnstile(token, services.turnstileSecret, ip),
      sendEmail: services.sendEmail,
      config: services.config,
      now: () => Date.now(),
      // Solo códigos y estados: ni el texto ni el correo se registran nunca.
      log: ({ code, status }) => {
        if (status >= 500) console.error(`[guestbook] ${code} ${status}`);
      },
    },
  );
  return jsonResponse(result);
};
