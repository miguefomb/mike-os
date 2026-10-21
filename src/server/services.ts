import { getSecret } from 'astro:env/server';
import { PERSONA } from '../content/persona';
import { createServerServices } from '../lib/server-services';

export const serverServices = () => createServerServices({
  RESEND_API_KEY: getSecret('RESEND_API_KEY'),
  CONTACT_FROM: getSecret('CONTACT_FROM'),
  CONTACT_TO: getSecret('CONTACT_TO'),
  TURNSTILE_SECRET_KEY: getSecret('TURNSTILE_SECRET_KEY'),
  GUESTBOOK_SECRET: getSecret('GUESTBOOK_SECRET'),
  SITE_URL: getSecret('SITE_URL') ?? PERSONA.siteUrl,
  UPSTASH_REDIS_REST_URL: getSecret('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: getSecret('UPSTASH_REDIS_REST_TOKEN'),
});
