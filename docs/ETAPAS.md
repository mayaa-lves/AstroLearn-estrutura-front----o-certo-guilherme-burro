> Atualização: as interfaces e interações locais dessas etapas estão implementadas. A sequência abaixo permanece como roteiro para a integração por partes.

# Construir por partes

1. **Login:** inserir a composição aprovada, imagens, formulário, olhar/piscada do mascote, senha e foguete; depois conectar o login real.
2. **Cadastros:** aluno e professor, regras de confirmação e tratamento de erros.
3. **Inicial do aluno:** menu reutilizável, trilha, planetas e avatar; depois dados reais.
4. **Atividade:** orientação, anexos, envio e devolutiva; confirmar o contrato com o grupo do backend.
5. **Áreas do aluno:** conquistas, loja, equipe, biblioteca, perfil e configurações, uma de cada vez.
6. **Professor:** turmas, dados, atividades, equipes, correções e perguntas, em telas separadas.
7. **Jogos e revisão:** construir o minijogo como módulo próprio; revisar mobile, teclado, contraste e movimento reduzido.

Para cada tela: construir HTML → CSS → interações → integração → validar. O grupo pode trabalhar em áreas diferentes, mas alterações em global.css, config.js e componentes compartilhados devem ser combinadas.
