<script lang="ts">
  import { untrack } from 'svelte';
  import { SECTIONS, type FavoritesSection, type SectionId } from '../../../lib/favorites';
  import { UI_SVG } from '../../icons';
  import { player } from '../../stores/player.svelte';
  import CoverGrid from './CoverGrid.svelte';
  import MusicList from './MusicList.svelte';

  interface Props {
    /** La sección con la que se abre la ventana; null es la vista de las cuatro tarjetas. */
    initial?: string | null;
    /** Cambia cada vez que se pide abrir la app: se vuelve a navegar a `initial`. */
    nav?: number;
  }
  let { initial = null, nav = 0 }: Props = $props();

  const known = (id: string | null): SectionId | null => SECTIONS.find((s) => s.id === id)?.id ?? null;

  let sections = $state<FavoritesSection[] | null>(null);
  let failed = $state(false);
  let selected = $state<SectionId | null>(untrack(() => known(initial)));
  let lastNav = untrack(() => nav);

  // Con la ventana ya abierta, otro doble clic en el icono navega dentro de ella.
  $effect(() => {
    const n = nav;
    const target = initial;
    if (n === lastNav) return;
    lastNav = n;
    untrack(() => (selected = known(target)));
  });

  // El contenido se pide al abrir la app (un archivo estático del propio sitio): la home no lo lleva.
  $effect(() => {
    let cancelled = false;
    fetch('/favoritos.json')
      .then((res) => (res.ok ? (res.json() as Promise<FavoritesSection[]>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) sections = data;
      })
      .catch(() => {
        if (!cancelled) failed = true;
      });
    return () => {
      cancelled = true;
    };
  });

  const section = $derived(sections?.find((s) => s.kind === selected) ?? null);
</script>

<div class="root" data-testid="favorites">
  {#if failed}
    <p class="status" role="alert" data-testid="favorites-error">No se ha podido cargar el contenido. Revisa tu conexión y vuelve a abrir Favoritos.</p>
  {:else if !sections}
    <p class="status" role="status" data-testid="favorites-loading">Cargando…</p>
  {:else if section}
    <header class="bar">
      <button class="back" data-testid="favorites-back" onclick={() => (selected = null)}>
        <span aria-hidden="true">{@html UI_SVG.back}</span> Favoritos
      </button>
    </header>
    <!-- La región se puede enfocar con el teclado para desplazarla con las flechas, aunque no tenga controles dentro. -->
    <div class="scroll" class:with-player={player.current !== null} role="region" aria-label={section.title} tabindex="0">
      <h2 data-testid="favorites-title">{section.title}</h2>
      {#if section.items.length === 0}
        <p class="status" data-testid="favorites-empty">Todavía no hay favoritos en esta sección.</p>
      {:else if section.kind === 'music'}
        <MusicList {section} />
      {:else}
        <CoverGrid {section} />
      {/if}
    </div>
  {:else}
    <div class="scroll" role="region" aria-label="Favoritos" tabindex="0">
      <h2>Favoritos</h2>
      <ul class="cards">
        {#each SECTIONS as s (s.id)}
          {@const data = sections.find((x) => x.kind === s.id)}
          <li>
            <button class="card" data-testid={`favorites-card-${s.id}`} onclick={() => (selected = s.id)}>
              <span class="covers" aria-hidden="true">
                {#each (data?.items ?? []).slice(0, 3) as item (item.id)}
                  <img src={item.cover} alt="" loading="lazy" style:aspect-ratio={s.aspect} />
                {/each}
              </span>
              <span class="name">{s.label}</span>
              <span class="sub">{data?.items.length ? `${data.items.length} favoritos · A–Z` : 'Sin favoritos todavía'}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .root {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--win-bg);
    color: var(--fg);
  }
  .status {
    margin: 40px 16px;
    text-align: center;
    color: var(--muted);
  }
  .bar {
    flex: none;
    padding: 8px 12px;
    background: var(--chrome);
    border-bottom: 1px solid var(--line);
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--accent-text);
    cursor: pointer;
  }
  .back :global(svg) {
    width: 14px;
    height: 14px;
  }
  .scroll:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 18px 22px 28px;
  }
  /* En el móvil el reproductor ocupa el ancho y tapa el final de la pantalla: se deja sitio para poder desplazar las últimas filas por encima de él. */
  @media (max-width: 767px) {
    .scroll.with-player {
      padding-bottom: 460px;
    }
  }
  h2 {
    margin: 0 0 14px;
    font-size: calc(22px * var(--text-scale));
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .card {
    display: grid;
    gap: 3px;
    width: 100%;
    padding: 14px;
    text-align: left;
    border-radius: 12px;
    cursor: pointer;
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
  }
  .card:hover {
    background: var(--hover);
  }
  .card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .covers {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
    height: 84px;
    overflow: hidden;
  }
  .covers img {
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 0 0 1px var(--line);
  }
  .name {
    font-weight: 600;
    font-size: calc(15px * var(--text-scale));
  }
  .sub {
    font-size: calc(13px * var(--text-scale));
    color: var(--muted);
  }
</style>
