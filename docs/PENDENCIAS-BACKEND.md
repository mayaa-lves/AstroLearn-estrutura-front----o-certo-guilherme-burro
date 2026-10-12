# Relatório de integração para o grupo do backend

Este documento acompanha o frontend por etapas. As interfaces já implementadas foram alinhadas ao PDF em 11/10/2026; continuam sem integração real. Nenhuma mudança de backend foi realizada nesta entrega. A análise usa o código local do repositório steam-project-backend disponível em 10/10/2026; ele inclui complementos de trabalhos anteriores. A presença no código local não comprova instalação no Render/Supabase. Confirmar com a pessoa responsável pelo backend antes de integrar.

## Contratos encontrados na base

| Tela/área           | Contrato identificado                                                                          | Trabalho do front / confirmação necessária                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Login               | POST `/api/auth/login` com `email` e `senha`                                                   | Implementar formulário, erros, sessão e destino pelo perfil confirmado                              |
| Cadastro            | POST `/api/auth/cadastro` com `nome`, `email`, `senha`, `role`; professor exige `chave_mestra` | Confirmar política docente e confirmação de e-mail; não embutir chave mestra no front               |
| Turmas e alunos     | `/api/professor/salas`, detalhes e matrícula; aluno POST `/api/aluno/entrar-sala`              | Confirmar campos, IDs e regras de matrícula                                                         |
| Inicial do aluno    | GET `/api/aluno/dashboard`                                                                     | Mapear períodos, missões, progresso e bloqueio da trilha                                            |
| Atividade do aluno  | GET `/api/aluno/missoes/:id`                                                                   | Mostrar orientação, estado, nota e devolutiva                                                       |
| Equipes             | Rotas de equipes/membros por sala                                                              | Confirmar onde vêm os dados da equipe do aluno e as regras por período                              |
| Correção e gráficos | Entregas, correção, pauta e desempenho consolidado                                             | Confirmar escala, pesos, campos ausentes e filtros; ausência de nota não é zero                     |
| Biblioteca          | Rotas docente e aluno de biblioteca                                                            | Mapear tipos de material e acesso privado                                                           |
| Avatar              | POST `/api/perfil/avatar`                                                                      | A rota de upload não demonstra persistência da montagem de partes; definir contrato de customização |

O formato usado na API é `{ success: true, data: ... }` ou `{ success: false, error: ... }`; autenticação usa `Authorization: Bearer TOKEN`. O helper do front está preparado para esse formato, mas ainda não é usado nas páginas.

## Complementos locais anteriores: confirmar implantação

| Recurso                             | Situação / contrato a conferir                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Upload e entrega privada            | Módulo `entregas.py` e migração 001; validar envio multipart, limites, texto, confirmação e links temporários |
| Materiais do professor              | `materiais_upload.py` e migração 002; validar upload/download privado e autorização                           |
| Perguntas e avisos                  | `comunicacao.py` e migração 003; confirmar consulta, resposta e leitura de avisos por usuário                 |
| Rascunho e publicação de atividades | `editor_atividades.py` e migração 004; confirmar capacidade, revisão, edição e publicação explícita           |

Esses complementos não estão incluídos no esqueleto entregue. O grupo do backend decide como incorporá-los ao seu repositório. Testar APIs e permissões com aluno/professor de salas diferentes. O front deverá mostrar falhas reais, sem apresentar operação não confirmada como concluída.

## Pontos sem contrato completo confirmado

1. **Recuperar senha:** combinar envio de e-mail, URL de retorno e atualização da senha. Não foi identificada rota Flask dedicada na base consultada; o grupo pode definir integração segura com Supabase Auth.
2. **Loja:** definir catálogo, saldo, compra transacional e inventário. Saldo/compra devem ser autorizados e gravados no servidor; não decidir no localStorage.
3. **Conquistas:** confirmar catálogo e conquistas obtidas, regras e progresso. Stickers cadastrados não bastam para assumir toda a regra da tela aprovada.
4. **Montagem do avatar:** definir personagem escolhido, peças liberadas, frente/costas e persistência da composição. Diferenciar isso de uma foto de perfil.
5. **Perfil/configurações:** confirmar leitura/atualização de dados. Preferências visuais podem ser locais; dados escolares pertencem à API.
6. **Assistente:** escolher entre dicas locais ou serviço de IA; definir limites/contexto antes de integrar. Não pressupor que o endpoint de gerar quiz seja um chatbot.
7. **Cosmo Crew:** definir sessão multiplayer e sincronização se o jogo for cooperativo entre PCs. São decisões futuras, não requisito para abrir o esqueleto.

## Combinações necessárias antes de cada integração

- URL da API e CORS para a origem do front local/publicado.
- Campos de entrada/saída, códigos de erro, limites de arquivos e estados de publicação/entrega.
- Estratégia de sessão/expiração, sem credenciais privadas no código do navegador.
- Regras de equipes: a base anterior usa entrega e nota individuais; entrega única coletiva exigiria outro contrato.
- Dados de teste em ambiente próprio; confirmar permissões no backend, não apenas ocultar botões no front.

Atualizar este relatório conforme cada tela for construída. Não é necessário implementar todos os pontos para começar o login.

## Complementação desta revisão do PDF — 11/10/2026

Nenhum contrato abaixo foi criado ou verificado novamente no servidor nesta revisão. São os dados que as interfaces entregues precisarão consumir; confirmar o que já existe antes de alterar o backend.

| Interface atual       | Dados/ação a conectar                                                       | Comportamento atual do front                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro de professor | Escola e autorização docente, além de nome/e-mail/senha                     | Escola aparece como no PDF; chave preservada em “Autorização da escola”. Nada é enviado ou verificado remotamente. Confirmar se escola é texto ou ID. |
| Cadastro de aluno     | Código da turma e matrícula, se informado                                   | O código é um campo opcional; não cria matrícula automaticamente.                                                                                     |
| Trilha                | IDs, ordem, disponibilidade e progresso da conta                            | Sequência demonstrativa. O bloqueio visual não substitui autorização da API.                                                                          |
| Conquistas            | Catálogo, critérios e eventos de obtenção                                   | Seis exemplos, três obtidos; os números não vêm das entregas.                                                                                         |
| Oficina/loja          | Catálogo de peças por personagem, inventário, saldo e montagem salva        | Estado local versionado com personagem, tronco, pernas e acessório. Confirmar compra e salvar composição no servidor antes de atualizar a conta real. |
| Biblioteca            | Materiais autorizados da turma; favoritos e leitura por usuário se desejado | Seis leituras introdutórias, favoritos e histórico locais. Marcar como lido não conclui uma missão.                                                   |
| Equipe                | Equipe do aluno, integrantes, missão, responsabilidades e mural             | Integrantes de exemplo; tarefas/mural ficam só neste navegador e não são compartilhados.                                                              |
| Atividade             | Texto, anexos privados, estado de entrega, recibo e retorno da correção     | Seleção de até 10 arquivos, 20 MB cada, 50 MB total. Revisão local sem upload. Confirmar limites com a API e validar conteúdo no servidor.            |
| Assistente            | Serviço de ajuda/IA, caso o grupo escolha essa integração                   | Respostas preparadas e identificadas como demonstração.                                                                                               |

A fonte e as imagens são locais. Não é necessário modificar o backend para visualizar o design com Go Live. Conectar cada área em uma etapa própria, substituindo os exemplos apenas quando a API confirmar as operações.

## Complementos para as telas finais do aluno

Esta seção especifica a integração necessária, sem criar endpoints ou pressupor que faltem no backend atual.

| Tela              | Confirmar com o responsável pelo backend                                                                                               | Comportamento desta entrega                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Perfil            | Dados do aluno autenticado; nome permitido; turma/equipe; atualização do nome                                                          | `astrolearn-display-name-v1` guarda um nome demonstrativo. Turma e equipe continuam exemplos.                                                                                    |
| Configurações     | Se preferências devem acompanhar o usuário em outros aparelhos; leitura/escrita por conta                                              | `astrolearn-preferences-v1` guarda animações, tamanho do texto e contraste neste navegador.                                                                                      |
| Recuperação       | Solicitação sem revelar existência da conta; envio de e-mail; token de uso único, validade e limites                                   | Formulário valida o e-mail, informa que nada foi enviado e permite testar a tela seguinte.                                                                                       |
| Nova senha        | Validação do token; regras de senha do projeto; alteração segura; resposta de token expirado/usado                                     | Formulário disponível em modo `?demo=1`. Esse parâmetro não é autenticação. Senhas não são gravadas.                                                                             |
| Jogos individuais | Se o professor terá acesso ao progresso; esquema de resultados por jogo/versão; quais eventos dão conquistas                           | Resultados sanitizados ficam em `astrolearn-games-v1`; nenhum jogo altera moedas, notas ou trilha.                                                                               |
| Cosmo Crew        | Serviço de sala/sessão; até 4 participantes autenticados; atribuição de funções; eventos sincronizados; saída e reconexão; autorização | Quatro funções por turnos no mesmo aparelho. Não há sala real, convite, WebSocket ou comunicação entre computadores.                                                             |
| Oficina/avatar    | Catálogo, composição autorizada e renderização das partes/vistas por personagem                                                        | A oficina salva o visual local. O avatar da inicial continua o render aprovado da referência; a sincronização visual da composição entre oficina e inicial não foi implementada. |

Na integração do frontend, substituir os fluxos de prévia por chamadas da pasta `public/js/services/`. Só navegar após login quando a API confirmar a sessão. Só mostrar envio de recuperação, alteração de senha, upload, compra ou matrícula depois da confirmação real do servidor. Não usar os valores locais de progresso/saldo como autorização.

Prioridade para o grupo: login/cadastro e sessão → dados do aluno/turma → atividades/anexos/correção → perfil/inventário/preferências → resultados dos jogos e multiplayer.

## Frontend completo — landing e estação do professor

A index agora apresenta o projeto. As onze telas do professor e o ciclo aluno → entrega/pergunta → aviso → correção/resposta estão implementados **somente como demonstração no mesmo navegador**. Não foram chamadas APIs reais nesta revisão.

| Área                | Conectar / confirmar com o backend                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Turmas e períodos   | Lista do professor autenticado, criação, código de matrícula, períodos e alunos autorizados                            |
| Desenvolvimento     | Notas registradas, pesos, escala de 0–10, estados sem nota, séries dos gráficos e filtros                              |
| Editor de atividade | Rascunho/publicação, revisões para concorrência, prazo, formato e limite por período                                   |
| Materiais           | Upload multipart, exclusão autorizada, limite/extensões e URLs temporárias privadas                                    |
| Equipes             | Um aluno por equipe no período, capacidade acordada e permissão do professor                                           |
| Entregas            | Resposta, anexos privados, estados, política de reenvio e histórico. A prévia substitui o envio demonstrativo anterior |
| Correção            | Nota 0–10, devolutiva, confirmação e atualização das médias; definir edição de correção                                |
| Perguntas/avisos    | Criar/responder, listar por usuário, marcar leitura; definir consulta periódica ou canal de eventos                    |

A demonstração usa `astrolearn-professor-v2` e IndexedDB `astrolearn-teacher-files`. Esses dados locais não devem migrar automaticamente para registros escolares. O aluno da simulação é Maya (`a00`, turma `s0`); são IDs fictícios.

O front limita materiais docentes a 10 arquivos, 20 MB cada e 50 MB por atividade, e equipes a quatro integrantes. São valores da interface demonstrativa: confirmar e repetir a validação no servidor. A API deve autorizar cada operação pelo usuário autenticado, independentemente dos IDs na URL.

Não embutir chave mestra, service key nem credenciais no código público. Entregar erros reais e confirmar a operação antes de mostrar sucesso. Após integração, validar com professor/aluno de salas diferentes e mais de um aparelho.
