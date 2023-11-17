// Selecionando todas as teclas do piano
const pianoKeys = document.querySelectorAll(".piano-keys .key");

// Selecionando o controle deslizante de volume
const volumeSlider = document.querySelector(".volume-slider input");

// Selecionando a caixa de seleção das teclas
const keysCheck = document.querySelector(".keys-check input");

// Elemento para mostrar as notas do tutorial
const tutorialNotesElement = document.getElementById("tutorialNotes");

// Elemento no corpo da página para exibir as notas dinamicamente
const notesDisplay = document.createElement("div");
notesDisplay.id = "notesDisplay"; // Adiciona o id
document.body.appendChild(notesDisplay);

// Array para armazenar as teclas mapeadas
let mappedKeys = [];

// Função para tocar uma nota
const playTune = (key) => {
  // Definindo o arquivo de áudio a ser reproduzido
  const audio = new Audio(`./src/tunes/${key}.wav`);
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

// Função para exibir dinamicamente as notas
const displayTutorialNotes = (notes) => {
  notesDisplay.textContent = `Notas do Tutorial: ${notes.join(", ")}`;
};

// Função para tocar uma sequência no modo tutorial
const tutorialMode = () => {
  // Notas da sequência de tutorial em minúsculas
  const tutorialSequence = [
    "s",
    "s",
    "d",
    "s",
    "g",
    "t",
    "s",
    "s",
    "d",
    "s",
    "h",
    "g",
    "s",
    "s",
    "j",
    "g",
    "t",
    "d",
    "j",
    "k",
    "j",
    "g",
    "h",
    "g",
  ];

  // Tempo entre cada nota (em milissegundos)
  const timeBetweenNotes = 1000; // Ajuste o valor conforme necessário

  // Função para tocar uma única nota e avançar para a próxima
  const playNextNote = (index) => {
    if (index < tutorialSequence.length) {
      // Criando um novo objeto de áudio para cada nota
      const audioNote = new Audio(`./src/tunes/${tutorialSequence[index]}.wav`);
      audioNote.play();

      // Atualizando as notas no elemento de tutorial
      tutorialNotesElement.textContent = tutorialSequence[index];

      // Atualizando as notas dinamicamente
      displayTutorialNotes(tutorialSequence.slice(0, index + 1));

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
  const audio = new Audio(); // Criando um novo objeto de áudio
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

