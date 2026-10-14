import { cadastrar } from '../services/autenticacao.js';

export function conectarCadastro({ form, status, senhas, erro }) {
  const $ = id => document.getElementById(id);
  const professor = document.body.classList.contains('cadastro-professor');
  const botao = form.querySelector('[type="submit"]');
  const textoBotao = botao.textContent;
  const fieldset = $('dados-cadastro');

  let ocupado = false;
  let criado = false;
  let controle;
  let ativo = true;

  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const respeitarMovimento = () => {
    $('movimento').disabled = media.matches;
  };

  media.addEventListener('change', respeitarMovimento);
  respeitarMovimento();

  // A rota atual não grava escola nem vincula turma no cadastro.
  for (const [id, ajuda, texto] of [
    [
      'turma',
      'turma-ajuda',
      'O código será usado ao entrar na turma, depois do login.',
    ],
    [
      'escola',
      'escola-erro',
      'O backend ainda não registra a escola no cadastro.',
    ],
  ]) {
    const campo = $(id);
    if (!campo) continue;

    campo.required = false;
    campo.disabled = true;
    campo.placeholder = 'Vínculo escolar será configurado depois';
    campo.setAttribute('aria-describedby', ajuda);

    $(ajuda).hidden = false;
    $(ajuda).className = 'auth-help';
    $(ajuda).textContent = texto;
  }

  document.querySelector('.aviso-demo').textContent =
    'Cadastro conectado. Confirme seu e-mail, se solicitado, antes de entrar.';

  $('senha-ajuda').textContent = 'Use pelo menos 8 caracteres.';

  if (professor) {
    document.querySelector('.approval-note').textContent =
      'A chave de autorização será conferida pelo servidor.';
  }

  function mensagem(texto, falha = false) {
    status.setAttribute('role', falha ? 'alert' : 'status');
    status.setAttribute('aria-live', falha ? 'assertive' : 'polite');
    status.style.color = falha ? '#922342' : '#285b3c';
    status.textContent = texto;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (ocupado || criado) return;

    const nome = $('nome');
    const email = $('email');
    const [senha, confirmar] = senhas;
    const chave = $('chave');

    const checks = [
      [nome, nome.value.trim() ? '' : 'Informe seu nome.'],
      [
        email,
        email.value.trim() && email.validity.valid
          ? ''
          : 'Informe um e-mail válido.',
      ],
      [
        senha,
        senha.value.length >= 8 ? '' : 'Use pelo menos 8 caracteres.',
      ],
      [
        confirmar,
        confirmar.value && confirmar.value === senha.value
          ? ''
          : 'As senhas precisam ser iguais.',
      ],
    ];

    if (professor) {
      checks.push([
        chave,
        chave.value.trim()
          ? ''
          : 'Informe a chave fornecida pela coordenação.',
      ]);
    }

    let primeiro;

    checks.forEach(([campo, texto]) => {
      if (!erro(campo, texto) && !primeiro) primeiro = campo;
    });

    if (primeiro) {
      if (primeiro === chave) $('autorizacao').open = true;

      mensagem('Confira os campos destacados.', true);
      primeiro.focus();
      return;
    }

    const dados = {
      nome: nome.value,
      email: email.value,
      senha: senha.value,
      role: professor ? 'professor' : 'aluno',
      chave_mestra: professor ? chave.value : undefined,
    };

    ocupado = true;
    controle = new AbortController();
    fieldset.disabled = true;
    form.setAttribute('aria-busy', 'true');
    botao.textContent = 'Criando sua conta…';
    mensagem('Aguarde a confirmação do servidor…');

    try {
      await cadastrar(dados, { sinal: controle.signal });

      if (!ativo) return;

      criado = true;

      senhas.forEach(campo => {
        campo.value = '';
        campo.type = 'password';
      });

      if (chave) {
        chave.value = '';
        chave.type = 'password';
      }

      document.querySelectorAll('[data-senha]').forEach(b => {
        b.setAttribute('aria-pressed', 'false');
      });

      mensagem(
        'Cadastro confirmado pelo servidor. Confira seu e-mail para confirmar a conta e depois entre na plataforma.'
      );

      const link = document.createElement('a');
      link.href = 'login.html';
      link.textContent = ' Ir para o login →';
      status.append(link);
      status.tabIndex = -1;
      status.focus();

      botao.textContent = 'Cadastro realizado';
    } catch (e) {
      if (!ativo) return;

      mensagem(
        e.status === 403 && professor
          ? 'A autorização foi recusada. Confira a chave com a coordenação.'
          : e.message || 'Não foi possível cadastrar. Tente novamente.',
        true
      );

      if (e.status === 403 && professor) {
        $('autorizacao').open = true;
      }
    } finally {
      ocupado = false;
      controle = null;
      form.setAttribute('aria-busy', 'false');

      if (!criado && ativo) {
        fieldset.disabled = false;
        botao.textContent = textoBotao;
      }
    }
  });

  form.addEventListener('input', event => {
    if (ocupado || criado) return;

    if ($(event.target.id + '-erro')) erro(event.target, '');
    status.textContent = '';
  });

  window.addEventListener('pagehide', () => {
    ativo = false;
    controle?.abort();
  });

  window.addEventListener('pageshow', e => {
    ativo = true;

    if (e.persisted && !criado) {
      ocupado = false;
      fieldset.disabled = false;
      form.setAttribute('aria-busy', 'false');
      botao.textContent = textoBotao;
    }
  });
}