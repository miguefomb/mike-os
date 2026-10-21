<script lang="ts">
  import { UI_SVG } from '../../icons';
  import { PLAYER_SVG } from '../../shell/player-icons';
  import { isSong, rank, songTrack, songUrl, type MusicSection } from '../../../lib/favorites';
  import { player } from '../../stores/player.svelte';

  // La música (S-03) como una lista, con el aspecto de una biblioteca: portada, título, artista, duración y un botón de play.
  let { section }: { section: MusicSection } = $props();

  const queue = $derived(section.items.filter(isSong).map(songTrack));
  const artistsOnly = $derived(section.items.every((item) => !isSong(item)));
</script>

<ol class="list" class:artists={artistsOnly} data-testid="favorites-list-music">
  {#each section.items as song, i (song.id)}
    {#if !isSong(song)}
      <li data-testid={`favorites-item-${song.id}`}>
        <a class="artist-card" href={song.url} target="_blank" rel="noopener noreferrer" aria-label={`${song.title}: escuchar en Deezer (pestaña nueva)`}>
          <img src={song.cover} alt="" loading="lazy" />
          <span>{song.title}</span>
        </a>
      </li>
    {:else}
    {@const track = songTrack(song)}
    {@const current = player.current?.id === track.id}
    <li class="row" class:playing={current} data-testid={`favorites-item-${song.id}`} aria-current={current ? 'true' : undefined}>
      <span class="num" aria-hidden="true">{rank(i)}</span>
      <img class="cover" src={song.cover} alt="" loading="lazy" />
      <span class="text">
        <span class="title">{song.title}</span>
        <span class="artist">{song.artist}</span>
      </span>
      {#if song.duration}<span class="time" data-testid="favorites-duration">{song.duration}</span>{/if}
      <a class="open" href={songUrl(song.video)} target="_blank" rel="noopener noreferrer" aria-label={`${song.title}: abrir en YouTube Music (pestaña nueva)`}>
        <span aria-hidden="true">{@html UI_SVG.external}</span>
      </a>
      <button
        class="play"
        class:now={current}
        data-testid={`favorites-play-${song.id}`}
        aria-label={current ? `${song.title}: sonando ahora` : `Reproducir ${song.title}, de ${song.artist}`}
        onclick={() => player.play(track, queue)}
      >
        <span aria-hidden="true">{@html current ? PLAYER_SVG.sound : UI_SVG.play}</span>
      </button>
    </li>
    {/if}
  {/each}
</ol>

<style>
  .list.artists {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 18px 14px;
  }
  .artist-card {
    display: grid;
    align-content: start;
    gap: 9px;
    color: inherit;
    text-decoration: none;
    font-weight: 600;
    font-size: calc(14px * var(--text-scale));
  }
  .artist-card img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 10px;
    background: var(--hover);
    box-shadow: 0 0 0 1px var(--line);
  }
  .artist-card:hover img { filter: brightness(1.08); }
  .artist-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 10px; }
  .list {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .row {
    display: grid;
    grid-template-columns: 22px 52px 1fr auto auto auto;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 10px;
  }
  .row:hover {
    background: var(--hover);
  }
  .row.playing {
    background: var(--accent-soft);
  }
  .num {
    text-align: right;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .cover {
    display: block;
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 6px;
    background: var(--hover);
    box-shadow: 0 0 0 1px var(--line);
  }
  .text {
    display: grid;
    min-width: 0;
    line-height: 1.3;
  }
  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 600;
  }
  .artist {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: calc(13px * var(--text-scale));
    color: var(--muted);
  }
  .row.playing .artist {
    color: var(--fg);
  }
  .time {
    font-size: calc(13px * var(--text-scale));
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .open {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--muted);
  }
  .open:hover {
    background: var(--hover);
    color: var(--fg);
  }
  .open :global(svg),
  .play :global(svg) {
    width: 14px;
    height: 14px;
  }
  .play {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    cursor: pointer;
    color: var(--accent-fg);
    background: var(--accent-solid);
  }
  .play:hover {
    filter: brightness(1.08);
  }
  .play.now {
    color: var(--accent-text);
    background: var(--accent-soft);
    box-shadow: inset 0 0 0 2px var(--accent);
  }
  .open:focus-visible,
  .play:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  /* En pantallas táctiles, los dos botones de cada fila miden al menos 44 px. */
  @media (max-width: 767px), (pointer: coarse) {
    .open,
    .play {
      width: 44px;
      height: 44px;
    }
    .open :global(svg),
    .play :global(svg) {
      width: 18px;
      height: 18px;
    }
  }
  @media (max-width: 520px) {
    .row {
      grid-template-columns: 44px 1fr auto auto;
      gap: 10px;
    }
    .num,
    .time {
      display: none;
    }
    .cover {
      width: 44px;
      height: 44px;
    }
  }
</style>
