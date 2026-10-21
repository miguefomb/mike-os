/**
 * POST /api/contact — formulario de Correo (M-08). Único código de servidor de Pol OS.
 * Aquí solo se conectan los bindings reales; la lógica está en src/lib/contact-service.ts.
 */
import type { APIRoute } from 'astro';
import { serverServices } from '../../server/services';
import { jsonResponse } from '../../lib/json-response';
import { handleContact } from '../../lib/contact-service';
import { verifyTurnstile } from '../../lib/turnstile';

// El resto de páginas se pre-renderiza; esta se ejecuta bajo demanda.
export const prerender = false;

// `_headers` no se aplica a las respuestas del Worker, así que las cabeceras de seguridad (M-11) van
// aquí. Es una respuesta JSON: no necesita cargar nada, y nadie debería poder incrustarla.
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

export const ALL: APIRoute = async ({ request, clientAddress }) => {
  const services = serverServices();
  if (request.method === 'POST' && !services.ready) return jsonResponse({ status: 503, body: { ok: false, code: 'not_configured' } });
  const length = request.headers.get('content-length');
  const result = await handleContact(
    {
      method: request.method,
      contentType: request.headers.get('content-type'),
      contentLength: length !== null && /^\d+$/.test(length) ? Number(length) : null,
      ip: clientAddress,
      readBody: () => request.text(),
    },
    {
      limiter: services.contactLimiter,
      verifyTurnstile: (token, ip) => verifyTurnstile(token, services.turnstileSecret, ip),
      sendEmail: services.sendEmail,
      config: services.config,
      // Solo códigos y estados: el contenido del mensaje no se registra nunca.
      log: ({ code, status }) => {
        if (status >= 500) console.error(`[contact] ${code} ${status}`);
      },
    },
  );

  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (result.status === 405) headers.Allow = 'POST';
  return new Response(JSON.stringify(result.body), { status: result.status, headers });
};
