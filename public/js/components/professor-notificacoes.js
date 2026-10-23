(() => {
  const bell=document.getElementById('noticeBell'), badge=document.getElementById('noticeCount');
  if(!bell) return;
  bell.onclick=()=>location.assign('notificacoes.html');
  const refresh=async()=>{
    if(document.hidden) return;
    try {
      const {notificacoes}=await import('../services/comunicacao.js');
      const data=await notificacoes();
      if(badge) {badge.textContent=String(data.nao_lidas || 0);badge.hidden=!data.nao_lidas;}
      bell.setAttribute('aria-label','Notificações: '+(data.nao_lidas || 0)+' não lidas');
    } catch {if(badge) badge.hidden=true;}
  };
  refresh();setInterval(refresh,30000);window.addEventListener('astro-notifications-refresh',refresh);
})();
