<script lang="ts">
  import { untrack } from 'svelte';
  import { inFolder, projectIcon, type ProjectData } from '../../items';
  import AppIcon from '../../shell/AppIcon.svelte';
  import { dispatch } from '../../stores/os-actions';
  import ProjectDetail from './ProjectDetail.svelte';

  interface Props {
    projects: ProjectData[];
    /** Proyecto con el que se abre la ventana; null es la vista general. */
    initial?: string | null;
    /** Cambia cada vez que se pide abrir la app: se vuelve a navegar a `initial`. */
    nav?: number;
  }

  let { projects, initial = null, nav = 0 }: Props = $props();

  const find = (id: string | null) => (id ? (projects.find((p) => p.id === id) ?? null) : null);

  let selected = $state<string | null>(untrack(() => find(initial)?.id ?? null));
  let lastNav = untrack(() => nav);

  // Con la ventana ya abierta, otro doble clic en un icono de proyecto (o en la carpeta) navega dentro de ella.
  $effect(() => {
    const n = nav;
    const target = initial;
    if (n === lastNav) return;
    lastNav = n;
    untrack(() => (selected = find(target)?.id ?? null));
  });

  const project = $derived(find(selected));
</script>

{#if project}
  <ProjectDetail
    {project}
    onback={() => (selected = null)}
    onbrowser={() => dispatch({ type: 'open', target: { app: 'browser', arg: project.id } })}
  />
{:else}
  <div class="overview" data-testid="projects">
    <h2>Proyectos</h2>
    <ul class="grid">
      {#each inFolder(projects) as p (p.id)}
        <li>
          <button class="card" data-testid={`projects-card-${p.id}`} onclick={() => (selected = p.id)}>
            <span class="icon" aria-hidden="true"><AppIcon icon={projectIcon(p)} /></span>
            <span class="body">
              <span class="name">{p.name}</span>
              <span class="summary">{p.summary}</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .overview {
    height: 100%;
    overflow-y: auto;
    padding: 20px 24px 32px;
    background: var(--win-bg);
    color: var(--fg);
  }
  h2 {
    margin: 0 0 14px;
    font-size: calc(20px * var(--text-scale));
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: 12px;
    border-radius: 12px;
    text-align: left;
    cursor: pointer;
    background: var(--win-bg);
    box-shadow: inset 0 0 0 1px var(--line);
  }
  .card:hover {
    background: var(--hover);
    box-shadow: inset 0 0 0 1px var(--line-strong);
  }
  .icon {
    flex: none;
    width: 52px;
    height: 52px;
  }
  .body {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  .name {
    font-weight: 600;
    font-size: calc(15px * var(--text-scale));
  }
  .summary {
    color: var(--muted);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 2.8em;
    overflow: hidden;
  }
</style>
