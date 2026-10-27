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
const tutorialInterval = 750;
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
const sequence = ["s", "s", "d", "s", "g", "t", "s", "s", "d", "s", "h", "g", "s", "s", "j", "g", "t", "d", "j", "k", "j", "g", "h", "g"];
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
      tutorialNotes.textContent = `Agora é sua vez! Passo 1 de ${sequence.length}. Toque ${sequence[0].toUpperCase()}.`;
      return;
    }
    const key = sequence[index++];
    renderLane(tutorialLane, sequence, index - 1);
    tutorialNotes.textContent = `Ouça primeiro · Passo ${index} de ${sequence.length} · Tecla ${key.toUpperCase()}`;
    playTune(key);
    if (tutorialRunning) tutorialTimer = setTimeout(next, tutorialInterval);
  };
  next();
}

function renderLane(lane, notes, position) {
  lane.replaceChildren();
  const visible = notes.slice(position, position + 4);
  visible.forEach((key, index) => {
    const cue = document.createElement("span");
    cue.className = index === 0 ? "practice-cue current" : "practice-cue";
    cue.textContent = index === 0 ? `Agora: ${key.toUpperCase()}` : key.toUpperCase();
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
    status.textContent = `Você tocou ${key.toUpperCase()}; a tecla esperada é ${notes[index].toUpperCase()}. Tente novamente, sem pressa. Passo ${index + 1} de ${notes.length}.`;
    errorTimer = setTimeout(() => {
      voices.get(key).button.classList.remove("wrong");
      errorTimer = null;
    }, 800);
    return;
  }
  if (tutorialPractice) {
    tutorialIndex++;
    if (tutorialIndex === sequence.length) {
      finishTutorial(completionMessage("tutorial", tutorialErrors));
      return;
    }
    renderLane(tutorialLane, sequence, tutorialIndex);
    markExpectedKey(sequence[tutorialIndex], "tutorialNotes");
    tutorialNotes.textContent = `Sua vez · Passo ${tutorialIndex + 1} de ${sequence.length}. Toque ${sequence[tutorialIndex].toUpperCase()}.`;
    return;
  }
  practiceIndex++;
  if (practiceIndex === exercise.length) {
    stopPractice(completionMessage("treino", practiceErrors));
    return;
  }
  renderPractice();
  practiceStatus.textContent = `Passo ${practiceIndex + 1} de ${exercise.length}. Toque ${exercise[practiceIndex].toUpperCase()}.`;
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
  practiceStatus.textContent = `Passo 1 de ${exercise.length}. Toque ${exercise[0].toUpperCase()}.`;
});

tutorialButton.addEventListener("click", () => {
  if (tutorialRunning) stopTutorial("Tutorial interrompido. Você pode começar novamente quando quiser.");
  else startTutorial();
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
