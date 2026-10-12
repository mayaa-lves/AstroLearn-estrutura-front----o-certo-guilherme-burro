# Revisão do frontend conforme o PDF

Referência: `cadastro..pdf`, 50 páginas. Revisão de 11/10/2026. Foram ajustadas as páginas que já tinham interface no projeto recebido. Quando há várias versões, a composição final da seção orienta esta entrega; os dados demonstrativos continuam identificados como exemplos.

| Página implementada | Referência | Ajuste principal |
| --- | --- | --- |
| `auth/login.html` | Página 31 | Cenário e interações preservados; fonte local e ícone de e-mail alinhados à referência. |
| `auth/cadastro-aluno.html` | Páginas 5–7, composição do cadastro | Formulário completo à direita, mascote Turquesa, seleção do perfil, senha e confirmação juntas. |
| `auth/cadastro-professor.html` | Página 7 | Personagem aprovado de um olho, escola e formulário completo. A chave da integração anterior foi preservada em um campo recolhido de autorização. |
| `aluno/home.html` | Página 13 | Horizonte aprovado, boas-vindas, trilha vertical sob o título, planetas elaborados e avatar no vidro à direita. Imagens dos mundos bloqueados ocultas. |
| `aluno/atividade.html` | Página 15 | Banner com planeta, instruções/materiais/anotações à esquerda e entrega à direita. Uma única coluna de entrega, sem duplicar a sobreposição do print. |
| `aluno/biblioteca.html` | Páginas 17–18 | Cabeçalho, busca, filtros por assunto, destaque do Sistema Solar e cartões com imagens em paisagem. |
| `aluno/conquistas.html` | Páginas 20–21 | Contagem, próxima conquista com mascote dentro do destaque, filtros e coleção de medalhas. |
| `aluno/equipe.html` | Páginas 23–24 | Quatro retratos, missão coletiva, divisão de tarefas e mural. |
| `aluno/loja.html` | Páginas 26–27 | Oficina com quatro personagens, corpo neutro, peças por categoria e visual de frente/costas. |

## Interações preservadas ou adaptadas

- Login: pupila acompanha o cursor, piscada, privacidade ao focar senha, mostrar/ocultar senha, estrelas de curiosidade e foguete da prévia.
- Cadastros: olhos acompanham o cursor, pose de privacidade, senha revelável, dicas do mascote e mensagens de erro junto aos campos.
- Inicial: planetas com camadas suaves e foguete, curiosidades, satélite educativo, troca de vistas do avatar, reações e assistente local. O visualizador usa oito imagens renderizadas, não um modelo 3D contínuo.
- Menu: recolher deixa ícones; no celular, quatro atalhos e “Mais” dão acesso às nove áreas (incluindo jogos e configurações). A preferência de menu fica no navegador.
- Atividade: selecionar ou arrastar arquivos, validar limites, remover anexos e revisar texto/arquivos. A revisão não envia nem conclui uma missão.
- Conquistas: filtros, critérios e saudação do mascote.
- Biblioteca: busca, filtros, favoritos, leitura com pistas/fontes, marcação pessoal e download de roteiro TXT. O destaque vira “Continuar leitura” depois de abrir um material.
- Equipe: organização de tarefas e adição/remoção de ideias no mural local.
- Oficina: escolher personagem, experimentar peças, retirar peça, desfazer/refazer, frente/costas, confirmação de resgate demonstrativo e salvamento local.

## Arquivos compartilhados novos

`public/css/fonts.css`, `public/css/aluno-pdf.css`, `public/css/menu-pdf.css`, `public/js/components/menu-pdf.js`, `public/js/components/estrelas-pdf.js`, `public/js/components/estrelas-home.js` e `public/js/components/estrelas-atividade.js`.

A fonte local usada nas referências está em `public/assets/fontes/`. As imagens existentes foram mantidas; não é necessário substituir a pasta de imagens por outras ilustrações.

## Instalar a revisão

**Projeto completo:** extraia o ZIP em uma nova pasta, abra a pasta raiz no VS Code e inicie `auth/login.html` pelo Live Server.

**Somente alterações:** extraia o ZIP de ajustes e copie seu conteúdo para a pasta raiz do projeto recebido, mantendo as subpastas e substituindo os arquivos com o mesmo caminho. Inclua também os arquivos compartilhados e as fontes novas. Não copie apenas o HTML: cada tela depende do CSS e do JS correspondentes.

Os códigos completos dos arquivos alterados estão transcritos em `AstroLearn-codigos-completos.md`, com um bloco por caminho. Arquivos binários, como fontes, estão nos ZIPs.

## Limites desta etapa

O frontend continua independente da API. Não há autenticação real, envio ao professor, comunicação compartilhada de equipe, conquistas calculadas ou saldo real. Na primeira revisão do PDF, perfil e jogos permaneceram como estruturas. Eles foram implementados na entrega seguinte, junto com configurações e recuperação de senha; consulte `TELAS-ALUNO.md` para o estado atual. As telas do professor foram implementadas na entrega do frontend completo; consulte FRONTEND-COMPLETO.md. Os requisitos de integração estão em `PENDENCIAS-BACKEND.md`.


## Verificação da primeira revisão do PDF

- 45 verificações funcionais: seleção e montagem de personagem, resgate local sem desconto duplicado, filtros de conquistas, busca/favoritos/leitura, tarefas/mural, navegação, validação de cadastro e revisão/remoção de anexos.
- Nove telas abertas em Chromium nos tamanhos 1440×810, 1366×768 e 390×844: 27 cenários sem erro de JavaScript, recurso ausente ou rolagem horizontal.
- Login e ambos os cadastros sem rolagem nas duas resoluções de computador verificadas. O conteúdo continua acessível com rolagem em telas menores, sem cortar os botões.
- `npm run check`: sintaxe conferida nos 47 arquivos JS do projeto.
- Imagens do ZIP recebido comparadas por hash: todas preservadas.

Esta revisão foi verificada como frontend local. Integração e permissões do backend não foram testadas nesta etapa.
