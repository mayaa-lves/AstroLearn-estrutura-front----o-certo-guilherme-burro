# Verificação do frontend completo — 11/10/2026

Conferência em Chromium automatizado e inspeção visual de telas selecionadas. Não é uma auditoria formal nem validação de integração com a escola.

- Sintaxe: 60 arquivos JavaScript/CJS.
- Referências de HTML e imagens/fontes CSS: sem caminhos locais ausentes.
- 45 combinações de páginas/tamanhos (1440, 1366 e 390 px): sem erros JavaScript, respostas 404 ou rolagem horizontal da página.
- Dez fluxos funcionais: landing/abas, rascunho com PDF persistido, publicação explícita, prévia docente somente leitura, pergunta/resposta, entrega com texto/anexo, correção/devolutiva, criação de turma/período/equipe, menus desktop/mobile e falha de armazenamento.
- Anexo da entrega baixado com nome original. Materiais docentes persistidos após recarga.
- Casos adicionais de texto 150%, contraste e movimento desativado nas telas do professor: sem rolagem horizontal global ou erros de script.
- A query de compatibilidade `conta=1` não ativa chamadas à API.
- 83 imagens originais preservadas byte a byte.

As telas do aluno e jogos mantêm as verificações da entrega anterior descritas em TELAS-ALUNO.md. Sessões, upload remoto, autorização e sincronização entre aparelhos dependem do backend e não foram testados aqui.
