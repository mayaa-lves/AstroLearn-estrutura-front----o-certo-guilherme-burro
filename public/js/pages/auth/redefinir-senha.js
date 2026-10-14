// Nunca altera uma senha sem uma operação confirmada no backend.
(() => {
  const $ = id => document.getElementById(id);

  $('resetForm').reset();
  $('resetForm').hidden = true;
  $('resetResult').hidden = true;
  $('invalidLink').hidden = false;

  $('invalidLink').querySelector('h2').textContent =
    'Redefinição ainda indisponível';

  $('invalidLink').querySelector('p').textContent =
    'O backend precisa validar o link de recuperação e atualizar a senha. Nenhuma senha é alterada por esta tela por enquanto.';

  document.querySelector('.intro').textContent =
    'A redefinição será liberada quando a recuperação de conta estiver integrada.';

  document.querySelector('.stage-note').textContent =
    'Precisa de acesso agora? Procure o responsável pela plataforma.';
})();