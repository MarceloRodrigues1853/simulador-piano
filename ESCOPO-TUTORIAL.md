# Evolução do tutorial: tocar junto

Status: exercício mínimo preparado localmente; demais etapas planejadas. Revisão visual e sonora pendente.

## Recorte atual

- Exercício próprio de coordenação com oito toques: A S D T T D S A.
- Faixa acima do piano com a tecla esperada e até três próximas teclas.
- Avança somente ao tocar a tecla esperada; notas diferentes não penalizam.
- Erros destacam em vermelho a tecla tocada e explicam a tecla esperada em texto; o passo não avança.
- Após ouvir os 24 toques, a demonstração passa automaticamente à prática da mesma sequência, com espera por acerto e feedback de erro.
- Demonstração com faixa de próximas teclas e intervalo de 0,75 segundo.
- É possível acompanhar a demonstração tocando pelo teclado, mouse ou toque, sem interromper ou adiantar seu andamento. Ela termina pelo botão, Esc, início do treino, saída da página, conclusão ou falha de áudio.
- Conclusão com parabéns e quantidade de erros da tentativa, com zero, singular e plural. A contagem começa novamente a cada início e só considera a etapa de prática.
- Sem cronômetro, pontuação, cadastro ou persistência. Encerrar, Esc, trocar de modo ou sair da página interrompe; começar novamente volta ao primeiro toque.
- Mantida a sequência da demonstração automática anterior como recurso separado, agora mais lenta e com faixa visual. A pausa com retomada e o ajuste de velocidade continuam futuros.
- Letras representam atalhos. O exercício ainda não ensina nomes de notas, técnica de piano ou leitura musical.

## Direção do projeto

Evoluir como jogo educativo de autoria de Marcelo Rodrigues, preservando os créditos do desafio DIO e dos recursos utilizados. Construir pequenos desafios que incentivem prática e exploração, com identidade visual própria. Uma futura plataforma pode reunir os jogos, mas cada jogo continua com repositório e histórico próprios; o portfólio fica fora deste trabalho.

Recomendação de evolução, sem implementar nesta etapa:

1. Validar o exercício mínimo com uso real.
2. Acrescentar desafios e pontuação com regras transparentes; separar prática livre de desafios de ritmo para não penalizar quem aprende devagar.
3. Salvar preferências, exercícios concluídos e melhores resultados no navegador com `localStorage`, sem nome, e-mail ou envio desse progresso a um servidor. Oferecer apagar progresso e, se necessário, exportar/importar um arquivo.
4. Considerar conta opcional apenas se houver demanda por sincronizar dispositivos ou recuperar progresso. Hospedagem por si só não fornece contas: autenticação, banco de dados e manutenção seriam uma decisão separada.

O armazenamento local persiste entre sessões, mas pode ser apagado pelo usuário, bloqueado pelo navegador e não sincroniza automaticamente entre dispositivos. Resultados locais são editáveis e não devem sustentar ranking competitivo confiável. Em arquivos abertos por `file://`, o comportamento não é garantido; validar a futura persistência em HTTP/HTTPS. Não chamar esse recurso de cache.

Referência técnica: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Objetivo

Permitir que uma pessoa iniciante acompanhe uma sequência musical visualmente e pratique sem pressa. Preservar o modo de tocar livremente e a personalidade do piano.

## Experiência proposta

- Uma faixa acima do teclado mostra a indicação atual e algumas próximas indicações. Não cobre as teclas nem os controles.
- Cada indicação mostra a letra do teclado; o nome musical da nota pode aparecer junto, depois de conferir a afinação dos arquivos de áudio. Letras de atalhos e nomes de notas devem ser claramente diferenciados.
- A indicação atual fica destacada e a tecla correspondente acende. As indicações anteriores saem da faixa conforme a sequência avança.
- Em telas pequenas, a faixa mostra menos indicações, mantendo a atual legível. Ela acompanha o teclado sem exigir precisão em alvos pequenos.
- Apresentar inicialmente como guia de notas. Uma partitura musical tradicional, com pauta e duração das notas, é uma evolução separada.

## Primeiro marco recomendado

Uma sequência curta de exercício, com autoria e origem identificadas, para validar o acompanhamento antes de montar um catálogo.

1. Modo **Ouvir**: demonstração automática, com andamento lento por padrão e opção de velocidade.
2. Modo **Praticar**: aguarda a pessoa tocar a tecla esperada para avançar. Uma tecla diferente pode soar livremente, mas não avança a sequência; a indicação continua disponível, sem penalidade.
3. Iniciar, pausar, continuar e recomeçar com comportamento previsível; ao pausar, suspender som e avanço. Esc interrompe e sair da página também interrompe.
4. Indicar o progresso e terminar com uma mensagem que convida a repetir ou voltar ao piano livre.
5. Volume e silêncio continuam funcionando nos dois modos.

O modo de prática sem limite de tempo deve ser o primeiro: a pessoa aprende as teclas antes de precisar acompanhar um ritmo.

## Preparação para músicas futuras

Manter o conteúdo musical separado da lógica de reprodução. Cada exercício ou música deve poder registrar:

- Identificador, título, autoria, fonte e informação de permissão de uso.
- Andamento de referência e uma sequência ordenada de eventos.
- Para cada evento: tecla, duração em tempos e eventual pausa. Nome da nota e oitava somente após validar os sons disponíveis.
- Frases ou pequenos trechos opcionais, associados a intervalos de eventos, para futuro acompanhamento com letra.

A letra de uma música, quando disponível para uso, aparece numa linha própria junto à faixa; o trecho atual fica destacado. Não colocar frases sobre as teclas. Não incluir letras nem um catálogo nesta etapa de escopo.

Começar por exercícios próprios ou conteúdo com uso permitido e créditos registrados. Antes de selecionar repertório, conferir se a extensão do teclado e os áudios permitem tocar o arranjo corretamente.

## Etapas posteriores

- Pequena lista de músicas com indicação de dificuldade e seleção de trecho para repetir.
- Notas com duração visual e acompanhamento de ritmo, mantendo o modo sem pressão de tempo.
- Letra sincronizada por frase, quando aplicável.
- Partitura tradicional e acordes, após validar a necessidade e o suporte do instrumento.

Não fazem parte do primeiro marco: contas, ranking, backend, reconhecimento por microfone ou avaliação automática de desempenho musical.

## Acessibilidade e critérios de revisão

- Operar todos os controles com teclado e toque, com foco visível.
- Distinguir a indicação atual por texto e forma, além de cor.
- Com movimento reduzido, atualizar as indicações sem deslocamento ou desaparecimento animado.
- No modo Ouvir, evitar anúncios de leitor de tela a cada nota; anunciar início, pausa e conclusão. No modo Praticar, oferecer a indicação esperada em texto acessível.
- Confirmar que tocar a indicação correta avança uma única vez, inclusive em notas repetidas; segurar uma tecla não deve pular etapas.
- Conferir pausa, retomada, reinício, finalização e troca de modo sem temporizadores ou áudios sobrepostos.
- Validar uso em tela pequena e a relação entre a indicação visível e a tecla real.

## Entrega futura

Apresentar uma prévia local com um exercício funcionando, informar os testes realizados e limitações e revisar em conjunto antes de escolher mais músicas. Publicação e operações Git continuam dependendo de autorização específica.


## Progressão de fases proposta (futura)

Manter treino livre e repetição disponíveis, sem bloquear o aprendizado por erros. Cada fase deve ter uma habilidade clara, demonstração e desafio curto. A conclusão atual é um ponto de partida; as fases abaixo ainda não estão implementadas.

1. **Encontrar as teclas:** exercícios próprios curtos de coordenação, ampliando a sequência inicial e apresentando poucas teclas de cada vez.
2. **Conhecer as notas:** conferir afinação e oitavas dos arquivos; associar os atalhos às notas musicais reais. Começar com identificação visual; reconhecimento auditivo é um desafio separado, com alternativa visual.
3. **Sentir o tempo:** pulsação visual e sonora opcional, andamento ajustável e sequências com durações e pausas. Introduzir tolerância de tempo explícita e manter prática sem cronômetro.
4. **Tocar pequenas melodias:** escuta seguida de reprodução de frases, com repetição de trechos. Selecionar arranjos compatíveis com a extensão do instrumento.
5. **Explorar repertório:** organizar categorias futuras como folclore brasileiro, concerto/clássico, pop e rock. Verificar individualmente a composição, o arranjo e os recursos utilizados antes de incluí-los. Começar por exercícios próprios e repertório com permissão de uso confirmada, com créditos.
6. **Ler partitura:** introduzir pauta, clave, altura e duração gradualmente, oferecendo nomes das notas e atalhos como apoio opcional. Não apresentar apenas as letras do teclado como partitura.

Só depois de validar os desafios: pontos por conclusão e evolução pessoal, regras claras por modo e progresso local opcional. Nenhum ranking competitivo ou conta faz parte do MVP. Recompensar repetição e aprendizado, sem tratar os primeiros erros como fracasso.

## Comunicação no LinkedIn

Apresentar como evolução autoral de um projeto iniciado no desafio DIO, com créditos preservados. Destacar o ciclo ouvir, praticar, receber feedback e repetir, além dos testes automatizados. Distinguir melhorias locais de funcionalidades publicadas; anunciar fases, repertório e persistência como planos. Publicar capturas reais e o link atualizado somente após revisão e publicação autorizada. Não afirmar que o projeto já ensina piano completo ou leitura de partitura.
