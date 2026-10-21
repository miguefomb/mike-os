/**
 * POST /api/guestbook/confirm — paso 2 del Libro de visitas (S-09): abre el enlace de confirmación y manda la reseña a Pol.
 * La lógica está en src/lib/guestbook-service.ts. No lleva Turnstile: el token cifrado ya prueba que se pasó por el primer paso.
 */
import type { APIRoute } from 'astro';
import { serverServices } from '../../../server/services';
import { handleConfirm } from '../../../lib/guestbook-service';
import { jsonResponse } from '../../../lib/json-response';

export const prerender = false;

export const ALL: APIRoute = async ({ request, clientAddress }) => {
  const services = serverServices();
  if (request.method === 'POST' && !services.guestbookReady) return jsonResponse({ status: 503, body: { ok: false, code: 'not_configured' } });
  const length = request.headers.get('content-length');
  const result = await handleConfirm(
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
      sendEmail: services.sendEmail,
      config: services.config,
      now: () => Date.now(),
      log: ({ code, status }) => {
        if (status >= 500) console.error(`[guestbook] ${code} ${status}`);
      },
    },
  );
  return jsonResponse(result);
};
