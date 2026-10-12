# Mapa do frontend completo

| Entrada / página            | Arquivo                                               |
| --------------------------- | ----------------------------------------------------- |
| Apresentação do projeto     | index.html                                            |
| Login e escolha das prévias | auth/login.html                                       |
| Inicial do aluno            | aluno/home.html                                       |
| Atividade do aluno          | aluno/atividade.html                                  |
| Turmas do professor         | professor/home.html                                   |
| Turma e gráficos            | professor/turma.html?sala=s0                          |
| Aluno e desenvolvimento     | professor/aluno.html?sala=s0&aluno=a00                |
| Lista de atividades         | professor/atividades.html?sala=s0                     |
| Detalhe de atividade        | professor/atividade.html?sala=s0&atividade=m01        |
| Criar atividade             | professor/editor-atividade.html?sala=s0               |
| Editar atividade            | professor/editor-atividade.html?sala=s0&atividade=m01 |
| Equipes                     | professor/equipes.html?sala=s0                        |
| Fila de correções           | professor/correcoes.html?sala=s0                      |
| Correção individual         | professor/correcao.html?sala=s0&entrega=e002          |
| Perguntas                   | professor/perguntas.html?sala=s0                      |
| Avisos                      | professor/notificacoes.html                           |

Os scripts de professor em `public/js/pages/professor/` documentam cada entrada; a implementação comum está nos componentes `professor-*`, carregados pelo HTML. Editar a implementação compartilhada evita divergência entre telas.

## Persistência da prévia

`astrolearn-professor-v2` contém turmas/alunos/atividades/entregas/perguntas/avisos. IndexedDB `astrolearn-teacher-files`, store `files`, guarda materiais por atividade e anexos por entrega. Rascunhos de correção são guardados na sessão da aba. As preferências usam `astrolearn-preferences-v1`.

A limpeza de dados de aluno em Configurações preserva a estação do professor e seus anexos. Para reiniciar toda a simulação, use as ferramentas de desenvolvimento do navegador → Application/Armazenamento e exclua somente os dados da origem local do projeto. Isso apaga os exemplos e arquivos salvos; faça cópia do que quiser manter.

A autenticação visual e os links de prévia não restringem acesso. Conectar o backend é necessário antes de uso escolar real. A landing não apresenta métricas de impacto como resultados comprovados.
