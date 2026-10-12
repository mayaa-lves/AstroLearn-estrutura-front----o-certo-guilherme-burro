# Telas do aluno — entrega do frontend

As interfaces do aluno estão montadas em HTML/CSS/JavaScript para Go Live. Dados escolares continuam de exemplo. A parte do professor e a conexão com a API são etapas separadas.

## Mapa dos novos arquivos

| Tela | HTML | CSS da página | JS da página |
| --- | --- | --- | --- |
| Perfil | `aluno/perfil.html` | `public/css/pages/aluno/perfil.css` | `public/js/pages/aluno/perfil.js` |
| Configurações | `aluno/configuracoes.html` | `public/css/pages/aluno/configuracoes.css` | `public/js/pages/aluno/configuracoes.js` |
| Recuperação | `auth/recuperar-senha.html` | `public/css/pages/auth/recuperar-senha.css` | `public/js/pages/auth/recuperar-senha.js` |
| Nova senha | `auth/redefinir-senha.html?demo=1` | usa o CSS da recuperação | `public/js/pages/auth/redefinir-senha.js` |
| Laboratório | `aluno/jogos/index.html` | `public/css/pages/aluno/jogos/index.css` | `public/js/pages/aluno/jogos/index.js` |
| Rota do robô | `aluno/jogos/robo-rota.html` | `public/css/pages/aluno/jogos/robo-rota.css` | `public/js/pages/aluno/jogos/robo-rota.js` |
| Quiz orbital | `aluno/jogos/quiz-orbital.html` | `public/css/pages/aluno/jogos/quiz-orbital.css` | `public/js/pages/aluno/jogos/quiz-orbital.js` |
| Cosmo Crew | `aluno/jogos/cosmo-crew.html` | `public/css/pages/aluno/jogos/cosmo-crew.css` | `public/js/pages/aluno/jogos/cosmo-crew.js` |

O CSS `public/css/pages/aluno/jogos/jogo.css` é compartilhado pelos três jogos. `extra.css` define controles e cards comuns das novas páginas. O perfil segue a página 29 do PDF. As páginas adicionais que não tinham referência no PDF usam a mesma fonte local, cores, menu flutuante e linguagem de cards.

## Componentes compartilhados

- `menu-pdf.js`: nove destinos, menu recolhível no computador e “Mais” no celular. `data-base="../"` ajusta links nas páginas dentro de `aluno/jogos/`.
- `preferencias.js` e `preferencias.css`: aumento do texto, contraste e redução de movimento, inclusive nos cards inseridos depois por JavaScript. O aparelho tem prioridade quando solicita menos movimento.
- `identidade.js`: nome de exibição na inicial/configurações. Não altera a matrícula ou dados reais.
- `jogos.js`: diálogos e progresso local, independente de conquistas e moedas.

## Instalação

**Projeto completo:** extraia o ZIP e abra a pasta `AstroLearn-estrutura-front` no VS Code. Abra `index.html` com Live Server e use **Explorar a plataforma** → Aluno.

**Só os ajustes:** extraia o ZIP de ajustes sobre a raiz da pasta anterior, onde ficam `auth`, `aluno`, `public` e `docs`. Ele contém somente arquivos novos/alterados e depende das imagens e dos demais arquivos do projeto anterior.

Use Ctrl+Shift+R depois de substituir os arquivos. Continue na mesma porta do Live Server para manter os dados locais. `npm start` é opcional; não há instalação de dependências para o Go Live.

## Limites claros

Login/cadastro ainda não autenticam. Recuperação não envia e-mail. Nova senha não altera contas nem guarda o que foi digitado. Arquivos da atividade podem ser confirmados na demonstração local; não são enviados ao servidor. A biblioteca e os jogos usam conteúdo introdutório de exemplo. A equipe não compartilha o mural com outros computadores. O Cosmo Crew é uma demonstração por turnos, não multiplayer em rede. As vistas do avatar são imagens renderizadas, não um modelo WebGL 3D. Na oficina, o visual é local e não substitui automaticamente o avatar da inicial.

## Verificações

- Sintaxe JavaScript e referências locais de HTML/CSS.
- 17 páginas em três tamanhos: 1440×810, 1366×768 e 390×844, sem erros JavaScript, arquivos ausentes ou rolagem horizontal.
- Telas de autenticação sem scroll vertical nos dois tamanhos de computador testados, com texto em tamanho padrão.
- Nome salvo, preferências entre páginas, menu móvel, recuperação, confirmação da senha e ausência de armazenamento de senhas.
- Três rotas do robô concluídas; colisão e rota vazia; seis respostas do quiz e revisão; quatro funções do Cosmo Crew e tentativa incorreta.
- Limpeza de dados com confirmação e preservação de chaves externas ao projeto.
- Todas as 83 imagens originais preservadas; arquivos do professor mantidos.


## Atualização do frontend completo
A atividade agora permite confirmar uma entrega ou pergunta na demonstração local e consultar o retorno do professor na mesma origem. A resposta digitada sem confirmação permanece apenas na visita; entregas confirmadas e seus anexos são persistidos localmente. Não há envio à escola. Veja README.md para testar o ciclo.
