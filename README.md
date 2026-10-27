# Simulador de Piano

Piano virtual desenvolvido por **Marcelo Rodrigues**, a partir de um desafio da **Digital Innovation One (DIO)**. A proposta é evoluir a exploração de sons em pequenos exercícios educativos, para aprender brincando e praticar no próprio ritmo.

## Acessar

[Demo no GitHub Pages](https://marcelorodrigues1853.github.io/simulador-piano/)

As melhorias descritas neste marco estão em revisão local e ainda não foram publicadas na demo.

## Executar localmente

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências ou compilar o projeto. Os sons são arquivos WAV incluídos em `src/tunes`.

Alternativamente, se já tiver Python instalado, execute na pasta do projeto:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Depois abra `http://127.0.0.1:8765`. Para encerrar o servidor, use Ctrl+C no terminal.

## Controles e modos

- **Piano livre:** clique, toque ou use as letras A W S E D F T G Y H U J K O L P e ponto e vírgula.
- **Teclado acessível:** Tab navega pelos controles; Enter e Espaço acionam a tecla em foco. O foco fica visível.
- **Volume e silêncio:** ajuste o volume ou use Silenciar, inclusive durante o tutorial.
- **Treino — Primeiros passos:** exercício próprio de oito toques: A S D T T D S A. A faixa mostra a indicação atual e até três seguintes. O treino espera a tecla correta; um erro destaca a tecla tocada em vermelho e informa qual era a esperada, sem penalidade. Ao acertar, o exercício avança.
- **Tutorial — Ouça primeiro, depois toque:** reproduz os 24 toques da sequência de exemplo com intervalo de 0,75 segundo. Ao terminar, passa automaticamente à prática: mostra a tecla esperada e até três seguintes, espera o acerto e indica erros em vermelho e texto. Durante a escuta, tocar manualmente não interrompe a demonstração. Iniciar o treino encerra o tutorial.
- **Parar e recomeçar:** use o botão do modo ativo ou Esc. Ao sair da página, o som e o modo ativo são interrompidos. Um novo início volta ao primeiro passo.
- **Telas pequenas:** deslize horizontalmente o teclado. As indicações não dependem de animação e o estilo respeita movimento reduzido.

Ao concluir o treino ou a prática do tutorial, uma mensagem de parabéns informa o número de erros (ou que não houve nenhum). A contagem vale apenas para a tentativa atual e é zerada ao recomeçar; tocar durante a escuta não conta como erro. Ainda não é um sistema de pontuação.

## Tecnologias e estrutura

HTML, CSS e JavaScript, sem framework ou dependências externas de execução.

- `index.html`: interface e controles.
- `src/scripts/engine.js`: reprodução, treino e tutorial.
- `src/styles/`: aparência, responsividade e foco.
- `src/tunes/`: sons das teclas.
- `verify.cjs`: verificações locais da lógica, usando apenas recursos nativos do Node.js.
- `tests/tutorial.test.cjs`: testes de regressão do acompanhamento e encerramento do tutorial, com o executor nativo do Node.js.
- `ESCOPO-TUTORIAL.md`: decisões, limites e ideias futuras. Faz parte da documentação versionável.
- `DOCS.md`: documentação histórica da versão inicial; seus exemplos de código não representam a implementação atual.

## Validação

Se já tiver Node.js instalado, execute na pasta do projeto:

```sh
node --check src/scripts/engine.js
node verify.cjs
node --test tests/tutorial.test.cjs
```

As verificações simulam a página, o áudio e os temporizadores. Cobrem volume, silêncio, início e parada dos modos, progressão do treino e tratamento de erros. Não substituem a revisão visual, sonora, com leitor de tela ou em dispositivo de toque real.

## Limitações e próximos passos

As letras são atalhos de teclado, não nomes musicais. O exercício inicial trabalha coordenação; não ensina técnica de piano, partitura ou ritmo. Não há pontuação, catálogo de músicas, conta ou progresso salvo. A afinação dos sons ainda precisa ser conferida antes de ensinar notas musicais.

Próximas possibilidades estão descritas em [Escopo do tutorial](ESCOPO-TUTORIAL.md), separadas do que já está implementado. A evolução será feita em pequenos marcos, com revisão local antes da publicação.

## Autoria e créditos

Desenvolvimento e evolução: **Marcelo Rodrigues** ([MarceloRodrigues1853](https://github.com/MarceloRodrigues1853)).

Projeto originado no desafio educacional da **Digital Innovation One (DIO)**. Agradecimentos ao instrutor **Felipe Silva Aguiar** ([felipeAguiarCode](https://github.com/felipeAguiarCode)) e às contribuições da comunidade. Os créditos de origem permanecem preservados.
