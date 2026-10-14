const bell = document.getElementById("noticeBell");
if (bell)
  bell.onclick = () => {
    const e = document.getElementById("error");
    if (e) {
      e.textContent =
        "Notificações e perguntas ainda não têm rotas no backend. Consulte Correções e use Atualizar para verificar as entregas.";
    } else
      window.alert(
        "Consulte Correções para verificar as entregas. Notificações ainda dependem do backend.",
      );
  };
const badge = document.getElementById("noticeCount");
if (badge) badge.hidden = true;
