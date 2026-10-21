<script lang="ts">
  import { UI_SVG } from '../../icons';
  import { SECTIONS, trailerTrack, type BooksSection, type GamesSection, type MoviesSection } from '../../../lib/favorites';
  import { player } from '../../stores/player.svelte';

  // Portadas de videojuegos, películas, series y libros.
  let { section }: { section: GamesSection | MoviesSection | BooksSection } = $props();

  const aspect = $derived(SECTIONS.find((s) => s.id === section.kind)!.aspect);
</script>

<ol class="grid" data-testid={`favorites-grid-${section.kind}`} style:--aspect={aspect}>
  {#if section.kind === 'games'}
    {#each section.items as game (game.id)}
      <li data-testid={`favorites-item-${game.id}`}>
        <a class="card" href={game.url} target="_blank" rel="noopener noreferrer" aria-label={`${game.title}: ver ficha (se abre en una pestaña nueva)`}>
          <img class="cover" src={game.cover} alt="" loading="lazy" />
          <span class="name">{game.title}</span>
          {#if game.year}<span class="sub">{game.year}</span>{/if}
          {#if game.edition}<span class="sub">Portada: {game.edition}</span>{/if}
        </a>
      </li>
    {/each}
  {:else if section.kind === 'movies'}
    {#each section.items as movie (movie.id)}
      <li data-testid={`favorites-item-${movie.id}`}>
        <article class="card">
          <img class="cover" src={movie.cover} alt="" loading="lazy" />
          <div class="body">
            <h3 class="name">{movie.title}</h3>
            {#if movie.category}<span class="sub">{movie.category}</span>{/if}
            {#if movie.year}<span class="sub">{movie.year}</span>{/if}
            {#if movie.synopsis}<p class="synopsis">{movie.synopsis}</p>{/if}
            {#if movie.trailer}
            <button class="trailer" data-testid={`favorites-trailer-${movie.id}`} onclick={() => player.play(trailerTrack(movie))}>
              <span aria-hidden="true">{@html UI_SVG.play}</span> Ver tráiler
            </button>
            {/if}
          </div>
        </article>
      </li>
    {/each}
  {:else}
    {#each section.items as book (book.id)}
      <li data-testid={`favorites-item-${book.id}`}>
        <div class="card">
          <img class="cover" src={book.cover} alt="" loading="lazy" />
          <span class="name">{book.title}</span>
          <span class="sub">{book.author}</span>
        </div>
      </li>
    {/each}
  {/if}
</ol>

{#if section.kind === 'games' && section.credit}
  <p class="credit" data-testid="favorites-credit">
    Las fichas están en <a href={section.credit.url} target="_blank" rel="noopener noreferrer">{section.credit.label}</a>, el proyecto de un amigo.
  </p>
{/if}
{#if section.kind === 'books' && section.link}
  <p class="credit" data-testid="favorites-link">
    <a href={section.link.url} target="_blank" rel="noopener noreferrer">{section.link.label}</a>
  </p>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 18px 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .card {
    display: grid;
    align-content: start;
    gap: 3px;
    color: inherit;
    text-decoration: none;
  }
  a.card:hover .cover {
    filter: brightness(1.06);
  }
  a.card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
    border-radius: 8px;
  }
  .cover {
    display: block;
    width: 100%;
    aspect-ratio: var(--aspect);
    object-fit: cover;
    border-radius: 8px;
    background: var(--hover);
    box-shadow: 0 0 0 1px var(--line);
  }
  .name {
    margin: 6px 0 0;
    font-size: calc(14px * var(--text-scale));
    font-weight: 600;
    line-height: 1.25;
  }
  .sub {
    font-size: calc(13px * var(--text-scale));
    color: var(--muted);
  }
  .body {
    display: grid;
    gap: 3px;
    justify-items: start;
  }
  .synopsis {
    margin: 4px 0 6px;
    font-size: calc(13px * var(--text-scale));
    line-height: 1.4;
    color: var(--muted);
  }
  .trailer {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border-radius: var(--r-control);
    font-weight: 600;
    cursor: pointer;
    color: var(--accent-fg);
    background: var(--accent-solid);
  }
  .trailer:hover {
    filter: brightness(1.08);
  }
  .trailer :global(svg) {
    width: 13px;
    height: 13px;
  }
  .credit {
    margin: 22px 0 0;
    font-size: calc(13px * var(--text-scale));
    color: var(--muted);
  }
  .credit a {
    color: var(--accent-text);
  }
</style>
