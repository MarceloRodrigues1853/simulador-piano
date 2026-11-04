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

Nesta evolução local, o tutorial oferece duas melodias originais curtas: **Pequeno passeio** (8 toques, A/S/D) e **Pergunta e resposta** (12 toques, A/S/D/G). Escolha uma no seletor, ou mantenha a sequência anterior de 24 toques. Primeiro ouça, depois reproduza a mesma sequência. O resultado identifica a melodia e informa seus erros; recomeçar zera a tentativa. Trocar de sequência interrompe o modo ativo antes de iniciar outro conteúdo.

Essas duas melodias foram criadas para os exercícios deste projeto; não são adaptações de repertório popular. Sua inclusão e o seletor ainda aguardam revisão local e publicação.

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

Os atalhos continuam representados por letras do computador. Os nomes musicais foram adicionados separadamente e as cores corrigidas com base na análise de frequência dos WAVs. A análise não substitui conferência auditiva da afinação. O projeto ainda não ensina técnica de piano ou leitura de partitura e não avalia ritmo. Não há pontuação, catálogo amplo, conta ou progresso salvo.

Próximas possibilidades estão descritas em [Escopo do tutorial](ESCOPO-TUTORIAL.md), separadas do que já está implementado. A evolução será feita em pequenos marcos, com revisão local antes da publicação.

## Autoria e créditos

Desenvolvimento e evolução: **Marcelo Rodrigues** ([MarceloRodrigues1853](https://github.com/MarceloRodrigues1853)).

Projeto originado no desafio educacional da **Digital Innovation One (DIO)**. Agradecimentos ao instrutor **Felipe Silva Aguiar** ([felipeAguiarCode](https://github.com/felipeAguiarCode)) e às contribuições da comunidade. Os créditos de origem permanecem preservados.


## Evolução local: nomes de notas e repertório inicial

Os nomes Dó/Ré/Mi/Fá/Sol/Lá/Si aparecem acima dos atalhos, com indicação de oitava e sustenido (♯). A faixa guiada também mostra nota e atalho. Ocultar atalhos mantém os nomes das notas visíveis. As cores foram corrigidas para corresponder às alturas estimadas dos WAVs, sem trocar os arquivos ou os atalhos. Esta interface é um guia de notas, não uma partitura em pauta.

Duas opções instrumentais didáticas, sem letras ou gravações externas, foram acrescentadas:

- **Feliz aniversário:** adaptação monofônica da melodia de Mildred J. Hill, publicada em Good Morning to All (1893), transposta para caber no teclado. 25 toques; preserva repetições, saltos e durações relativas básicas. A sequência antiga foi mantida separadamente como exemplo legado, não como versão musical conferida.
- **Jingle Bells — início do refrão:** trecho de 11 toques da composição de James Lord Pierpont (1857), com adaptação didática própria e durações relativas. Não é a música inteira nem a letra da versão brasileira.

As demonstrações usam uma unidade de tempo de 750 ms; a prática espera o acerto sem avaliar ritmo. Repertório e identificação sonora ainda aguardam revisão auditiva local antes de publicação.

Fontes de autoria e origem: [Copyright Office — origem da melodia de aniversário](https://www.copyright.gov/history/lore/pdfs/201004%20CLore_April2010.pdf) e [Library of Congress — The One Horse Open Sleigh (1857)](https://www.loc.gov/item/2023812429/). Não foram copiados arranjos modernos, letras ou gravações dessas fontes.
