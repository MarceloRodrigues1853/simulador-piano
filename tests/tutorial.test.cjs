const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Simula página, áudio e tempo de forma isolada, sem instalar dependências.
function setup() {
  // Simula um elemento HTML com as propriedades e métodos necessários.
  function element(key) {
    const classes = new Set();
    return {
      dataset: { key }, value: '0.5', textContent: '', children: [], events: {},
      classList: {
        add: name => classes.add(name), remove: name => classes.delete(name),
        contains: name => classes.has(name),
        toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      },
      addEventListener(name, listener) { this.events[name] = listener; },
      setAttribute() {}, removeAttribute() {}, closest() { return null; },
      replaceChildren() { this.children = []; },
      appendChild(child) { this.children.push(child); },
    };
  }
  // Simula os botões do teclado.
  const keys = [...'awsedftgyhujkolp;'].map(element);
  const elements = new Map();
  const get = id => {
    // Se o elemento não existe, cria um novo.
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  // Simula os eventos do teclado.
  const events = {}, timers = new Map(), audio = [];
  // Simula o timer do tutorial.
  let timerId = 0;
  let failAudio = false;
  // Simula o áudio do tutorial.
  class Audio {
    // Simula o áudio do tutorial.
    constructor(src) { this.src = src; this.plays = 0; this.pauses = 0; audio.push(this); }
    // inicia o áudio.
    play() {
      this.plays++;
      return failAudio ? Promise.reject(new Error('Áudio indisponível')) : Promise.resolve();
    }
    // pausa o áudio.
    pause() { this.pauses++; }
  }
  // Simula o documento HTML.
  const document = {
    // Simula o documento HTML.
    hidden: false, createElement: () => element(),
    querySelectorAll: () => keys, querySelector: () => element(), getElementById: get,
    addEventListener: (name, listener) => { events[name] = listener; },
  };
  // Executa o código do tutorial.
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/scripts/engine.js'), 'utf8'), {
    Audio, document,
    window: { addEventListener: (name, listener) => { events[name] = listener; } },
    setTimeout(fn, ms) { timers.set(++timerId, { fn, ms }); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  // Simula o clique no botão.
  const click = id => get(id).events.click();
  // Simula o pressionamento da tecla.
  const press = (key, extra = {}) => events.keydown({
    key, target: element(), preventDefault() {}, ...extra,
  });
  // Simula as notas agendadas.
  const scheduledNotes = () => [...timers].filter(([, timer]) => timer.ms === 750);
  // Simula o tick do tutorial.
  const tick = () => {
    const scheduled = scheduledNotes();
    assert.equal(scheduled.length, 1, 'apenas uma próxima nota agendada');
    const [id, timer] = scheduled[0];
    timers.delete(id);
    timer.fn();
  };
  // Retorna o objeto simulado.
  return { get, keys, audio, events, document, timers, click, press, tick, scheduledNotes,
    failAudio: () => { failAudio = true; } };
}

// Testa as notas manuais por teclado e clique.
for (const input of ['keyboard', 'click']) {
  test(`notas manuais por ${input} preservam o andamento, a faixa e o som`, () => {
    const app = setup();
    app.click('tutorialButton');
    const initialTimer = app.scheduledNotes()[0][0];
    const initialCues = app.get('tutorialLane').children.map(cue => cue.textContent);
    // Inclui a mesma nota da demonstração e uma nota diferente.
    for (const key of ['s', 'a', 's']) {
      if (input === 'keyboard') app.press(key);
      else app.keys.find(button => button.dataset.key === key).events.click();
      assert.equal(app.get('tutorialButton').textContent, 'Parar tutorial');
      assert.equal(app.scheduledNotes()[0][0], initialTimer);
      assert.deepEqual(app.get('tutorialLane').children.map(cue => cue.textContent), initialCues);
    }
    // Testa os áudios.
    assert.equal(app.audio.find(voice => voice.src.endsWith('/a.wav')).plays, 1);
    assert.equal(app.audio.find(voice => voice.src.endsWith('/s.wav')).plays, 3);
    app.tick();
    // Testa o passo 2 do tutorial.
    assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 24/);
    app.click('tutorialButton');
    assert.equal(app.timers.size, 0);
  });
}

// Testa o tutorial passa da escuta à prática e conclui somente após os acertos.
test('tutorial passa da escuta à prática e conclui somente após os acertos', () => {
  // Simula o tutorial.
  const app = setup();
  // Clica no botão de iniciar o tutorial.
  app.click('tutorialButton');
  // Testa os passos do tutorial.
  for (let step = 0; step < 24; step++) {
    app.press('a');
    app.tick();
  }
  // Testa o passo 24 do tutorial.
  assert.match(app.get('tutorialNotes').textContent, /Agora é sua vez/);
  assert.equal(app.scheduledNotes().length, 0);
  app.press('a');
  assert.match(app.get('tutorialNotes').textContent, /esperada é S/);
  assert.ok(app.get('tutorialNotes').classList.contains('error'));
  assert.ok(app.keys.find(button => button.dataset.key === 'a').classList.contains('wrong'));
  for (const key of ['s','s','d','s','g','t','s','s','d','s','h','g','s','s','j','g','t','d','j','k','j','g','h','g']) app.press(key);
  assert.match(app.get('tutorialNotes').textContent, /concluído/);
  assert.ok(!app.get('tutorialNotes').classList.contains('error'));
  assert.equal(app.get('tutorialLane').children.length, 0);
  assert.equal(app.timers.size, 0);
});

// Testa o encerramento do tutorial após acompanhamento manual.
for (const action of ['button', 'Escape', 'practice', 'hidden', 'pagehide']) {
  test(`${action} encerra o tutorial após acompanhamento manual`, () => {
    // Simula o tutorial.
    const app = setup();
    // Clica no botão de iniciar o tutorial.
    app.click('tutorialButton');
    // Testa os passos do tutorial.
    app.press('a');
    if (action === 'button') app.click('tutorialButton');
    if (action === 'Escape') app.press('Escape');
    if (action === 'practice') app.click('practiceButton');
    if (action === 'hidden') { app.document.hidden = true; app.events.visibilitychange(); }
    if (action === 'pagehide') app.events.pagehide();
    assert.equal(app.get('tutorialButton').textContent, 'Iniciar tutorial');
    assert.equal(app.scheduledNotes().length, 0);
    assert.equal(app.timers.size, 0);
    assert.ok(app.audio.every(voice => voice.pauses > 0));
    if (action === 'practice') assert.equal(app.get('practiceButton').textContent, 'Encerrar treino');
  });
}

// Testa o encerramento do tutorial após acompanhamento manual.
test('parar e recomeçar retorna ao primeiro passo da escuta', () => {
  // Simula o tutorial.
  const app = setup();
  app.click('tutorialButton');
  app.tick();
  app.press('a');
  app.click('tutorialButton');
  app.click('tutorialButton');
  assert.match(app.get('tutorialNotes').textContent, /Passo 1 de 24/);
  assert.equal(app.scheduledNotes().length, 1);
});

// Testa a falha de áudio interrompe o tutorial e explica o problema.
test('falha de áudio interrompe o tutorial e explica o problema', async () => {
  // Simula o tutorial.
  const app = setup();
  // Clica no botão de iniciar o tutorial.
  app.click('tutorialButton');
  app.failAudio();
  app.press('a');
  await Promise.resolve();
  assert.match(app.get('audioStatus').textContent, /Não foi possível/);
  assert.equal(app.scheduledNotes().length, 0);
  assert.equal(app.get('tutorialButton').textContent, 'Iniciar tutorial');
});

// Testa o encerramento do tutorial após acompanhamento manual.
for (const action of ['button', 'Escape', 'practice', 'hidden', 'pagehide']) {
  test(`${action} também encerra a etapa de prática do tutorial`, () => {
    const app = setup();
    app.click('tutorialButton');
    for (let i = 0; i < 24; i++) app.tick();
    app.press('a');
    if (action === 'button') app.click('tutorialButton');
    if (action === 'Escape') app.press('Escape');
    if (action === 'practice') app.click('practiceButton');
    if (action === 'hidden') { app.document.hidden = true; app.events.visibilitychange(); }
    if (action === 'pagehide') app.events.pagehide();
    assert.equal(app.get('tutorialButton').textContent, 'Iniciar tutorial');
    assert.equal(app.get('tutorialLane').children.length, 0);
    assert.equal(app.timers.size, 0);
    assert.ok(!app.get('tutorialNotes').classList.contains('error'));
  });
}

// Testa a tecla mantida pressionada não pula notas repetidas na prática do tutorial.
test('tecla mantida pressionada não pula notas repetidas na prática do tutorial', () => {
  // Simula o tutorial.
  const app = setup();
  // Clica no botão de iniciar o tutorial.
  app.click('tutorialButton');
  for (let i = 0; i < 24; i++) app.tick();
  app.press('s');
  assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 24/);
  app.press('s', { repeat: true });
  assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 24/);
  app.keys.find(button => button.dataset.key === 's').events.click();
  assert.match(app.get('tutorialNotes').textContent, /Passo 3 de 24/);
});

// Confere singular, plural e reinício dos resultados dos dois modos.
for (const mode of ['treino', 'tutorial']) {
  for (const errors of [0, 1, 3]) {
    test(`${mode}: conclusão informa ${errors} erro(s) e nova partida zera a contagem`, () => {
      const app = setup();
      const button = mode === 'treino' ? 'practiceButton' : 'tutorialButton';
      const status = mode === 'treino' ? 'practiceStatus' : 'tutorialNotes';
      const notes = mode === 'treino' ? ['a','s','d','t','t','d','s','a'] : ['s','s','d','s','g','t','s','s','d','s','h','g','s','s','j','g','t','d','j','k','j','g','h','g'];
      const start = () => {
        app.click(button);
        if (mode === 'tutorial') {
          // Tocar durante a escuta não conta como erro.
          app.press('p');
          for (let i = 0; i < 24; i++) app.tick();
        }
      };
      start();
      for (let i = 0; i < errors; i++) app.press('p');
      app.press('p', { repeat: true });
      for (const key of notes) app.press(key);
      assert.match(app.get(status).textContent, /Parabéns!/);
      assert.ok(app.get(status).textContent.includes(errors === 0 ? 'sem nenhum erro!' : `com ${errors} ${errors === 1 ? 'erro' : 'erros'}.`));
      start();
      for (const key of notes) app.press(key);
      assert.match(app.get(status).textContent, /sem nenhum erro!/);
    });
  }
}
