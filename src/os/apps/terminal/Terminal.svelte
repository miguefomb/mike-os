<script lang="ts">
  import { PERSONA } from '../../../content/persona';
  import { onMount, tick } from 'svelte';
  import type { NoteData, ProjectData } from '../../items';
  import { MAX_HISTORY, MAX_LINES, complete, run, type GameId, type Line } from '../../terminal/commands';
  import type { Session } from '../../terminal/games/games';
  import { dispatch } from '../../stores/os-actions';
  import { prefs } from '../../stores/prefs.svelte';

  let { projects, notes }: { projects: ProjectData[]; notes: NoteData[] } = $props();

  const PROMPT = `${PERSONA.terminalUser} ~ %`;
  const WELCOME: Line[] = [[{ text: `${PERSONA.osName} 1.0 · escribe help para ver los comandos.`, tone: 'muted' }]];

  interface Row {
    id: number;
    line: Line;
  }

  let nextId = 0;
  const toRows = (lines: Line[]): Row[] => lines.map((line) => ({ id: nextId++, line }));

  let rows = $state.raw<Row[]>(toRows(WELCOME));
  let value = $state('');
  let history = $state.raw<string[]>([]);
  // Posición al recorrer el historial con las flechas; `history.length` es "la línea nueva".
  let cursor = 0;
  let draft = '';
  let input: HTMLInputElement | undefined = $state();
  // La partida en curso (S-04): mientras la hay, lo que se escribe va al juego y el aviso cambia.
  let game = $state.raw<Session | null>(null);
  const prompt = $derived(game ? game.prompt : PROMPT);
  // Mientras se descarga el juego, lo que se escriba espera: si no, la primera jugada se tomaría por un comando.
  let starting: Promise<void> | null = null;
  let log: HTMLDivElement | undefined = $state();

  onMount(() => input?.focus({ preventScroll: true }));

  function append(lines: Line[]) {
    rows = [...rows, ...toRows(lines)].slice(-MAX_LINES);
    // Sin esperar al render, el scroll se quedaría una línea por detrás.
    void tick().then(() => {
      if (log) log.scrollTop = log.scrollHeight;
    });
  }

  const echo = (text: string): Line => [{ text: `${prompt} `, tone: 'accent' }, { text }];

  /** El código de los juegos se pide la primera vez que se escribe uno: quien no juega no lo descarga. */
  async function startGame(id: GameId | 'menu') {
    try {
      const games = await import('../../terminal/games/games');
      if (id === 'menu') return append(games.MENU);
      game = games.startGame(id, games.cryptoRand);
      append(game.intro);
    } catch {
      append([[{ text: 'No se ha podido cargar el juego. Prueba otra vez.', tone: 'error' }]]);
    }
  }

  async function submit() {
    const raw = value;
    value = '';
    if (starting) await starting;
    if (game) {
      // Las jugadas no entran en el historial: las flechas siguen recorriendo comandos.
      const echoed = echo(raw);
      const turn = game.play(raw);
      if (turn.done) game = null;
      return append([echoed, ...turn.lines]);
    }
    const command = raw.trim();
    if (command) history = [...history, command].slice(-MAX_HISTORY);
    cursor = history.length;
    draft = '';
    if (!command) return append([echo('')]);

    const result = run(raw, {
      projects: projects.map((p) => ({ id: p.id, name: p.name, summary: p.summary })),
      notes: notes.map((n) => ({ id: n.id, title: n.title })),
      theme: prefs.current.theme,
      wallpaper: prefs.current.wallpaper,
      uptimeMs: performance.now(),
      now: new Date(),
      viewport: { width: innerWidth, height: innerHeight },
      history,
    });
    if (result.clear) rows = [];
    else append([echo(raw), ...result.lines]);
    for (const action of result.actions) dispatch(action);
    if (result.game) starting = startGame(result.game).finally(() => (starting = null));
  }

  function recall(step: -1 | 1) {
    if (history.length === 0) return;
    if (cursor === history.length) draft = value;
    cursor = Math.min(history.length, Math.max(0, cursor + step));
    value = cursor === history.length ? draft : history[cursor];
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      recall(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      recall(1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (game) return;
      const done = complete(value, { projects, notes });
      value = done.value;
      if (done.options.length > 0) append([echo(value), [{ text: done.options.join('   ') }]]);
    } else if (e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      rows = [];
    } else if (e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'c') {
      // Con texto seleccionado, Ctrl+C sigue siendo "copiar".
      if (input && input.selectionStart !== input.selectionEnd) return;
      e.preventDefault();
      append([echo(`${value}^C`)]);
      if (game) {
        game = null;
        append([[{ text: 'Partida terminada.', tone: 'muted' }]]);
      }
      value = '';
      cursor = history.length;
    }
  }

  /** Un clic en cualquier parte enfoca la línea, salvo que sea para seleccionar texto o pulsar un enlace. */
  function focusInput(e: MouseEvent) {
    if ((e.target as Element).closest('a')) return;
    if (getSelection()?.toString()) return;
    input?.focus({ preventScroll: true });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="term" data-testid="terminal" onclick={focusInput}>
  <!-- Enfocable para desplazar la salida con el teclado cuando ya no cabe (por ejemplo, tras unas cuantas jugadas). -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="log" bind:this={log} tabindex="0" role="log" aria-live="polite" aria-label="Salida de la terminal" data-testid="terminal-log">
    {#each rows as row (row.id)}
      <div class="line" data-testid="terminal-line">
        {#each row.line as s, i (i)}
          {#if s.href}
            <a class="link" href={s.href} target="_blank" rel="noopener noreferrer">{s.text}</a>
          {:else}
            <span class={[s.tone, s.sr && 'sr-only']} aria-hidden={s.hidden || undefined}>{s.text}</span>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
  <div class="prompt">
    <span class="ps" aria-hidden="true" data-testid="terminal-prompt">{prompt}</span>
    <input
      bind:this={input}
      bind:value
      {onkeydown}
      data-testid="terminal-input"
      aria-label={game ? 'Jugada' : 'Comando'}
      type="text"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="send"
    />
  </div>
</div>
