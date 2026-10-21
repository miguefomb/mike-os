<script lang="ts">
  import data from '../../../content/stack.json';
  import skills from '../../../content/skills.json';
  import { CATEGORIES } from '../../../lib/stack-catalog';
  import { barPercent, groupByCategory, summary, type StackData } from '../../../lib/stack';
  import { cumulativeByYear, donutArcs, linePoints } from '../../../lib/stack-charts';

  // Los datos salen de src/content/stack.json, que actualiza cada día una tarea de GitHub Actions (M-05).
  const stack = data as StackData;
  const groups = groupByCategory(stack.tools);
  const max = Math.max(0, ...stack.tools.map((t) => t.repos));
  const totals = summary(stack);
  const updated = new Date(`${stack.generatedAt}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const repos = (n: number) => `${n} ${n === 1 ? 'repositorio' : 'repositorios'}`;
  const sinceYear = Math.min(...stack.tools.map((t) => t.since));

  // Cada categoría tiene su color (--cat-1 a --cat-8), en el orden del catálogo.
  const categoryIndex = new Map<string, number>(CATEGORIES.map((c, i) => [c.id, i + 1]));
  const color = (category: string) => `var(--cat-${categoryIndex.get(category) ?? 8})`;
  const categoryLabel = new Map<string, string>(CATEGORIES.map((c) => [c.id, c.label]));

  // Rosco: cuántas herramientas hay de cada categoría.
  const categoryCounts = groups.map((g) => ({ id: g.id, label: g.label, value: g.tools.length }));
  const arcs = donutArcs(categoryCounts, { cx: 60, cy: 60, outer: 56, inner: 37, gap: 1.6 });

  // Año a año: herramientas acumuladas.
  const steps = cumulativeByYear(stack.tools);
  const points = linePoints(steps.map((s) => s.total));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${(100 - p.y).toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${points.at(-1)?.x.toFixed(2) ?? 0} 100 L${points[0]?.x.toFixed(2) ?? 0} 100 Z`;
</script>

<!-- Una ficha técnica con gráficos: solo se lee. No hay nada que pulsar: ni enlaces, ni botones, ni campos, ni pestañas. -->
<!-- La región se puede enfocar con el teclado para desplazarla con las flechas. -->
<div class="stack" data-testid="stack" role="region" aria-label="Stack: herramientas que uso" tabindex="0">
  <header>
    <h2>Herramientas y disciplinas</h2>
    <p class="muted" data-testid="stack-profile-source">Tecnología, imagen y sonido: las herramientas con las que desarrollo mis proyectos.</p>
  </header>
  <div data-testid="stack-skills">
    {#each skills as skill (skill.id)}
      <section aria-labelledby={`skill-${skill.id}`}>
        <h3 id={`skill-${skill.id}`}>{skill.title}</h3>
        <p class="muted">{skill.description}</p>
        <ul class="skill-tools">
          {#each skill.tools as tool (tool)}<li>{tool}</li>{/each}
        </ul>
      </section>
    {/each}
  </div>
  {#if stack.tools.length > 0}
  <header>
    <h2>Actividad en GitHub</h2>
    <p class="muted" data-testid="stack-source">
      Datos a {updated}, de mis repositorios de GitHub ({stack.repos.public} públicos y {stack.repos.private} privados; de estos solo cuento, no enseño
      nombres).
    </p>
    <p class="muted" data-testid="stack-how">
      Cómo se obtienen: una tarea automática de GitHub Actions revisa cada día mis repositorios con un permiso de solo lectura, mira qué lenguajes y
      dependencias usa cada uno y los traduce a herramientas. Si hay cambios, publica los datos nuevos sola. Está contado con más detalle en «Cómo está hecho».
    </p>
  </header>

  <!-- Cifras de resumen -->
  <section class="stats" aria-label="Resumen" data-testid="stack-stats">
    <p class="stat" data-testid="stack-stat-tools"><strong>{totals.tools}</strong><span>herramientas</span></p>
    <p class="stat" data-testid="stack-stat-repos"><strong>{totals.repos}</strong><span>{totals.repos === 1 ? 'repositorio' : 'repositorios'}</span></p>
    <p class="stat" data-testid="stack-stat-since"><strong>{sinceYear}</strong><span>construyendo desde</span></p>
  </section>

  <!-- Año a año -->
  <section aria-labelledby="stack-years" data-testid="stack-years">
    <h3 id="stack-years">Año a año</h3>
    <p class="hint">Herramientas acumuladas y las que entraron cada año.</p>
    <div class="timeline" style:--cols={steps.length}>
      <div class="chart" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path class="area" d={areaPath} />
          <path class="line" d={linePath} vector-effect="non-scaling-stroke" />
        </svg>
        {#each points as p, i (steps[i].year)}
          <i class="point" style:left={`${p.x}%`} style:bottom={`${p.y}%`}></i>
        {/each}
      </div>
      <ol class="years">
        {#each steps as step (step.year)}
          <li data-testid={`stack-year-${step.year}`}>
            <strong class="year-total" data-testid="stack-year-total">{step.total}</strong>
            <span class="year-label"><span data-testid="stack-year">{step.year}</span></span>
            <span class="year-added">
              {#if step.added.length > 0}+{step.added.length}: {step.added.join(', ')}{:else}Sin altas{/if}
            </span>
          </li>
        {/each}
      </ol>
    </div>
  </section>

  <!-- Reparto por categoría -->
  <section aria-labelledby="stack-donut-title" data-testid="stack-donut">
    <h3 id="stack-donut-title">Por categoría</h3>
    <div class="donut-wrap">
      <div class="donut">
        <svg viewBox="0 0 120 120" role="img" aria-label={`Reparto de las ${totals.tools} herramientas por categoría`}>
          {#each arcs as arc (arc.id)}
            <path d={arc.d} style:fill={color(arc.id)} />
          {/each}
        </svg>
        <p class="donut-center"><strong>{totals.tools}</strong><span>herramientas</span></p>
      </div>
      <ul class="legend" data-testid="stack-legend">
        {#each categoryCounts as c (c.id)}
          <li data-testid={`stack-legend-${c.id}`}>
            <i class="dot" style:background={color(c.id)} aria-hidden="true"></i>
            <span class="legend-name">{c.label}</span>
            <span class="legend-count" data-testid="stack-legend-count">{c.value}</span>
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <!-- El detalle por herramienta, siempre visible -->
  <section aria-labelledby="stack-detail-title" data-testid="stack-detail">
    <h3 id="stack-detail-title">Detalle por herramienta</h3>
    {#each groups as group (group.id)}
      <div class="group" aria-labelledby={`stack-${group.id}`} role="group" data-testid={`stack-group-${group.id}`}>
        <h4 id={`stack-${group.id}`} style:background={color(group.id)}>{group.label}</h4>
        <ul class="rows">
          {#each group.tools as tool (tool.id)}
            <li data-testid={`stack-tool-${tool.id}`}>
              <span class="name">{tool.name}</span>
              <span class="bar" aria-hidden="true"><i style:width={`${barPercent(tool.repos, max)}%`} style:background={color(tool.category)}></i></span>
              <span class="meta"><span data-testid="stack-count">{tool.repos}</span> · desde <span data-testid="stack-since">{tool.since}</span></span>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </section>

  <p class="note" data-testid="stack-note">
    Los números cuentan repositorios, y muchos nacieron de un generador, que trae de serie React, Tailwind, Vite, shadcn/ui, Radix, TanStack, Zod y
    ESLint. «Desde» es el año de mi primer repositorio con esa herramienta, nunca anterior a su lanzamiento.
  </p>
  {/if}
</div>

<style>
  .skill-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    list-style: none;
  }
  .skill-tools li {
    padding: 6px 10px;
    border: 1px solid var(--line);
    border-radius: var(--r-control, 7px);
    background: var(--surface);
    font-size: calc(13px * var(--text-scale));
  }
  .stack {
    height: 100%;
    overflow-y: auto;
    padding: 22px 26px 30px;
    background: var(--win-bg);
    color: var(--fg);
  }
  h2 {
    margin: 0;
    font-size: calc(22px * var(--text-scale));
  }
  .muted,
  .note,
  .hint {
    margin: 4px 0 0;
    color: var(--muted);
    line-height: 1.5;
    max-width: 62ch;
  }
  .hint {
    margin: 0 0 12px;
  }
  section {
    margin-top: 24px;
  }
  h3 {
    margin: 0 0 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--line);
    font-size: calc(13px * var(--text-scale));
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Cifras de resumen */
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .stat {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
  }
  .stat strong {
    font-size: calc(30px * var(--text-scale));
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .stat span {
    color: var(--muted);
  }

  /* Rosco */
  .donut-wrap {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .donut {
    position: relative;
    flex: none;
    width: 184px;
    height: 184px;
  }
  .donut svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .donut-center {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    gap: 0;
    margin: 0;
    text-align: center;
  }
  .donut-center strong {
    font-size: calc(26px * var(--text-scale));
    line-height: 1.1;
  }
  .donut-center span {
    color: var(--muted);
  }
  .legend {
    flex: 1;
    min-width: 180px;
    max-width: 300px;
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 6px;
  }
  .legend li {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    align-items: center;
    gap: 10px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .legend-count {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* Año a año */
  .timeline {
    margin-top: 4px;
  }
  .chart {
    position: relative;
    height: 96px;
  }
  .chart svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .area {
    fill: var(--accent-soft);
  }
  .line {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.5;
    stroke-linejoin: round;
  }
  .point {
    position: absolute;
    width: 10px;
    height: 10px;
    transform: translate(-50%, 50%);
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--win-bg);
  }
  .years {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .years li {
    display: grid;
    align-content: start;
    justify-items: center;
    gap: 2px;
    padding: 8px 4px 0;
    text-align: center;
  }
  .year-total {
    font-size: calc(20px * var(--text-scale));
    font-variant-numeric: tabular-nums;
  }
  .year-label {
    font-weight: 600;
    color: var(--muted);
  }
  .year-added {
    color: var(--muted);
    line-height: 1.4;
    font-size: calc(13px * var(--text-scale));
  }

  /* Detalle por herramienta */
  .group {
    margin-top: 20px;
  }
  /* El título de cada categoría lleva el color de la categoría, como las barras y el rosco. */
  h4 {
    display: inline-block;
    margin: 0 0 6px;
    padding: 3px 12px;
    border-radius: 7px;
    color: var(--cat-fg);
    font-size: calc(15px * var(--text-scale));
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .rows {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .rows li {
    display: grid;
    grid-template-columns: minmax(110px, 170px) 1fr minmax(110px, auto);
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }
  .name {
    font-weight: 500;
  }
  .bar {
    height: 6px;
    border-radius: 99px;
    background: var(--hover);
    overflow: hidden;
  }
  .bar i {
    display: block;
    height: 100%;
    border-radius: 99px;
  }
  .meta {
    text-align: right;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .meta span:first-child {
    color: var(--fg);
    font-weight: 600;
  }
  .note {
    margin-top: 24px;
    font-size: calc(13px * var(--text-scale));
  }
  @media (max-width: 520px) {
    .stack {
      padding: 18px 16px 26px;
    }
    .stats {
      gap: 6px;
    }
    .stat {
      padding: 10px 10px;
    }
    .rows li {
      grid-template-columns: 1fr auto;
      grid-template-areas: 'name meta' 'bar bar';
      gap: 4px 12px;
    }
    .name {
      grid-area: name;
    }
    .meta {
      grid-area: meta;
    }
    .bar {
      grid-area: bar;
    }
    .year-added {
      font-size: calc(12px * var(--text-scale));
    }
  }
</style>
