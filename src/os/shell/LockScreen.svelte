<script lang="ts" module>
  import { PERSONA } from '../../content/persona';
  /** Foto del avatar, ya optimizada al compilar. */
  export interface Avatar {
    src: string;
    width: number;
    height: number;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { formatLockDate, formatTime } from '../../lib/clock';
  import { UI_SVG } from '../icons';

  let { avatar, onunlock }: { avatar?: Avatar; onunlock: () => void } = $props();

  // Si la foto no carga (red, bloqueo), quedan las iniciales: el acceso nunca se queda sin avatar.
  let photoFailed = $state(false);
  let photo: HTMLImageElement | undefined = $state();

  // El manejador se engancha desde aquí y no con `onerror` en la etiqueta: Svelte lo escribiría como
  // atributo en línea en el HTML, y la CSP (M-11) bloquea los manejadores en línea. Además se revisa
  // si la imagen ya había fallado antes de que el código llegase a hidratar la página.
  $effect(() => {
    const img = photo;
    if (!img) return;
    const fail = () => (photoFailed = true);
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
    return () => img.removeEventListener('error', fail);
  });

  // La hora se pinta en el cliente: la página está pre-renderizada y una hora fija sería falsa.
  let now = $state<Date | null>(null);
  let entering = $state(false);
  let button: HTMLButtonElement | undefined = $state();

  onMount(() => {
    now = new Date();
    button?.focus({ preventScroll: true });
    const id = setInterval(() => (now = new Date()), 15_000);
    return () => clearInterval(id);
  });

  function enter() {
    if (entering) return;
    entering = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(onunlock, reduce ? 0 : 450);
  }

  // Enter entra desde cualquier sitio. El resto de teclas no hacen nada: la contraseña es decorativa.
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      enter();
    }
  }
</script>

<svelte:window {onkeydown} />

<section class="lock" class:entering data-testid="lock-screen" aria-label="Pantalla de acceso">
  <div class="clock" aria-hidden={now === null}>
    <div class="date">{now ? formatLockDate(now) : ''}</div>
    <div class="time" data-testid="lock-time">{now ? formatTime(now) : ''}</div>
  </div>

  <div class="user">
    <div class="avatar" data-testid="lock-avatar" aria-hidden="true">
      {#if avatar && !photoFailed}
        <!-- Decorativa: el nombre aparece justo debajo. -->
        <img
          bind:this={photo}
          src={avatar.src}
          width={avatar.width}
          height={avatar.height}
          alt=""
          decoding="async"
          fetchpriority="high"
          data-testid="lock-photo"
        />
      {:else}
        <span data-testid="lock-initials">{PERSONA.initials}</span>
      {/if}
    </div>
    <h1 class="name" data-testid="lock-name">{PERSONA.name}</h1>
    <button bind:this={button} class="password" data-testid="lock-enter" aria-label={`Entrar como ${PERSONA.name}`} onclick={enter}>
      <span class="dots" data-testid="lock-dots" aria-hidden="true">
        {#each Array(8) as _, i (i)}<i></i>{/each}
      </span>
      <span class="go" aria-hidden="true">{@html UI_SVG.enter}</span>
    </button>
    <p class="hint">Haz clic o pulsa Enter para entrar</p>
  </div>
</section>

<style>
  .lock {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: calc(env(safe-area-inset-top, 0px) + 7vh) 16px calc(env(safe-area-inset-bottom, 0px) + 6vh);
    color: var(--on-wall);
    text-shadow: 0 1px 14px rgba(0, 0, 0, 0.22);
  }
  .clock {
    display: grid;
    gap: 4px;
    text-align: center;
    min-height: 1px;
  }
  .date {
    font-size: clamp(16px, 1.8vw, 21px);
    font-weight: 600;
    opacity: 0.92;
    min-height: 1.3em;
  }
  .time {
    font-size: clamp(80px, 13vw, 148px);
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.035em;
    font-variant-numeric: tabular-nums;
    min-height: 0.95em;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.72));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  /* En el espacio libre bajo el reloj: centrado, y un poco más arriba que el centro exacto. */
  .user {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-block: auto;
    padding-bottom: 6vh;
  }
  .avatar {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: calc(32px * var(--text-scale));
    font-weight: 600;
    letter-spacing: 0.02em;
    text-shadow: none;
    background: rgba(255, 255, 255, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .name {
    margin: 0;
    font-size: calc(19px * var(--text-scale));
    font-weight: 600;
  }
  .password {
    width: 210px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 3px 0 14px;
    cursor: pointer;
    text-shadow: none;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.28);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    transition: background 0.2s;
  }
  .password:hover {
    background: rgba(255, 255, 255, 0.28);
  }
  .password:focus-visible {
    outline-color: #ffffff;
  }
  .dots {
    flex: 1;
    display: flex;
    gap: 5px;
  }
  .dots i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ffffff;
  }
  .go {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.25);
  }
  .go :global(svg) {
    width: 15px;
    height: 15px;
  }
  .entering .go :global(svg) {
    animation: spin 0.7s linear infinite;
  }
  .hint {
    margin: 0;
    font-size: calc(13px * var(--text-scale));
    opacity: 0.85;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
