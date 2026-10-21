<script lang="ts">
  import { PERSONA } from '../../content/persona';
  import { onMount } from 'svelte';
  import { formatTime } from '../../lib/clock';
  import AppView from '../apps/AppView.svelte';
  import type { OpenTarget } from '../apps/registry';
  import { MOBILE_DOCK, type AboutData, type Item, type NoteData, type ProjectData } from '../items';
  import AppIcon from './AppIcon.svelte';
  import MobileSheet from './MobileSheet.svelte';

  interface Props {
    items: Item[];
    projects: ProjectData[];
    notes: NoteData[];
    about: AboutData;
    sheet: OpenTarget | null;
    sheetTitle: string;
    folder: Item | null;
    onopen: (target: OpenTarget) => void;
    onfolder: (folder: Item | null) => void;
    onback: () => void;
  }

  let { items, projects, notes, about, sheet, sheetTitle, folder, onopen, onfolder, onback }: Props = $props();

  let now = $state<Date | null>(null);

  onMount(() => {
    now = new Date();
    const id = setInterval(() => (now = new Date()), 15_000);
    return () => clearInterval(id);
  });

  function activate(item: Item) {
    if (item.children) onfolder(item);
    else if (item.open) {
      onfolder(null);
      onopen(item.open);
    }
  }
</script>

{#snippet tile(item: Item)}
  {#if item.href}
    <a class="tile" href={item.href} target="_blank" rel="noopener noreferrer" data-testid={`mobile-icon-${item.id}`}>
      <span class="art"><AppIcon icon={item.icon} /></span>
      <span class="label">{item.label}</span>
    </a>
  {:else}
    <button
      class="tile"
      data-testid={`mobile-icon-${item.id}`}
      aria-label={item.children ? `Carpeta ${item.label}` : undefined}
      onclick={() => activate(item)}
    >
      <span class="art"><AppIcon icon={item.icon} /></span>
      <span class="label">{item.label}</span>
    </button>
  {/if}
{/snippet}

<div class="home" data-testid="mobile-home">
  <div class="status">
    <span>{now ? formatTime(now) : ''}</span>
    <span class="brand">{PERSONA.osName}</span>
  </div>

  <div class="grid">
    {#each items as item (item.id)}
      {@render tile(item)}
    {/each}
  </div>

  <nav class="dock" aria-label="Dock">
    {#each MOBILE_DOCK as d (d.app)}
      <button class="tile" data-testid={`mobile-dock-${d.app}`} aria-label={d.label} onclick={() => onopen({ app: d.app })}>
        <span class="art"><AppIcon icon={d.icon} /></span>
      </button>
    {/each}
  </nav>

  {#if folder?.children}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="overlay"
      data-testid="mobile-folder"
      onclick={(e) => {
        if (!(e.target as Element).closest('.tile')) onfolder(null);
      }}
    >
      <div class="folder" role="dialog" aria-label={folder.label}>
        <h2>{folder.label}</h2>
        <div class="panel">
          {#each folder.children as child (child.id)}
            {@render tile(child)}
          {/each}
        </div>
      </div>
    </div>
  {/if}

  {#if sheet}
    <MobileSheet title={sheetTitle} {onback}>
      <AppView target={sheet} {projects} {notes} {about} />
    </MobileSheet>
  {/if}
</div>

<style>
  .home {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: calc(env(safe-area-inset-top, 0px) + 10px) 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
    color: var(--on-wall);
    animation: fade-in 0.45s ease both;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
  .status {
    display: flex;
    justify-content: space-between;
    padding: 2px 10px;
    min-height: 22px;
    font-size: calc(15px * var(--text-scale));
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
  }
  .brand {
    font-size: calc(14px * var(--text-scale));
    font-weight: 500;
    opacity: 0.9;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 22px 8px;
    margin-top: 26px;
  }
  .tile {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--on-wall);
    text-decoration: none;
  }
  .art {
    width: min(62px, 17vw);
    max-width: 100%;
    aspect-ratio: 1;
  }
  .label {
    max-width: 100%;
    overflow: hidden;
    font-size: calc(12px * var(--text-scale));
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
  .dock {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    padding: 12px 14px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.22);
    border: 0.5px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(30px) saturate(1.6);
    -webkit-backdrop-filter: blur(30px) saturate(1.6);
  }
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    animation: fade-in 0.2s ease both;
  }
  .folder {
    width: min(340px, 100%);
    max-height: calc(100% - 32px);
    overflow-y: auto;
    padding: 22px 18px;
    border-radius: 30px;
    background: var(--win-bg);
    color: var(--fg);
    border: 1px solid var(--line);
    box-shadow: var(--shadow-win);
  }
  .folder h2 {
    margin: 0 0 14px 6px;
    font-size: calc(26px * var(--text-scale));
    font-weight: 700;
    text-shadow: none;
  }
  .panel {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px 10px;
  }
  .panel .tile {
    color: var(--fg);
  }
  .panel .label {
    white-space: normal;
    overflow-wrap: anywhere;
    text-shadow: none;
  }
</style>
