const pianoKeys = document.querySelectorAll(".piano-keys .key");
const keyboard = document.querySelector(".piano-keys");
const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const soundButton = document.getElementById("soundButton");
const tutorialButton = document.getElementById("tutorialButton");
const tutorialNotes = document.getElementById("tutorialNotes");
const audioStatus = document.getElementById("audioStatus");
const practiceButton = document.getElementById("practiceButton");
const practiceLane = document.getElementById("practiceLane");
const practiceStatus = document.getElementById("practiceStatus");
const tutorialLane = document.getElementById("tutorialLane");
const melodySelect = document.getElementById("melodySelect");
const melodyDescription = document.getElementById("melodyDescription");
const tutorialInterval = 750;
// Notas identificadas pela frequência dos WAVs; os atalhos originais são preservados.
const noteNames = { "a": "Dó 4", "w": "Dó♯ 4", "s": "Ré 4", "e": "Ré♯ 4", "d": "Mi 4", "f": "Fá 4", "t": "Fá♯ 4", "g": "Sol 4", "y": "Sol♯ 4", "h": "Lá 4", "u": "Lá♯ 4", "j": "Si 4", "k": "Dó 5", "o": "Dó♯ 5", "l": "Ré 5", "p": "Ré♯ 5", ";": "Mi 5" };
function noteLabel(key) { return `${noteNames[key]} (atalho ${key.toUpperCase()})`; }
let tutorialStage = "idle";
let tutorialIndex = 0;
let tutorialErrors = 0;
let errorTimer = null;
// Exercício próprio de coordenação: as letras são atalhos, não nomes de notas.
const exercise = ["a", "s", "d", "t", "t", "d", "s", "a"];
let practiceIndex = 0;
let practiceErrors = 0;
let practiceRunning = false;
const voices = new Map();
const activeTimers = new Map();
// As duas melodias curtas são exercícios originais desta evolução do projeto.
// As letras continuam sendo atalhos; não dependem da cor desenhada das teclas.
const melodies = {
  aniversario: {
    title: "Feliz aniversário",
    description: "Melodia de Mildred J. Hill, publicada como Good Morning to All (1893). Adaptação instrumental didática, sem letra. 25 toques.",
    keys: ["s","s","d","s","g","t","s","s","d","s","h","g","s","s","l","j","g","t","d","k","k","j","g","h","g"],
    beats: [.75,.25,1,1,1,2,.75,.25,1,1,1,2,.75,.25,1,1,1,1,1,.75,.25,1,1,1,2],
  },
  natal: {
    title: "Jingle Bells — refrão",
    description: "James Lord Pierpont (1857). Refrão instrumental em quatro frases, 49 toques. Adaptação didática sem letra.",
    keys: ["d", "d", "d", "d", "d", "d", "d", "g", "a", "s", "d", "f", "f", "f", "f", "f", "d", "d", "d", "d", "s", "s", "d", "s", "g", "d", "d", "d", "d", "d", "d", "d", "g", "a", "s", "d", "f", "f", "f", "f", "f", "d", "d", "d", "g", "g", "f", "s", "a"],
    beats: [1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4],
  },
  asaBranca: {
    title: "Asa Branca — primeira estrofe",
    description: "Luiz Gonzaga e Humberto Teixeira (1947). Primeira estrofe instrumental, 35 toques. Ritmo simplificado para aprender; não é a gravação completa.",
    keys: ["g", "h", "j", "l", "l", "j", "k", "k", "g", "h", "j", "l", "l", "k", "j", "g", "g", "h", "j", "l", "l", "k", "j", "g", "k", "j", "j", "h", "h", "j", "h", "h", "h", "g", "g"],
    beats: [0.5, 0.5, 1, 1, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 1, 2, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 2],
  },
  cantoAlegretense: {
    title: "Canto Alegretense — tema inicial",
    description: "Antônio Augusto Fagundes e Euclides Fagundes Filho. Tema inicial instrumental de 25 toques, transposto e simplificado para este teclado. Não é a canção inteira.",
    keys: ["g", "g", "j", "h", "j", "h", "j", "h", "h", "g", "h", "g", "g", "g", "j", "h", "j", "h", "j", "h", "h", "g", "g", "g", "g"],
    beats: [1, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 2.5, 1, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 4, 1, 1],
  },
  passeio: {
    title: "Pequeno passeio",
    description: "Melodia original de 8 toques. Explore três teclas: A, S e D.",
    keys: ["a", "s", "d", "s", "a", "s", "d", "a"],
  },
  resposta: {
    title: "Pergunta e resposta",
    description: "Melodia original de 12 toques. Explore quatro teclas: A, S, D e G.",
    keys: ["a", "s", "d", "g", "d", "s", "a", "d", "s", "d", "s", "a"],
  },
};
let selectedMelody = melodies.passeio;
let sequence = selectedMelody.keys;
let muted = false;
let tutorialTimer = null;
let tutorialRunning = false;
let playbackGeneration = 0;

// Reutiliza um áudio por tecla e permite que notas diferentes soem juntas.
pianoKeys.forEach((button) => {
  const voice = new Audio(`./src/tunes/${button.dataset.key}.wav`);
  voice.preload = "none";
  voices.set(button.dataset.key, { voice, button });
  button.addEventListener("click", () => {
    handleNote(button.dataset.key);
  });
});

// Atualiza o volume dos áudios.
function updateVolume() {
  // Obtém o volume do slider.
  const volume = Number(volumeSlider.value);
  voices.forEach(({ voice }) => {
    // Define o volume do áudio.
    voice.volume = volume;
    // Define se o áudio está mutado.
    voice.muted = muted;
  });
  // Define o valor do volume.
  volumeValue.value = `${Math.round(volume * 100)}%`;
  // Define o valor do volume.
  volumeSlider.setAttribute("aria-valuetext", volumeValue.value);
  // Define se o botão de som está pressionado.
  soundButton.setAttribute("aria-pressed", String(muted));
  // Define o texto do botão de som.
  soundButton.textContent = muted ? "Ativar som" : "Silenciar";
}

// Toca o áudio da tecla.
function playTune(key) {
  // Obtém o áudio da tecla.
  const entry = voices.get(key);
  if (!entry) return;
  const { voice, button } = entry;
  voice.currentTime = 0;
  const generation = playbackGeneration;
  const reportError = (error) => {
    if (generation !== playbackGeneration || error.name === "AbortError") return;
    audioStatus.textContent = "Não foi possível tocar o áudio. Tente novamente ou confira se o navegador permite som.";
    if (tutorialRunning) stopTutorial("Tutorial interrompido porque o áudio não pôde ser reproduzido.");
  };
  // Tenta tocar o áudio.
  try {
    // Toca o áudio.
    const playback = voice.play();
    // Se o áudio foi tocado, captura o erro.
    if (playback) playback.catch(reportError);
  } catch (error) {
    reportError(error);
  }
  // Limpa o timer da tecla.
  clearTimeout(activeTimers.get(key));
  button.classList.add("active");
  activeTimers.set(key, setTimeout(() => {
    button.classList.remove("active");
    activeTimers.delete(key);
  }, 180));
}


function stopVoices() {
  playbackGeneration++;
  voices.forEach(({ voice, button }) => {
    voice.pause();
    voice.currentTime = 0;
    button.classList.remove("active");
  });
  activeTimers.forEach(clearTimeout);
  activeTimers.clear();
}

function stopTutorial(message) {
  finishTutorial(message);
  stopVoices();
}

// Finaliza a interface e o agendamento sem cortar as notas que ainda estão soando.
function finishTutorial(message) {
  clearTimeout(tutorialTimer);
  tutorialTimer = null;
  tutorialRunning = false;
  tutorialStage = "idle";
  clearPracticeError();
  clearExpectedKeys();
  tutorialButton.textContent = "Iniciar tutorial";
  tutorialNotes.textContent = message;
  tutorialLane.replaceChildren();
}

function startTutorial() {
  stopPractice("Treino interrompido para ouvir o tutorial.");
  stopVoices();
  audioStatus.textContent = "";
  tutorialRunning = true;
  tutorialErrors = 0;
  tutorialStage = "listen";
  tutorialButton.textContent = "Parar tutorial";
  let index = 0;
  const next = () => {
    if (!tutorialRunning) return;
    if (index === sequence.length) {
      // Depois de ouvir tudo, a mesma sequência passa a esperar cada acerto.
      tutorialTimer = null;
      stopVoices();
      tutorialStage = "play";
      tutorialIndex = 0;
      renderLane(tutorialLane, sequence, tutorialIndex);
      markExpectedKey(sequence[0], "tutorialNotes");
      tutorialNotes.textContent = `Agora é sua vez! Passo 1 de ${sequence.length}. Toque ${noteLabel(sequence[0])}.`;
      return;
    }
    const key = sequence[index++];
    renderLane(tutorialLane, sequence, index - 1);
    tutorialNotes.textContent = `Ouça primeiro · Passo ${index} de ${sequence.length} · Tecla ${noteLabel(key)}`;
    playTune(key);
    if (tutorialRunning) tutorialTimer = setTimeout(next, tutorialInterval * (selectedMelody.beats?.[index - 1] || 1));
  };
  next();
}

function renderLane(lane, notes, position) {
  lane.replaceChildren();
  const visible = notes.slice(position, position + 4);
  visible.forEach((key, index) => {
    const cue = document.createElement("span");
    cue.className = index === 0 ? "practice-cue current" : "practice-cue";
    cue.textContent = index === 0 ? `Agora: ${noteLabel(key)}` : noteLabel(key);
    lane.appendChild(cue);
  });
}

function renderPractice() {
  renderLane(practiceLane, exercise, practiceIndex);
  markExpectedKey(exercise[practiceIndex], "practiceStatus");
}

// A marca da próxima tecla é compartilhada pelos dois exercícios guiados.
function markExpectedKey(expectedKey, statusId) {
  voices.forEach(({ button }, key) => {
    const expected = key === expectedKey;
    button.classList.toggle("expected", expected);
    if (expected) button.setAttribute("aria-describedby", statusId);
    else button.removeAttribute("aria-describedby");
  });
}

function clearExpectedKeys() {
  voices.forEach(({ button }) => {
    button.classList.remove("expected");
    button.removeAttribute("aria-describedby");
  });
}

function clearPracticeError() {
  clearTimeout(errorTimer);
  errorTimer = null;
  practiceStatus.classList.remove("error");
  tutorialNotes.classList.remove("error");
  voices.forEach(({ button }) => button.classList.remove("wrong"));
}

function stopPractice(message) {
  if (!practiceRunning) return;
  practiceRunning = false;
  clearPracticeError();
  practiceButton.textContent = "Recomeçar treino";
  practiceStatus.textContent = message;
  practiceLane.replaceChildren();
  clearExpectedKeys();
}

function handleNote(key) {
  // Durante a escuta, notas manuais não alteram o andamento da demonstração.
  playTune(key);
  const tutorialPractice = tutorialRunning && tutorialStage === "play";
  if (!practiceRunning && !tutorialPractice) return;
  const notes = tutorialPractice ? sequence : exercise;
  const index = tutorialPractice ? tutorialIndex : practiceIndex;
  const status = tutorialPractice ? tutorialNotes : practiceStatus;
  clearPracticeError();
  if (key !== notes[index]) {
    if (tutorialPractice) tutorialErrors++;
    else practiceErrors++;
    voices.get(key).button.classList.add("wrong");
    status.classList.add("error");
    status.textContent = `Você tocou ${key.toUpperCase()}; a tecla esperada é ${noteLabel(notes[index])}. Tente novamente, sem pressa. Passo ${index + 1} de ${notes.length}.`;
    errorTimer = setTimeout(() => {
      voices.get(key).button.classList.remove("wrong");
      errorTimer = null;
    }, 800);
    return;
  }
  if (tutorialPractice) {
    tutorialIndex++;
    if (tutorialIndex === sequence.length) {
      finishTutorial(`${selectedMelody.title} · ${completionMessage("tutorial", tutorialErrors)}`);
      return;
    }
    renderLane(tutorialLane, sequence, tutorialIndex);
    markExpectedKey(sequence[tutorialIndex], "tutorialNotes");
    tutorialNotes.textContent = `Sua vez · Passo ${tutorialIndex + 1} de ${sequence.length}. Toque ${noteLabel(sequence[tutorialIndex])}.`;
    return;
  }
  practiceIndex++;
  if (practiceIndex === exercise.length) {
    stopPractice(completionMessage("treino", practiceErrors));
    return;
  }
  renderPractice();
  practiceStatus.textContent = `Passo ${practiceIndex + 1} de ${exercise.length}. Toque ${noteLabel(exercise[practiceIndex])}.`;
}

// Conta apenas teclas diferentes da esperada durante a prática, sem penalizar.
function completionMessage(mode, errors) {
  const result = errors === 0 ? "sem nenhum erro!" : `com ${errors} ${errors === 1 ? "erro" : "erros"}.`;
  return `Parabéns! ${mode === "tutorial" ? "Tutorial" : "Treino"} concluído ${result} Você tocou toda a sequência. Que tal praticar novamente?`;
}

practiceButton.addEventListener("click", () => {
  if (practiceRunning) {
    stopPractice("Treino encerrado. Você pode recomeçar ou tocar livremente.");
    stopVoices();
    return;
  }
  stopTutorial("Tutorial parado para praticar.");
  audioStatus.textContent = "";
  practiceIndex = 0;
  practiceErrors = 0;
  practiceRunning = true;
  practiceButton.textContent = "Encerrar treino";
  renderPractice();
  practiceStatus.textContent = `Passo 1 de ${exercise.length}. Toque ${noteLabel(exercise[0])}.`;
});

tutorialButton.addEventListener("click", () => {
  if (tutorialRunning) stopTutorial("Tutorial interrompido. Você pode começar novamente quando quiser.");
  else startTutorial();
});
melodySelect.addEventListener("change", () => {
  // Trocar de conteúdo cancela a tentativa atual e qualquer áudio pendente.
  stopPractice("Treino interrompido ao escolher uma melodia.");
  stopTutorial("Melodia selecionada. Inicie o tutorial para ouvir e depois tocar.");
  selectedMelody = melodies[melodySelect.value] || melodies.passeio;
  sequence = selectedMelody.keys;
  tutorialIndex = 0;
  tutorialErrors = 0;
  melodyDescription.textContent = selectedMelody.description;
});
volumeSlider.addEventListener("input", updateVolume);
soundButton.addEventListener("click", () => { muted = !muted; updateVolume(); });
document.getElementById("showKeys").addEventListener("change", (event) => {
  keyboard.classList.toggle("hide-letters", !event.target.checked);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    stopPractice("Treino interrompido. Recomece quando quiser.");
    if (tutorialRunning) stopTutorial("Tutorial interrompido. Toque livremente.");
    else stopVoices();
    return;
  }
  // Preserva o uso normal dos campos e dos atalhos do navegador.
  if (event.repeat) {
    if (event.target.closest(".key") && ["Enter", " "].includes(event.key)) event.preventDefault();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  if (event.target.closest("input, textarea, select, [contenteditable]")) return;
  const key = event.key.toLowerCase();
  if (!voices.has(key)) return;
  event.preventDefault();
  handleNote(key);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopPractice("Treino interrompido ao sair da página. Recomece quando quiser.");
    if (tutorialRunning) stopTutorial("Tutorial interrompido ao sair da página. Inicie novamente quando quiser.");
    else stopVoices();
  }
});
window.addEventListener("pagehide", () => {
  stopPractice("Treino interrompido. Recomece quando quiser.");
  stopTutorial("Pronto para começar.");
});
updateVolume();
