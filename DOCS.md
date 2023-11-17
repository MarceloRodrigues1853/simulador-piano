
# Documentação do Simulador de Piano

## Visão Geral

Este é um simulador de piano simples desenvolvido com HTML, CSS e JavaScript. Ele permite que os usuários toquem notas de piano, visualizem e interajam com o teclado. Além disso, apresenta um modo tutorial que ensina a sequência de notas.

## Estrutura do Código

### Seleção de Elementos HTML

```javascript
const pianoKeys = document.querySelectorAll(".piano-keys .key");
const volumeSlider = document.querySelector(".volume-slider input");
const keysCheck = document.querySelector(".keys-check input");
const tutorialNotesElement = document.getElementById("tutorialNotes");
const notesDisplay = document.createElement("div");
notesDisplay.id = "notesDisplay"; // Adiciona o id
document.body.appendChild(notesDisplay);
```

### Array de Teclas Mapeadas

```javascriptCopy code
let mappedKeys = [];
```

### Função `playTune(key)`

Toca uma nota quando chamada e adiciona/remove uma classe para efeito visual.

```javascriptCopy codeconst playTune = (key) => {
  // Código da função
};
```

### Função `tutorialMode()`

Define uma sequência de notas e toca cada nota com intervalos de tempo.

```javascriptCopy codeconst tutorialMode = () => {
  // Código da função
};
```

### Event Listeners

```javascriptCopy code// Adiciona ouvintes de eventos
tutorialButton.addEventListener("click", tutorialMode);
pianoKeys.forEach((key) => key.addEventListener("click", () => playTune(key.dataset.key)));
document.addEventListener("keydown", (e) => playTune(e.key));
volumeSlider.addEventListener("input", changeVolume);
keysCheck.addEventListener("click", showHideKeys);
```

### Funções para Alterar o Volume e Mostrar/Ocultar Teclas

```javascriptCopy codeconst changeVolume = (e) => {
  // Código da função
};

const showHideKeys = () => {
  // Código da função
};
```

## Como Jogar

1. Abra o simulador de piano no navegador.
2. Toque notas clicando nas teclas do piano ou use o teclado.
3. Experimente o modo tutorial clicando em "Modo Tutorial".
4. Ajuste o volume e a visualização das teclas conforme necessário.

## Contribuição

Sinta-se à vontade para contribuir! Faça um fork, implemente novos recursos, corrija bugs ou melhore a experiência do usuário.

## Autor

MarceloRodrigues1853
