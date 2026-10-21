import { describe, expect, test, vi } from 'vitest';
import { createServerServices, type ServerEnvironment } from './server-services';

const env: ServerEnvironment = {
  RESEND_API_KEY: 'test-only', CONTACT_FROM: 'sender@example.test', CONTACT_TO: 'owner@example.test',
  TURNSTILE_SECRET_KEY: 'test-only', GUESTBOOK_SECRET: 'x'.repeat(32), SITE_URL: 'https://example.test',
  UPSTASH_REDIS_REST_URL: 'https://redis.example.test', UPSTASH_REDIS_REST_TOKEN: 'test-only',
};

describe('servicios de formularios en Vercel', () => {
  test('sin configuración no habilita envíos ni permite saltarse el límite', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const services = createServerServices({}, fetcher);
    expect(services.ready).toBe(false);
    expect(services.guestbookReady).toBe(false);
    expect(await services.contactLimiter.limit({ key: '127.0.0.1' })).toEqual({ success: false });
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('las reseñas necesitan una clave de cifrado larga además del correo configurado', () => {
    expect(createServerServices(env).guestbookReady).toBe(true);
    expect(createServerServices({ ...env, GUESTBOOK_SECRET: 'corta' }).guestbookReady).toBe(false);
    expect(createServerServices({ ...env, RESEND_API_KEY: undefined }).ready).toBe(false);
  });

  test('los contadores son atómicos y no transmiten la IP o el correo en texto claro', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ result: 3 }));
    const services = createServerServices(env, fetcher);
    expect(await services.contactLimiter.limit({ key: '127.0.0.1' })).toEqual({ success: true });
    const options = fetcher.mock.calls[0][1]!;
    const command = JSON.parse(String(options.body)) as string[];
    expect(command[0]).toBe('EVAL');
    expect(command[1]).toContain("redis.call('EXPIRE'");
    expect(command[3]).toMatch(/^mike-os:contact:[a-f0-9]{32}$/);
    expect(String(options.body)).not.toContain('127.0.0.1');
    fetcher.mockResolvedValue(Response.json({ result: 4 }));
    expect(await services.contactLimiter.limit({ key: '127.0.0.1' })).toEqual({ success: false });
    fetcher.mockResolvedValue(Response.json({ result: 2 }));
    expect(await services.keyLimiter.limit({ key: 'email:hash' })).toEqual({ success: false });
  });

  test('un error del proveedor del límite cierra el paso', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('sin conexión'));
    expect(await createServerServices(env, fetcher).guestbookLimiter.limit({ key: 'ip' })).toEqual({ success: false });
    fetcher.mockResolvedValue(Response.json({ error: 'fallo' }, { status: 500 }));
    expect(await createServerServices(env, fetcher).contactLimiter.limit({ key: 'ip' })).toEqual({ success: false });
  });

  test('el correo conserva remitente, destino y respuesta, sin enviar por Cloudflare', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: 'local-test' }));
    await createServerServices(env, fetcher).sendEmail({ from: { name: 'Mike OS', email: 'sender@example.test' }, to: 'owner@example.test', replyTo: 'visitor@example.test', subject: 'Consulta', text: 'Texto de prueba' });
    expect(fetcher.mock.calls[0][0]).toBe('https://api.resend.com/emails');
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({ from: 'Mike OS <sender@example.test>', to: ['owner@example.test'], reply_to: 'visitor@example.test', subject: 'Consulta', text: 'Texto de prueba' });
  });

  test('los fallos de envío no exponen la respuesta privada del proveedor', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('contenido privado', { status: 502 }));
    const message = { from: { name: 'Mike OS', email: 'sender@example.test' }, to: 'owner@example.test', subject: 'Prueba', text: 'Texto' };
    await expect(createServerServices(env, fetcher).sendEmail(message)).rejects.toThrow('No se pudo enviar el correo');
  });
});
