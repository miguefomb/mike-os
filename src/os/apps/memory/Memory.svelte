<script lang="ts">
  import { onDestroy } from 'svelte';
  import { tools } from '../../../content/stack.json';
  import { MEMORY_EXTRAS, MEMORY_LOGOS, MEMORY_NAMES, MEMORY_PROFILE_TOOLS } from '../../../lib/memory-logos';
  import { PAIRS, cryptoRand, deal, flip, hide, isDone, isFaceUp, isMatched, memoryPool, mustHide, type MemoryState } from '../../../lib/memory';

  // El memory (C-05): 16 cartas con los logos de las herramientas del Stack. Sus estilos están en global.css bajo .memory, para que la
  // home no sume una petición de CSS (ver la decisión del 2026-10-16 en architecture.md).
  const COLUMNS = 4;
  /** Lo que se ven dos cartas que no son pareja antes de taparse. */
  const HIDE_MS = 1000;

  const trackedTools = tools as { id: string; name: string }[];
  const pool = memoryPool([...MEMORY_PROFILE_TOOLS, ...trackedTools.filter((t) => !MEMORY_PROFILE_TOOLS.some((p) => p.id === t.id)), ...MEMORY_EXTRAS], MEMORY_LOGOS, MEMORY_NAMES);
  let game = $state.raw<MemoryState>(deal(pool, cryptoRand));
  // `status` es para lectores de pantalla (dice qué carta se ha levantado); `note` es lo que se ve, sin nombres hasta que hay pareja.
  let status = $state('');
  let note = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let buttons: HTMLButtonElement[] = $state([]);

  const done = $derived(isDone(game));

  function choose(index: number) {
    const before = game;
    const next = flip(game, index);
    if (next === before) return;
    game = next;
    const card = next.cards[index];
    if (next.matched.length > before.matched.length) {
      status = note = isDone(next) ? `¡Completado en ${next.moves} movimientos!` : `Pareja: ${card.name}.`;
    } else if (mustHide(next)) {
      status = `${card.name}. No son pareja.`;
      note = 'No son pareja.';
      timer = setTimeout(() => (game = hide(game)), HIDE_MS);
    } else {
      status = card.name;
      note = '';
    }
  }

  function again() {
    clearTimeout(timer);
    game = deal(pool, cryptoRand);
    status = 'Cartas nuevas.';
    note = '';
    buttons[0]?.focus();
  }

  /** Las flechas mueven el foco por la cuadrícula; Inicio y Fin van a la primera y a la última carta. */
  function onkeydown(e: KeyboardEvent, index: number) {
    const last = game.cards.length - 1;
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };
    let to: number | null = null;
    if (e.key in step) to = index + step[e.key];
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = last;
    if (to === null || to < 0 || to > last) return;
    e.preventDefault();
    buttons[to]?.focus();
  }

  function label(index: number): string {
    const card = game.cards[index];
    if (isMatched(game, index)) return `Carta ${index + 1}: ${card.name}, pareja encontrada`;
    if (isFaceUp(game, index)) return `Carta ${index + 1}: ${card.name}`;
    return `Carta ${index + 1}, boca abajo`;
  }

  onDestroy(() => clearTimeout(timer));
</script>

<div class="memory" data-testid="memory">
  <header class="memory-bar">
    <span data-testid="memory-moves">Movimientos: {game.moves}</span>
    <span data-testid="memory-pairs">Parejas: {game.matched.length} de {PAIRS}</span>
  </header>
  <div class="memory-grid" role="group" aria-label="Cartas">
    {#each game.cards as card, i (i)}
      {@const up = isFaceUp(game, i)}
      {@const matched = isMatched(game, i)}
      <button
        bind:this={buttons[i]}
        class="memory-card"
        class:up
        class:matched
        data-testid={`memory-card-${i}`}
        data-state={matched ? 'matched' : up ? 'up' : 'down'}
        aria-label={label(i)}
        aria-disabled={up || undefined}
        onclick={() => choose(i)}
        onkeydown={(e) => onkeydown(e, i)}
      >
        {#if up}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={card.logo} /></svg>
          {#if matched}<span class="memory-name">{card.name}</span>{/if}
        {/if}
      </button>
    {/each}
  </div>
  <!-- Al terminar, el resultado sale solo en el aviso final (antes salía dos veces). -->
  {#if !done}<p class="memory-status" aria-hidden="true" data-testid="memory-note">{note}</p>{/if}
  <p class="sr-only" role="status" data-testid="memory-status">{status}</p>
  {#if done}
    <div class="memory-done" data-testid="memory-done">
      <strong>¡Completado en {game.moves} movimientos!</strong>
      <button class="memory-again" data-testid="memory-again" onclick={again}>Jugar otra</button>
    </div>
  {/if}
</div>
