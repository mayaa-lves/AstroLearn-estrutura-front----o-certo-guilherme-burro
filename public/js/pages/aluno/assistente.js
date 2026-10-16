const messages = document.getElementById("helpMessages");
const input = document.getElementById("helpInput");
function reply(text) {
  const question = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/arquivo|anex|foto|envi|entreg/.test(question))
    return "Abra a atividade pela trilha e vá até “Sua entrega”. Escolha um arquivo de até 20 MB e clique em “Enviar atividade”. Espere a confirmação do servidor antes de sair. Para vários documentos, você pode reunir tudo em um ZIP. A resposta escrita ainda não é enviada.";
  if (/bloque|cadeado/.test(question))
    return "Uma missão bloqueada depende do avanço nas etapas anteriores. Consulte a situação da atividade anterior e o retorno do professor. Se a trilha e a atividade mostrarem permissões diferentes, peça ao professor para conferir sua validação.";
  if (/biblioteca|material|leitura/.test(question))
    return "Os materiais estão na Biblioteca do menu. Você pode buscar pelo título ou pela descrição. A própria atividade também mostra os materiais vinculados a ela. Se não encontrar um material, confira com seu professor se ele foi compartilhado na sua turma.";
  if (/equipe|colega|grupo/.test(question))
    return "Abra “Minha equipe” para ver os integrantes cadastrados pelo professor. As tarefas e o mural compartilhado ainda estão em preparação. Combine as responsabilidades com seu grupo pelo meio indicado pelo professor.";
  if (/senha|conta|perfil/.test(question))
    return "No Perfil você encontra seus dados e as preferências de leitura, contraste e animações. A recuperação de senha depende da integração do servidor; se ela estiver indisponível, fale com o responsável pela plataforma.";
  if (/missao|comec|trilha|atividade/.test(question))
    return "No Início, clique no planeta disponível ou em “Continuar missão”. Leia as instruções, consulte os materiais e confira o prazo. Depois de realizar a atividade, envie sua entrega e acompanhe o retorno do professor.";
  if (/nota|correc|retorno/.test(question))
    return "O retorno fica na própria atividade. Quando seu professor corrigir, a nota e o comentário aparecerão ali. Uma atividade enviada pode continuar aguardando correção.";
  return "Posso orientar sobre missões, envio de arquivos, biblioteca, equipe e perfil. Para uma dúvida sobre o conteúdo da atividade, converse com seu professor. Não tenho acesso às respostas da sua pesquisa.";
}
function add(text, user = false) {
  const message = document.createElement("p");
  message.className = "help-message" + (user ? " user" : "");
  message.textContent = text;
  messages.append(message);
  while (messages.children.length > 60) messages.firstElementChild.remove();
  messages.scrollTop = messages.scrollHeight;
}
function ask(text) {
  if (!text.trim()) return;
  add(text, true);
  add(reply(text));
  input.value = "";
}
document.getElementById("helpForm").onsubmit = (event) => {
  event.preventDefault();
  ask(input.value.slice(0, 500));
  input.focus();
};
document
  .querySelectorAll("[data-topic]")
  .forEach((button) => (button.onclick = () => ask(button.textContent)));
