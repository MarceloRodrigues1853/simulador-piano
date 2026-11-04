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
  const scheduledNotes = () => [...timers].filter(([, timer]) => timer.ms !== 180 && timer.ms !== 800);
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
    assert.equal(app.audio.find(voice => voice.src.endsWith('/a.wav')).plays, 2);
    assert.equal(app.audio.find(voice => voice.src.endsWith('/s.wav')).plays, 2);
    app.tick();
    // Testa o passo 2 do tutorial.
    assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 8/);
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
  for (let step = 0; step < 8; step++) {
    app.press('a');
    app.tick();
  }
  // Testa o passo 8 do tutorial.
  assert.match(app.get('tutorialNotes').textContent, /Agora é sua vez/);
  assert.equal(app.scheduledNotes().length, 0);
  app.press('p');
  assert.match(app.get('tutorialNotes').textContent, /esperada é Dó 4 \(atalho A\)/);
  assert.ok(app.get('tutorialNotes').classList.contains('error'));
  assert.ok(app.keys.find(button => button.dataset.key === 'p').classList.contains('wrong'));
  for (const key of ['a','s','d','s','a','s','d','a']) app.press(key);
  assert.match(app.get('tutorialNotes').textContent, /concluído/);
  assert.ok(!app.get('tutorialNotes').classList.contains('error'));
  assert.equal(app.get('tutorialLane').children.length, 0);
  assert.equal(app.scheduledNotes().length, 0);
});

// Concluir deve preservar a nota final; uma interrupção explícita ainda corta o som.
test('conclusão deixa a última nota terminar e Esc ainda interrompe o áudio', () => {
  const app = setup();
  app.click('tutorialButton');
  for (let i = 0; i < 8; i++) app.tick();
  const notes = ['a','s','d','s','a','s','d','a'];
  for (const key of notes.slice(0, -1)) app.press(key);
  const lastVoice = app.audio.find(voice => voice.src.endsWith('/a.wav'));
  const pausesBefore = lastVoice.pauses;
  const playsBefore = lastVoice.plays;
  app.press('a');
  assert.equal(lastVoice.plays, playsBefore + 1);
  assert.equal(lastVoice.pauses, pausesBefore, 'concluir não deve pausar a última nota');
  assert.match(app.get('tutorialNotes').textContent, /Parabéns!/);
  assert.equal(app.get('tutorialButton').textContent, 'Iniciar tutorial');
  assert.equal(app.scheduledNotes().length, 0);
  const lastKey = app.keys.find(button => button.dataset.key === 'a');
  assert.ok(lastKey.classList.contains('active'));
  // Executa a remoção do destaque para garantir que ele não fique preso na tela.
  for (const [id, timer] of [...app.timers]) {
    if (timer.ms === 180) { app.timers.delete(id); timer.fn(); }
  }
  assert.ok(!lastKey.classList.contains('active'));
  assert.equal(lastVoice.pauses, pausesBefore);
  app.press('Escape');
  assert.equal(lastVoice.pauses, pausesBefore + 1);
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
  assert.match(app.get('tutorialNotes').textContent, /Passo 1 de 8/);
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
    for (let i = 0; i < 8; i++) app.tick();
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
  for (let i = 0; i < 8; i++) app.tick();
  app.press('a');
  assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 8/);
  app.press('s', { repeat: true });
  assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 8/);
  app.keys.find(button => button.dataset.key === 's').events.click();
  assert.match(app.get('tutorialNotes').textContent, /Passo 3 de 8/);
});

// Confere singular, plural e reinício dos resultados dos dois modos.
for (const mode of ['treino', 'tutorial']) {
  for (const errors of [0, 1, 3]) {
    test(`${mode}: conclusão informa ${errors} erro(s) e nova partida zera a contagem`, () => {
      const app = setup();
      const button = mode === 'treino' ? 'practiceButton' : 'tutorialButton';
      const status = mode === 'treino' ? 'practiceStatus' : 'tutorialNotes';
      const notes = mode === 'treino' ? ['a','s','d','t','t','d','s','a'] : ['a','s','d','s','a','s','d','a'];
      const start = () => {
        app.click(button);
        if (mode === 'tutorial') {
          // Tocar durante a escuta não conta como erro.
          app.press('p');
          for (let i = 0; i < 8; i++) app.tick();
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

// Cada melodia deve demonstrar e praticar exatamente o mesmo conteúdo.
for (const [id, title, notes] of [
  ['passeio', 'Pequeno passeio', ['a','s','d','s','a','s','d','a']],
  ['resposta', 'Pergunta e resposta', ['a','s','d','g','d','s','a','d','s','d','s','a']],
]) {
  test(`${title}: escuta, erro, prática completa e resultado independente`, () => {
    const app = setup();
    app.get('melodySelect').value = id;
    app.get('melodySelect').events.change();
    app.click('tutorialButton');
    for (let i = 0; i < notes.length; i++) {
      assert.match(app.get('tutorialNotes').textContent, new RegExp(`Passo ${i + 1} de ${notes.length}`));
      assert.ok(app.get('tutorialLane').children[0].textContent.includes(`atalho ${notes[i].toUpperCase()}`));
      app.tick();
    }
    assert.equal(app.scheduledNotes().length, 0);
    assert.match(app.get('tutorialNotes').textContent, /Agora é sua vez/);
    app.press('p');
    for (const key of notes) app.keys.find(button => button.dataset.key === key).events.click();
    assert.match(app.get('tutorialNotes').textContent, /com 1 erro/);
    assert.ok(app.get('tutorialNotes').textContent.includes(title));
    app.click('tutorialButton');
    for (let i = 0; i < notes.length; i++) app.tick();
    for (const key of notes) app.press(key);
    assert.match(app.get('tutorialNotes').textContent, /sem nenhum erro/);
  });
}

for (const phase of ['listen', 'play']) {
  test(`trocar melodia durante ${phase} cancela a tentativa e reinicia com o novo conteúdo`, () => {
    const app = setup();
    app.click('tutorialButton');
    if (phase === 'play') {
      for (let i = 0; i < 8; i++) app.tick();
      app.press('p');
    }
    app.get('melodySelect').value = 'passeio';
    app.get('melodySelect').events.change();
    assert.equal(app.timers.size, 0);
    assert.equal(app.get('tutorialButton').textContent, 'Iniciar tutorial');
    assert.equal(app.get('tutorialLane').children.length, 0);
    assert.ok(!app.get('tutorialNotes').classList.contains('error'));
    app.click('tutorialButton');
    assert.match(app.get('tutorialNotes').textContent, /Passo 1 de 8/);
    for (let i = 0; i < 8; i++) app.tick();
    for (const key of ['a','s','d','s','a','s','d','a']) app.press(key);
    assert.match(app.get('tutorialNotes').textContent, /sem nenhum erro/);
  });
}

for (const [id, notes, beats] of [
  ['cantoAlegretense', ["g", "g", "j", "h", "j", "h", "j", "h", "h", "g", "h", "g", "g", "g", "j", "h", "j", "h", "j", "h", "h", "g", "g", "g", "g"], [1, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 2.5, 1, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 4, 1, 1]],
  ['aniversario', ['s','s','d','s','g','t','s','s','d','s','h','g','s','s','l','j','g','t','d','k','k','j','g','h','g'], [.75,.25,1,1,1,2,.75,.25,1,1,1,2,.75,.25,1,1,1,1,1,.75,.25,1,1,1,2]],
  ['natal', ["d", "d", "d", "d", "d", "d", "d", "g", "a", "s", "d", "f", "f", "f", "f", "f", "d", "d", "d", "d", "s", "s", "d", "s", "g", "d", "d", "d", "d", "d", "d", "d", "g", "a", "s", "d", "f", "f", "f", "f", "f", "d", "d", "d", "g", "g", "f", "s", "a"], [1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4]],
  ['asaBranca', ["g", "h", "j", "l", "l", "j", "k", "k", "g", "h", "j", "l", "l", "k", "j", "g", "g", "h", "j", "l", "l", "k", "j", "g", "k", "j", "j", "h", "h", "j", "h", "h", "h", "g", "g"], [0.5, 0.5, 1, 1, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 1, 2, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 2]],
]) {
  test(`${id}: respeita durações e pratica a mesma melodia até o resultado`, () => {
    const app = setup();
    app.get('melodySelect').value = id;
    app.get('melodySelect').events.change();
    app.click('tutorialButton');
    for (let i = 0; i < notes.length; i++) {
      const timers = app.scheduledNotes();
      assert.equal(timers.length, 1);
      assert.equal(timers[0][1].ms, beats[i] * 750);
      assert.ok(app.get('tutorialLane').children[0].textContent.includes(`atalho ${notes[i].toUpperCase()}`));
      app.tick();
    }
    assert.match(app.get('tutorialNotes').textContent, /Agora é sua vez/);
    app.press('p');
    for (const key of notes) app.press(key);
    assert.match(app.get('tutorialNotes').textContent, /com 1 erro/);
    assert.equal(app.scheduledNotes().length, 0);
  });
}

test('guia apresenta nota e atalho juntos sem confundir Dó com a letra C', () => {
  const app = setup();
  app.click('practiceButton');
  assert.equal(app.get('practiceLane').children[0].textContent, 'Agora: Dó 4 (atalho A)');
  app.press('s');
  assert.match(app.get('practiceStatus').textContent, /esperada é Dó 4 \(atalho A\)/);
});

// A sequência antiga não pode continuar disponível por seleção residual.
test('seleção antiga retorna ao exercício padrão sem reintroduzir o exemplo legado', () => {
  const app = setup();
  app.get('melodySelect').value = 'original';
  app.get('melodySelect').events.change();
  app.click('tutorialButton');
  assert.match(app.get('tutorialNotes').textContent, /Passo 1 de 8/);
  assert.match(app.get('tutorialLane').children[0].textContent, /Dó 4/);
});
// Mantém a cobertura de notas iguais consecutivas na música de aniversário.
test('segurar Ré não pula os dois primeiros toques de Feliz aniversário', () => {
  const app = setup();
  app.get('melodySelect').value = 'aniversario';
  app.get('melodySelect').events.change();
  app.click('tutorialButton');
  for (let i = 0; i < 25; i++) app.tick();
  app.press('s');
  app.press('s', { repeat: true });
  assert.match(app.get('tutorialNotes').textContent, /Passo 2 de 25/);
  app.press('s');
  assert.match(app.get('tutorialNotes').textContent, /Passo 3 de 25/);
});
