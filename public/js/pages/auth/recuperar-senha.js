// O backend atual ainda não tem recuperação de senha.
(() => {
  const $ = id => document.getElementById(id);

  $('recoveryForm').hidden = true;
  $('recoveryResult').hidden = false;

  $('recoveryResult').querySelector('h2').textContent =
    'Recuperação ainda indisponível';

  $('recoveryResult').querySelector('p').textContent =
    'O backend ainda precisa implementar o envio do link de recuperação. Por enquanto, procure o responsável pela plataforma.';

  const link = $('recoveryResult').querySelector('a');
  link.href = 'login.html';
  link.textContent = 'Voltar ao login';

  $('tryAgain').hidden = true;

  document.querySelector('.intro').textContent =
    'Vamos ajudar você a recuperar o acesso.';

  document.querySelector('.stage-note').textContent =
    'Nenhum e-mail de recuperação é enviado nesta etapa.';
})();