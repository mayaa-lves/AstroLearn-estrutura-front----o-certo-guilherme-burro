# AstroLearn — frontend completo

Frontend em **HTML, CSS e JavaScript**, sem framework e sem instalação de pacotes. Inclui a landing page, autenticação visual, todas as áreas do aluno e a estação do professor. As imagens e fontes locais foram preservadas.

## Abrir no VS Code

1. Extraia o ZIP e abra `AstroLearn-estrutura-front` no VS Code.
2. Clique com o botão direito em **index.html** e escolha **Open with Live Server / Go Live**.
3. A index é a landing page do projeto. Clique em **Explorar a plataforma** e escolha aluno ou professor, ou entre pelo login e use os links de prévia.
4. Mantenha a mesma origem e porta ao navegar para compartilhar os dados demonstrativos. Ctrl+Shift+R recarrega os estilos após alterações.

Alternativa: `npm start`. A conferência de sintaxe é `npm run check`. Não há etapa de build.

## Áreas implementadas

- **Landing:** apresentação STEAM, exemplos interativos, proposta para professores, perguntas frequentes e entrada nos dois perfis.
- **Autenticação visual:** login, cadastros de aluno/professor, recuperação e nova senha. Mascotes, olhos, proteção da senha, revelação, validação e redução de movimento.
- **Aluno:** início com trilha de planetas, atividade com anexos/revisão, conquistas, biblioteca, equipe, loja/oficina dos quatro avatares, perfil, configurações e jogos.
- **Jogos:** Rota do robô com três desafios, Quiz orbital com explicações, Cosmo Crew cooperativo por turnos no mesmo aparelho.
- **Professor:** galeria de turmas, detalhes da turma, desenvolvimento individual, atividades, criação/edição/publicação de proposta, materiais PDF/imagens, equipes, fila de entregas, correção com nota/devolutiva, perguntas e notificações.

## Testar aluno → professor

Use dados fictícios. A turma de exemplo é **3º P**, estudante **Maya**.

1. No aluno, abra uma atividade e escreva a resposta ou anexe um arquivo.
2. Abra a revisão e clique em **Confirmar entrega na prévia**. Se houver entrega anterior nessa atividade, o envio demonstrativo é substituído.
3. Entre na prévia do professor pelo login ou landing. Abra Notificações e a entrega, ou Turmas → 3º P → Correções.
4. Registre nota e devolutiva. Ao recarregar a atividade do aluno, o retorno aparece. Em outra aba da mesma origem, a alteração aparece automaticamente.
5. Perguntas da atividade seguem o mesmo ciclo: aluno pergunta, professor responde, aluno consulta o retorno.

Arquivos são guardados no IndexedDB; registros e preferências, no armazenamento local do navegador. Não existe comunicação entre computadores. Os exemplos sem anexos reais mostram materiais demonstrativos claramente identificados.

## Organização e manutenção

- `index.html`: landing page. CSS/JS em `public/css/pages/landing.css` e `public/js/pages/landing.js`.
- `auth/`, `aluno/`, `professor/`: páginas HTML.
- `public/css/`: estilos, navegação e preferências compartilhados, além dos estilos de cada área.
- `public/js/components/`: menus, upload, preferências, jogos e componentes compartilhados.
- `professor-dados.js`: fonte de dados **somente demonstrativa**; `professor-paginas.js`: renderização comum das telas do professor; `professor-notificacoes.js`: avisos; `atividade-demo.js`: ciclo local de entregas/perguntas.
- `public/js/services/`: estrutura reservada à integração futura; as telas desta entrega não chamam a API real.
- `public/assets/`: imagens originais, fonte e ícones locais.
- `docs/`: mapa de telas, código transcrito e relatório de integração para o backend.

## Limites desta entrega

É o frontend com interfaces e fluxos locais de demonstração. Login/cadastro não criam contas nem sessões; recuperação não envia e-mail. Notas, compras, XP, equipes e notificações são exemplos locais. O assistente usa orientações preparadas. Avatar é composição de imagens renderizadas em camadas/vistas, não um modelo 3D com rig. Cosmo Crew não sincroniza dispositivos.

Antes de usar com alunos reais, conectar as APIs e testar autorização, uploads privados, sessão, persistência e regras escolares. Nenhum backend foi alterado. Veja `docs/PENDENCIAS-BACKEND.md`.

## Acessibilidade

Links de pular conteúdo, rótulos de campos, mensagens de erro, foco visível, diálogos operáveis por teclado, tabelas com valores dos gráficos e navegação responsiva. Perfil/configurações ajustam texto e contraste; a redução de movimento do sistema tem prioridade. A landing tem botão para pausar animações. Esta entrega não equivale a uma auditoria formal de acessibilidade.
