<script lang="ts">
  import { PERSONA } from '../../../content/persona';
  import { PROFILE_URL, languageColor, updatedAgo, type ReposFile } from '../../../lib/repos';
  import type { ProjectData } from '../../items';
  import { dispatch } from '../../stores/os-actions';
  import stylesheet from './github.css?url';

  // La ventana GitHub (C-01): todos los repositorios públicos de Miguel. Los datos los guarda el script de actualización y se piden al
  // abrir la ventana; sus estilos llegan con ella (github.css), así la home no carga nada de esto.
  let { projects }: { projects: ProjectData[] } = $props();

  let data = $state.raw<ReposFile | null>(null);
  let failed = $state(false);
  let styled = $state(false);
  const now = new Date();

  $effect(() => {
    let cancelled = false;
    fetch('/repos.json')
      .then((res) => (res.ok ? (res.json() as Promise<ReposFile>) : Promise.reject(new Error(String(res.status)))))
      .then((d) => {
        if (!cancelled) data = d;
      })
      .catch(() => {
        if (!cancelled) failed = true;
      });
    return () => {
      cancelled = true;
    };
  });

  /** El proyecto de Pol OS que corresponde a un repositorio, si lo hay. */
  const projectFor = (name: string) => projects.find((p) => p.repo?.toLowerCase() === `${PERSONA.github}/${name}`.toLowerCase());
  const count = (n: number) => (n === 1 ? '1 repositorio' : `${n} repositorios`);
</script>

<svelte:head>
  <link rel="stylesheet" href={stylesheet} onload={() => (styled = true)} onerror={() => (styled = true)} />
</svelte:head>

<div class="github-app" class:loading={!styled} data-testid="github">
  <header class="gh-bar">
    <span class="gh-count" data-testid="github-count">{data ? count(data.repos.length) : ''}</span>
    <a class="gh-profile" href={PROFILE_URL} target="_blank" rel="noopener noreferrer" data-testid="github-profile">Visitar mi GitHub ↗</a>
  </header>

  <div class="gh-scroll" role="region" aria-label="Repositorios" tabindex="0">
    {#if failed}
      <p class="gh-status" role="alert" data-testid="github-error">No se han podido cargar los repositorios. Vuelve a abrir la ventana o visita mi GitHub.</p>
    {:else if !data}
      <p class="gh-status" role="status">Cargando…</p>
    {:else if data.repos.length === 0}
      <p class="gh-status" data-testid="github-empty">Todavía no hay repositorios públicos en la lista. Puedes visitar mi perfil de GitHub.</p>
    {:else}
      <ul class="gh-list" data-testid="github-list">
        {#each data.repos as repo (repo.name)}
          {@const project = projectFor(repo.name)}
          <li class="gh-card" data-testid={`github-repo-${repo.name}`}>
            <div class="gh-title">
              <svg class="gh-book" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 2.5A1.5 1.5 0 0 1 4.5 1h8v11h-8A1.5 1.5 0 0 0 3 13.5z" />
                <path d="M3 13.5A1.5 1.5 0 0 0 4.5 15H6M8 12v3.5l1.25-1 1.25 1V12" />
              </svg>
              <a class="gh-name" href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`${repo.name} en GitHub (pestaña nueva)`}>{repo.name}</a>
              <span class="gh-badge">{repo.archived ? 'Archivado' : 'Público'}</span>
            </div>
            {#if repo.description}<p class="gh-desc">{repo.description}</p>{/if}
            {#if repo.homepage}
              <a class="gh-home" href={repo.homepage} target="_blank" rel="noopener noreferrer" data-testid="github-homepage">{repo.homepage.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>
            {/if}
            <div class="gh-meta">
              {#if repo.language}
                <span class="gh-lang"><span class="gh-dot" style:background={languageColor(repo.language)} aria-hidden="true"></span>{repo.language}</span>
              {/if}
              <span aria-label={`${repo.stars} estrellas`}>★ {repo.stars}</span>
              <span aria-label={`${repo.forks} forks`}>⑂ {repo.forks}</span>
              <span>Actualizado {updatedAgo(repo.pushedAt, now)}</span>
              {#if project}
                <button
                  type="button"
                  class="gh-project"
                  data-testid="github-in-projects"
                  onclick={() => dispatch({ type: 'open', target: { app: 'projects', arg: project.id } })}>En Proyectos</button
                >
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
