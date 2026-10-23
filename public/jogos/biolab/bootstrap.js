import { obterSessao } from '../../js/services/autenticacao.js';
import { consultarAcessoJogos, acompanharAcessoJogos } from '../../js/services/jogos-acesso.js';
const session = obterSessao();
if (!session || session.usuario.role !== 'aluno') {
  location.replace(new URL('../../../auth/login.html', import.meta.url));
} else if (!(await consultarAcessoJogos()).liberado) {
 document.body.textContent='Jogos indisponíveis para esta turma. Volte à trilha.';
} else {
  acompanharAcessoJogos(state=>{if(!state.liberado)location.replace(new URL('../../../aluno/jogos/index.html',import.meta.url));});
  window.ASTROLEARN_GAME_STORAGE_KEY = 'astrolearn-biolab-v1:' + encodeURIComponent(session.usuario.id);
  for (const src of ['engine.js', 'app.js']) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(src, import.meta.url).href;
      script.onload = resolve; script.onerror = reject;
      document.body.append(script);
    }).catch(() => { document.body.textContent = 'Não foi possível carregar o BioLab. Recarregue a página.'; throw new Error('BioLab indisponível'); });
  }
}
