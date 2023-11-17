// Selecionando todas as teclas do piano
const pianoKeys = document.querySelectorAll(".piano-keys .key");

// Selecionando o controle deslizante de volume
const volumeSlider = document.querySelector(".volume-slider input");

// Selecionando a caixa de seleção das teclas
const keysCheck = document.querySelector(".keys-check input");

// Array para armazenar as teclas mapeadas
let mappedKeys = [];

// Criando um novo objeto de áudio
let audio = new Audio("src/tunes/a.wav");

// Elemento para mostrar as notas do tutorial
const tutorialNotesElement = document.getElementById("tutorialNotes");

// Função para tocar uma nota
const playTune = (key) => {
  // Definindo o arquivo de áudio a ser reproduzido
  audio.src = `src/tunes/${key}.wav`;
  audio.play();

  // Adicionando a classe "active" à tecla pressionada
  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  clickedKey.classList.add("active");

  // Removendo a classe "active" após 150ms
  setTimeout(() => {
    clickedKey.classList.remove("active");
  }, 150);

  // Atualizando as notas no modo tutorial
  tutorialNotesElement.textContent = key;
};

// Função para tocar uma sequência no modo tutorial
const tutorialMode = () => {
  // Notas da sequência de tutorial em minúsculas
  const tutorialSequence = [
    "g",
    "g",
    "h",
    "g",
    "l",
    "k",
    "g",
    "g",
    "h",
    "g",
    "l",
    "k",
    "g",
    "d",
    "g",
  ];

  // Tempo entre cada nota (em milissegundos)
  const timeBetweenNotes = 500;

  // Função para tocar uma única nota e avançar para a próxima
  const playNextNote = (index) => {
    if (index < tutorialSequence.length) {
      playTune(tutorialSequence[index]);

      // Agendar a próxima nota após o intervalo de tempo
      setTimeout(() => {
        playNextNote(index + 1);
      }, timeBetweenNotes);
    }
  };

  // Iniciar a sequência
  playNextNote(0);
};

// Adicionando um ouvinte de eventos de clique ao botão "Modo Tutorial"
const tutorialButton = document.getElementById("tutorialButton");
if (tutorialButton) {
  tutorialButton.addEventListener("click", tutorialMode);
}

// Adicionando um ouvinte de eventos de clique a cada tecla do piano
pianoKeys.forEach((key) => {
  key.addEventListener("click", () => playTune(key.dataset.key));
  mappedKeys.push(key.dataset.key);
});

// Adicionando um ouvinte de eventos de teclado
document.addEventListener("keydown", (e) => {
  if (mappedKeys.includes(e.key)) {
    playTune(e.key);
  }
});

// Função para alterar o volume
const changeVolume = (e) => {
  audio.volume = e.target.value;
};

// Função para mostrar/ocultar as teclas
const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

// Adicionando um ouvinte de eventos de entrada ao controle deslizante de volume
volumeSlider.addEventListener("input", changeVolume);

// Adicionando um ouvinte de eventos de clique à caixa de seleção das teclas
keysCheck.addEventListener("click", showHideKeys);
