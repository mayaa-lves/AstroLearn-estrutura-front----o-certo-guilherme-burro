/* Adaptador da interface para o backend real. Sem dados escolares de exemplo. */
(() => {
  const ready = import("../services/conexao.js");
  const call = async (path, method = "GET", data) => {
    const c = await ready;
    c.sessaoObrigatoria("professor");
    return c.api(path, method, data);
  };
  const part = (x) => encodeURIComponent(String(x));
  const base = (s) => "/api/professor/salas/" + part(s);
  const blocked = async (feature) => (await ready).indisponivel(feature);
  const normalize = (m) => ({
    ...m,
    status_publicacao: "publicado",
    tipo_atividade: "individual",
    revisao: 1,
  });
  const enriched = (e) => ({
    ...e,
    missoes: e.missoes || { id: e.missao_id, titulo: e.titulo_missao },
    anexos: [],
  });
  async function room(s) {
    const [d, p, e] = await Promise.all([
      call(base(s)),
      call(base(s) + "/pauta"),
      call(base(s) + "/entregas"),
    ]);
    return {
      ...d,
      missoes: (d.missoes || []).map(normalize),
      pauta: p,
      entregas: (e.entregas || []).map(enriched),
    };
  }
  async function payload(s, b, existing) {
    if (b.tipo_atividade === "equipe")
      return blocked("O formato de atividade em equipe");
    const d = await call(base(s));
    const same = (d.missoes || []).filter(
      (m) => m.periodo_id === b.periodo_id && m.id !== existing?.id,
    );
    let ordem =
      existing?.periodo_id === b.periodo_id
        ? existing.ordem
        : Math.max(0, ...same.map((m) => Number(m.ordem) || 0)) + 1;
    return {
      titulo: b.titulo,
      descricao: b.descricao,
      periodo_id: b.periodo_id,
      ordem,
      data_limite: b.data_limite,
      peso_nota: b.peso_nota,
      xp_reward: b.xp_reward,
      sticker_recompensa_id: existing?.sticker_recompensa_id || null,
    };
  }
  window.TeacherData = {
    live: true,
    uid: () => crypto.randomUUID(),
    session: async () => (await ready).sessaoObrigatoria("professor"),
    editorReady: async () => true,
    rooms: () => call("/api/professor/salas"),
    room,
    createRoom: (nome) => call("/api/professor/salas", "POST", { nome }),
    createPeriod: (s, nome) => call(base(s) + "/periodos", "POST", { nome }),
    async createMission(s, b) {
      return normalize(
        await call(base(s) + "/missoes", "POST", await payload(s, b)),
      );
    },
    async updateMission(s, m, b) {
      const d = await call(base(s));
      const old = d.missoes.find((a) => a.id === m);
      if (!old) throw Error("Atividade não encontrada.");
      return normalize(
        await call(
          base(s) + "/missoes/" + part(m),
          "PUT",
          await payload(s, b, old),
        ),
      );
    },
    publishMission: () => blocked("A publicação separada de rascunhos"),
    files: async () => [],
    attach: () => blocked("O upload de materiais"),
    removeFile: () => blocked("A exclusão de anexos"),
    team: (s, t) => call(base(s) + "/equipes/" + part(t)),
    createTeam: (s, b) =>
      call(base(s) + "/equipes", "POST", {
        nome: b.nome,
        periodo_id: b.periodo_id,
      }),
    addMember: (s, t, a) =>
      call(base(s) + "/equipes/" + part(t) + "/membros", "POST", {
        aluno_id: a,
      }),
    removeMember: (s, t, a) =>
      call(base(s) + "/equipes/" + part(t) + "/membros/" + part(a), "DELETE"),
    async delivery(e) {
      const d = await call("/api/professor/entregas/" + part(e));
      return {
        ...enriched(d.progresso),
        sala_id: d.sala_id,
        equipe: d.equipe,
        membros: d.membros,
      };
    },
    correct: (e, nota, feedback) =>
      call("/api/professor/entregas/" + part(e) + "/corrigir", "POST", {
        nota,
        feedback_professor: feedback,
      }),
    notifications: () => blocked("As notificações"),
    readNotifications: () => blocked("A leitura de notificações"),
    simulateDelivery: () => blocked("A simulação de entrega"),
    questions: () => blocked("As perguntas ao professor"),
    studentQuestions: () => blocked("As perguntas ao professor"),
    ask: () => blocked("As perguntas ao professor"),
    answer: () => blocked("As respostas às perguntas"),
    demoSubmission: () => blocked("A entrega de texto e arquivos"),
    demoStudentWork: () => blocked("O modo de demonstração"),
    library: (s) => call(base(s) + "/biblioteca"),
    createMaterial: (s, b) => call(base(s) + "/biblioteca", "POST", b),
  };
})();
