/* Contratos do backend e armazenamento da prévia. Nunca mistura dados reais e exemplos. */
(() => {
  "use strict";

  const api = null,
    params = new URLSearchParams(location.search),
    live = false,
    key = "astrolearn-professor-v2";
  const uid = () => crypto.randomUUID();
  let state = null;
  function initial() {
    const rooms = ["3º P", "2º M", "1º A"].map((nome, i) => ({
      id: `s${i}`,
      nome,
      codigo_acesso: ["ASTRO3", "ORBIT2", "COSMO1"][i],
    }));
    const students = [],
      missions = [],
      periods = [],
      deliveries = [],
      teams = [];
    rooms.forEach((room, i) => {
      const period = {
        id: `p${i}`,
        sala_id: room.id,
        nome: "1º período",
      };
      periods.push(period);
      ["Maya", "Isabelly", "Guilherme", "Ana"].forEach((nome, j) =>
        students.push({
          id: `a${i}${j}`,
          sala_id: room.id,
          nome: `${nome}${i ? " " + ["", "Costa", "Alves"][i] : ""}`,
        }),
      );
      ["Primeiro contato", "Órbita das ideias", "Laboratório lunar"].forEach(
        (titulo, j) =>
          missions.push({
            id: `m${i}${j}`,
            sala_id: room.id,
            periodo_id: period.id,
            titulo,
            ordem: j + 1,
            descricao: [
              "Observe uma situação do cotidiano e registre o que chamou sua atenção.",
              "Transforme sua observação em uma pergunta científica e proponha um teste.",
              "Planeje um experimento. Registre a hipótese, as variáveis e como comparar os resultados.",
            ][j],
            peso_nota: 1,
            xp_reward: 30,
          }),
      );
      students
        .filter((s) => s.sala_id === room.id)
        .forEach((student, j) =>
          missions
            .filter((m) => m.sala_id === room.id)
            .forEach((mission, k) => {
              if (k === 2 && j > 0) return;
              deliveries.push({
                id: `e${i}${j}${k}`,
                sala_id: room.id,
                aluno_id: student.id,
                missao_id: mission.id,
                status: k === 2 ? "entregue" : "corrigido",
                nota: k === 2 ? null : [7, 8, 6, 9][(j + k + i) % 4],
                comentario_professor:
                  k === 2
                    ? ""
                    : "Boa observação. Continue explicando como comparar os resultados.",
                validada_professor: k !== 2,
                resposta_entrega:
                  "Observei que as plantas próximas à janela crescem de forma diferente. Minha hipótese é que a quantidade de luz influencia o crescimento. Vou comparar duas plantas da mesma espécie, mantendo água, solo e tempo iguais.",
                entregue_em: `2026-10-0${7 + k}T14:00:00Z`,
              });
            }),
        );
      teams.push({
        id: `t${i}`,
        sala_id: room.id,
        periodo_id: period.id,
        nome: "Equipe Órion",
        membros: students
          .filter((s) => s.sala_id === room.id)
          .slice(0, 2)
          .map((s) => s.id),
      });
    });
    return {
      version: 2,
      rooms,
      students,
      missions,
      periods,
      deliveries,
      teams,
    };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (
      saved?.version === 2 &&
      ["rooms", "students", "missions", "periods", "deliveries", "teams"].every(
        (k) => Array.isArray(saved[k]),
      )
    )
      state = saved;
  } catch {}
  state ??= initial();
  function pull() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 2) state = saved;
    } catch {}
    extras();
  }
  function extras() {
    if (!state) return;
    state.missions.forEach((m) => {
      m.status_publicacao ??= "publicado";
      m.tipo_atividade ??= "individual";
      m.revisao ??= 1;
    });
    if (!Array.isArray(state.questions))
      state.questions = [
        {
          id: "q0",
          sala_id: "s0",
          missao_id: "m01",
          aluno_id: "a02",
          texto:
            "Posso comparar duas plantas com a mesma quantidade de água, mudando só a luz?",
          criado_em: "2026-10-10T15:00:00Z",
          resposta: null,
        },
      ];
    if (!Array.isArray(state.notifications)) {
      state.notifications = state.deliveries
        .filter((e) => e.status === "entregue")
        .map((e) => ({
          id: "n-" + e.id,
          tipo: "entrega",
          sala_id: e.sala_id,
          missao_id: e.missao_id,
          aluno_id: e.aluno_id,
          entrega_id: e.id,
          titulo: "Nova atividade entregue",
          mensagem:
            (state.students.find((a) => a.id === e.aluno_id)?.nome || "Aluno") +
            " enviou " +
            state.missions.find((m) => m.id === e.missao_id)?.titulo,
          criado_em: e.entregue_em,
          lida_em: null,
        }));
      state.questions.forEach((q) =>
        state.notifications.push(questionNotice(q)),
      );
    }
  }
  function questionNotice(q) {
    return {
      id: "n-" + q.id,
      tipo: "pergunta",
      sala_id: q.sala_id,
      missao_id: q.missao_id,
      aluno_id: q.aluno_id,
      pergunta_id: q.id,
      titulo: "Nova pergunta do aluno",
      mensagem:
        (state.students.find((a) => a.id === q.aluno_id)?.nome || "Aluno") +
        " tem uma dúvida em " +
        state.missions.find((m) => m.id === q.missao_id)?.titulo,
      criado_em: q.criado_em,
      lida_em: null,
    };
  }
  extras();
  function commit(change) {
    pull();
    const next = structuredClone(state);
    const result = change(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      throw new Error(
        "Não foi possível salvar neste navegador. Seus dados não foram alterados.",
      );
    }
    state = next;
    return result;
  }
  function enriched(s) {
    return {
      ...s,
      perfis: state.students.find((a) => a.id === s.aluno_id),
      titulo_missao: state.missions.find((m) => m.id === s.missao_id)?.titulo,
    };
  }
  function pauta(room) {
    const missions = state.missions.filter(
        (m) => m.sala_id === room && m.status_publicacao !== "rascunho",
      ),
      work = state.deliveries.filter((e) => e.sala_id === room);
    return {
      missoes: missions,
      quizzes: [],
      pauta_data: state.students
        .filter((a) => a.sala_id === room)
        .map((aluno) => {
          const notas = {};
          let total = 0,
            weight = 0;
          missions.forEach((m) => {
            const e = work.find(
                (e) => e.aluno_id === aluno.id && e.missao_id === m.id,
              ),
              grade =
                e?.status === "corrigido" && e.nota != null
                  ? Number(e.nota)
                  : null;
            notas[m.id] = grade;
            if (grade != null) {
              total += grade * (m.peso_nota || 1);
              weight += m.peso_nota || 1;
            }
          });
          return {
            aluno,
            notas,
            quiz_notas: {},
            media: weight ? Math.round((total / weight) * 100) / 100 : null,
            equipe_nome:
              state.teams.find(
                (t) => t.sala_id === room && t.membros.includes(aluno.id),
              )?.nome || "—",
          };
        }),
    };
  }
  async function fileDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("Este navegador não permite guardar arquivos."));
        return;
      }
      const r = indexedDB.open("astrolearn-teacher-files", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("files");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.onblocked = () =>
        reject(new Error("Armazenamento de arquivos bloqueado."));
    });
  }
  async function storeFiles(id, files) {
    const db = await fileDB();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").put(
          files.map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
            blob: f.blob || f,
            path: f.path || uid(),
          })),
          id,
        );
        tx.oncomplete = resolve;
        tx.onerror = tx.onabort = () =>
          reject(new Error("Não foi possível salvar os anexos."));
      });
    } finally {
      db.close();
    }
  }
  async function readFiles(id) {
    const db = await fileDB();
    try {
      return await new Promise((resolve, reject) => {
        const r = db
          .transaction("files", "readonly")
          .objectStore("files")
          .get(id);
        r.onsuccess = () =>
          resolve(
            (r.result || []).map((f) => ({
              ...f,
              path: f.path || "demo:" + f.name + ":" + f.size,
            })),
          );
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  }
  function validateMission(b) {
    if (
      typeof b.titulo !== "string" ||
      !b.titulo.trim() ||
      b.titulo.length > 120
    )
      throw new Error("Preencha um título de até 120 caracteres.");
    if (typeof b.descricao !== "string" || b.descricao.length > 10000)
      throw new Error("Confira a orientação.");
    if (!["individual", "equipe"].includes(b.tipo_atividade || "individual"))
      throw new Error("Escolha o formato da atividade.");
    if (
      !Number.isFinite(b.peso_nota) ||
      b.peso_nota < 0.1 ||
      b.peso_nota > 10 ||
      !Number.isInteger(b.xp_reward) ||
      b.xp_reward < 0 ||
      b.xp_reward > 1000
    )
      throw new Error("Confira peso e XP.");
  }
  let editorAvailable = false;
  async function requireEditor() {
    return true;
  }
  window.TeacherData = {
    live,
    uid,
    editorReady: requireEditor,
    session: () => null,
    async rooms() {
      return state.rooms.map((r) => ({
        ...r,
        total_alunos: state.students.filter((a) => a.sala_id === r.id).length,
        total_missoes: state.missions.filter((m) => m.sala_id === r.id).length,
      }));
    },
    async room(id) {
      const sala = state.rooms.find((r) => r.id === id);
      if (!sala) throw new Error("Turma não encontrada.");
      return {
        sala,
        alunos: state.students.filter((a) => a.sala_id === id),
        missoes: state.missions.filter((m) => m.sala_id === id),
        periodos: state.periods.filter((p) => p.sala_id === id),
        equipes: state.teams.filter((t) => t.sala_id === id),
        pauta: pauta(id),
        entregas: state.deliveries
          .filter((e) => e.sala_id === id)
          .map(enriched),
      };
    },
    async createRoom(nome) {
      return commit((s) => {
        const r = {
          id: uid(),
          nome,
          codigo_acesso: uid().replaceAll("-", "").slice(0, 6).toUpperCase(),
        };
        s.rooms.push(r);
        return r;
      });
    },
    async createPeriod(room, nome) {
      return commit((s) => {
        const p = {
          id: uid(),
          nome,
          sala_id: room,
        };
        s.periods.push(p);
        return p;
      });
    },
    async createMission(room, body) {
      await requireEditor();
      return commit((s) => {
        const prior =
          body.chave_criacao &&
          s.missions.find(
            (m) => m.sala_id === room && m.chave_criacao === body.chave_criacao,
          );
        if (prior) return prior;
        validateMission(body);
        if (
          !s.periods.some((p) => p.id === body.periodo_id && p.sala_id === room)
        )
          throw new Error("Período inválido.");
        if (
          s.missions.filter(
            (m) => m.sala_id === room && m.periodo_id === body.periodo_id,
          ).length >= 5
        )
          throw new Error(
            "Este período já possui 5 atividades, incluindo rascunhos.",
          );
        const order =
          Math.max(
            0,
            ...s.missions
              .filter(
                (m) => m.sala_id === room && m.periodo_id === body.periodo_id,
              )
              .map((m) => Number(m.ordem) || 0),
          ) + 1;
        const m = {
          ...body,
          id: uid(),
          sala_id: room,
          ordem: order,
          status_publicacao: "rascunho",
          tipo_atividade: body.tipo_atividade || "individual",
          revisao: 1,
        };
        s.missions.push(m);
        return m;
      });
    },
    async updateMission(room, id, body) {
      await requireEditor();
      return commit((s) => {
        const m = s.missions.find((m) => m.id === id && m.sala_id === room);
        if (!m) throw new Error("Atividade não encontrada nesta sala.");
        validateMission(body);
        if (m.revisao !== body.revisao)
          throw new Error(
            "A atividade mudou em outra aba. Atualize antes de salvar.",
          );
        if (
          !s.periods.some((p) => p.id === body.periodo_id && p.sala_id === room)
        )
          throw new Error("Período inválido.");
        if (m.status_publicacao === "publicado" && !body.descricao.trim())
          throw new Error("A orientação publicada não pode ficar vazia.");
        if (
          m.status_publicacao === "publicado" &&
          (m.periodo_id !== body.periodo_id ||
            m.tipo_atividade !== body.tipo_atividade)
        )
          throw new Error("Período e formato não podem mudar após publicação.");
        if (
          s.deliveries.some((e) => e.missao_id === id) &&
          ((m.peso_nota || 1) !== body.peso_nota ||
            (m.xp_reward || 0) !== body.xp_reward)
        )
          throw new Error("Critérios não podem mudar após uma entrega.");
        let order = m.ordem;
        if (m.periodo_id !== body.periodo_id) {
          const dest = s.missions.filter(
            (m) => m.sala_id === room && m.periodo_id === body.periodo_id,
          );
          if (dest.length >= 5)
            throw new Error("O período de destino já tem 5 atividades.");
          order = Math.max(0, ...dest.map((m) => m.ordem)) + 1;
        }
        Object.assign(m, {
          titulo: body.titulo,
          descricao: body.descricao,
          data_limite: body.data_limite,
          periodo_id: body.periodo_id,
          tipo_atividade: body.tipo_atividade,
          peso_nota: body.peso_nota,
          xp_reward: body.xp_reward,
          ordem: order,
          revisao: m.revisao + 1,
        });
        return m;
      });
    },
    async publishMission(room, id, revision) {
      await requireEditor();
      return commit((s) => {
        const m = s.missions.find((m) => m.id === id && m.sala_id === room);
        if (!m) throw new Error("Atividade não encontrada nesta sala.");
        if (m.status_publicacao === "publicado") return m;
        if (m.revisao !== revision)
          throw new Error("A atividade mudou. Confira a prévia novamente.");
        if (!m.descricao?.trim())
          throw new Error("Escreva a orientação antes de publicar.");
        if (
          s.missions.some(
            (a) =>
              a.sala_id === room &&
              a.periodo_id === m.periodo_id &&
              a.ordem < m.ordem &&
              a.status_publicacao === "rascunho",
          )
        )
          throw new Error(
            "Publique primeiro os rascunhos anteriores do período.",
          );
        Object.assign(m, {
          status_publicacao: "publicado",
          publicado_em: new Date().toISOString(),
          revisao: m.revisao + 1,
        });
        return m;
      });
    },
    async removeFile(room, id, path) {
      if (!state.missions.some((m) => m.id === id && m.sala_id === room))
        throw new Error("Atividade não encontrada nesta sala.");
      const files = await readFiles(id);
      if (!files.some((f) => f.path === path))
        throw new Error("Arquivo não encontrado.");
      await storeFiles(
        id,
        files.filter((f) => f.path !== path),
      );
      return {
        id,
        removido: true,
      };
    },
    async attach(room, mission, files) {
      if (!files.length) return;
      const existing = await readFiles(mission);
      const combined = [
        ...existing,
        ...files.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          blob: f,
        })),
      ];
      if (
        combined.length > 10 ||
        combined.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
      )
        throw new Error(
          "Os materiais existentes e novos ultrapassam o limite da atividade.",
        );
      if (
        new Set(combined.map((f) => f.name + "-" + f.size)).size !==
        combined.length
      )
        throw new Error("Um desses arquivos já está anexado.");
      if (!state.missions.some((m) => m.id === mission && m.sala_id === room))
        throw new Error("Atividade não encontrada nesta sala.");
      await storeFiles(mission, combined);
      return {
        total: combined.length,
      };
    },
    async files(room, mission) {
      return readFiles(mission);
    },
    async team(room, id) {
      const equipe = state.teams.find((t) => t.id === id && t.sala_id === room);
      if (!equipe) throw new Error("Equipe não encontrada.");
      const assigned = new Set(
        state.teams
          .filter(
            (t) => t.sala_id === room && t.periodo_id === equipe.periodo_id,
          )
          .flatMap((t) => t.membros),
      );
      return {
        equipe,
        membros: state.students.filter((s) => equipe.membros.includes(s.id)),
        alunos_disponiveis: state.students.filter(
          (s) => s.sala_id === room && !assigned.has(s.id),
        ),
      };
    },
    async createTeam(room, body) {
      return commit((s) => {
        if (
          !s.periods.some((p) => p.id === body.periodo_id && p.sala_id === room)
        )
          throw new Error("Período inválido.");
        const t = {
          ...body,
          id: uid(),
          sala_id: room,
          membros: [],
        };
        s.teams.push(t);
        return t;
      });
    },
    async addMember(room, team, student) {
      return commit((s) => {
        const t = s.teams.find((t) => t.id === team && t.sala_id === room);
        if (
          !t ||
          !s.students.some((a) => a.id === student && a.sala_id === room)
        )
          throw new Error("Aluno ou equipe fora da turma.");
        if (
          s.teams.some(
            (e) =>
              e.sala_id === room &&
              e.periodo_id === t.periodo_id &&
              e.membros.includes(student),
          )
        )
          throw new Error("O aluno já pertence a uma equipe neste período.");
        if (t.membros.length >= 4)
          throw new Error("A equipe já tem quatro integrantes.");
        t.membros.push(student);
      });
    },
    async removeMember(room, team, student) {
      return commit((s) => {
        const t = s.teams.find((t) => t.id === team && t.sala_id === room);
        if (!t) throw new Error("Equipe não encontrada.");
        t.membros = t.membros.filter((id) => id !== student);
      });
    },
    async delivery(id) {
      const d = state.deliveries.find((d) => d.id === id);
      if (!d) throw new Error("Entrega não encontrada.");
      let files = await readFiles("entrega:" + id);
      if (!files.length && id === "e002" && typeof fetch === "function") {
        const r = await fetch(
          "../public/assets/imagens/professor/observacao-exemplo.png",
        );
        if (!r.ok)
          throw new Error("Não foi possível abrir o anexo de exemplo.");
        const blob = await r.blob();
        files = [
          {
            name: "observacao-exemplo.png",
            type: "image/png",
            size: blob.size,
            blob,
          },
        ];
      }
      return {
        ...enriched(d),
        anexos: files.map((f) => ({
          ...f,
          url: null,
        })),
      };
    },
    async correct(id, nota, feedback) {
      if (
        !Number.isFinite(nota) ||
        nota < 0 ||
        nota > 10 ||
        typeof feedback !== "string" ||
        feedback.length > 3000
      )
        throw new Error("Confira a nota de 0 a 10 e a orientação.");
      return commit((s) => {
        const d = s.deliveries.find((d) => d.id === id);
        if (!d || d.status === "corrigido")
          throw new Error("Esta entrega já foi corrigida.");
        Object.assign(d, {
          status: "corrigido",
          nota,
          comentario_professor: feedback,
          validada_professor: true,
        });
      });
    },
    async notifications(unreadOnly = false) {
      const all = state.notifications;
      return {
        notificacoes: [...all]
          .filter((n) => !unreadOnly || !n.lida_em)
          .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
          .slice(0, 100),
        nao_lidas: all.filter((n) => !n.lida_em).length,
      };
    },
    async readNotifications(ids) {
      return commit((s) => {
        let total = 0;
        s.notifications.forEach((n) => {
          if (ids.includes(n.id) && !n.lida_em) {
            n.lida_em = new Date().toISOString();
            total++;
          }
        });
        return {
          total,
        };
      });
    },
    async questions(room) {
      if (!state.rooms.some((r) => r.id === room))
        throw new Error("Sala não encontrada.");
      return state.questions
        .filter((q) => q.sala_id === room)
        .map((q) => ({
          ...q,
          perfis: state.students.find((a) => a.id === q.aluno_id),
          missoes: state.missions.find((m) => m.id === q.missao_id),
        }))
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    },
    async studentQuestions(mission) {
      if (
        !state.missions.some(
          (m) => m.id === mission && m.status_publicacao === "publicado",
        )
      )
        throw new Error("Atividade não disponível.");
      return state.questions
        .filter((q) => q.missao_id === mission && q.aluno_id === "a00")
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    },
    async ask(mission, texto) {
      if (
        typeof texto !== "string" ||
        !texto.trim() ||
        texto.trim().length > 3000
      )
        throw new Error("Escreva uma pergunta de 1 a 3.000 caracteres.");
      return commit((s) => {
        const m = s.missions.find(
          (m) =>
            m.id === mission &&
            m.sala_id === "s0" &&
            m.status_publicacao === "publicado",
        );
        if (!m) throw new Error("Atividade não disponível.");
        if (
          s.questions.filter(
            (q) =>
              q.missao_id === mission && q.aluno_id === "a00" && !q.resposta,
          ).length >= 10
        )
          throw new Error("Aguarde a resposta às perguntas anteriores.");
        const q = {
          id: uid(),
          sala_id: m.sala_id,
          missao_id: mission,
          aluno_id: "a00",
          texto: texto.trim(),
          criado_em: new Date().toISOString(),
          resposta: null,
        };
        s.questions.push(q);
        s.notifications.push(questionNotice(q));
        return {
          pergunta: q,
        };
      });
    },
    async answer(id, resposta) {
      if (
        typeof resposta !== "string" ||
        !resposta.trim() ||
        resposta.trim().length > 3000
      )
        throw new Error("Escreva uma resposta de 1 a 3.000 caracteres.");
      return commit((s) => {
        const q = s.questions.find((q) => q.id === id);
        if (!q || q.resposta)
          throw new Error("Pergunta não disponível ou já respondida.");
        q.resposta = resposta.trim();
        q.respondida_em = new Date().toISOString();
        return {
          pergunta: q,
        };
      });
    },
    async simulateDelivery() {
      return commit((s) => {
        const student = s.students.find((a) => a.id === "a01");
        if (!student) throw new Error("Aluno de exemplo indisponível.");
        if (
          s.deliveries.some(
            (e) => e.aluno_id === "a01" && e.missao_id === "m02",
          )
        )
          throw new Error(
            "A entrega de exemplo já foi enviada. Consulte as correções.",
          );
        const d = {
          id: uid(),
          sala_id: "s0",
          aluno_id: "a01",
          missao_id: "m02",
          status: "entregue",
          nota: null,
          validada_professor: false,
          resposta_entrega:
            "Minha hipótese: plantas com mais luz crescerão mais. Vou comparar a altura de duas plantas durante sete dias, mantendo água, solo e espécie iguais.",
          entregue_em: new Date().toISOString(),
        };
        s.deliveries.push(d);
        s.notifications.push({
          id: uid(),
          tipo: "entrega",
          sala_id: "s0",
          missao_id: "m02",
          aluno_id: "a01",
          entrega_id: d.id,
          titulo: "Nova atividade entregue",
          mensagem: "Isabelly enviou Laboratório lunar · 3º P",
          criado_em: d.entregue_em,
          lida_em: null,
        });
        return d;
      });
    },
  };

  window.TeacherData.demoSubmission = async function (missionId, text, files) {
    pull();
    const m = state.missions.find(
      (m) =>
        m.id === missionId &&
        m.sala_id === "s0" &&
        m.status_publicacao === "publicado",
    );
    if (!m)
      throw new Error(
        "Atividade não disponível para este aluno de demonstração.",
      );
    if (
      typeof text !== "string" ||
      text.length > 10000 ||
      (!text.trim() && !files.length)
    )
      throw new Error("Adicione texto ou arquivos para entregar.");
    if (
      files.length > 10 ||
      files.some((f) => !f.size || f.size > 20 * 1024 * 1024) ||
      files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
    )
      throw new Error("Confira os limites dos arquivos.");
    const previous = state.deliveries.find(
      (e) => e.aluno_id === "a00" && e.missao_id === missionId,
    );
    const id = uid();
    await storeFiles("entrega:" + id, files);
    try {
      return commit((next) => {
        if (previous) {
          next.deliveries = next.deliveries.filter((e) => e.id !== previous.id);
          next.notifications = next.notifications.filter(
            (n) => n.entrega_id !== previous.id,
          );
        }
        const record = {
          id,
          sala_id: m.sala_id,
          missao_id: m.id,
          aluno_id: "a00",
          status: "entregue",
          nota: null,
          validada_professor: false,
          resposta_entrega: text.trim(),
          entregue_em: new Date().toISOString(),
        };
        next.deliveries.push(record);
        next.notifications.push({
          id: uid(),
          tipo: "entrega",
          sala_id: m.sala_id,
          missao_id: m.id,
          aluno_id: "a00",
          entrega_id: id,
          titulo: "Nova atividade entregue",
          mensagem: "Maya enviou " + m.titulo,
          criado_em: record.entregue_em,
          lida_em: null,
        });
        return record;
      });
    } catch (e) {
      await storeFiles("entrega:" + id, []).catch(() => {});
      throw e;
    }
  };
  window.TeacherData.demoStudentWork = async function (missionId) {
    pull();
    const e = state.deliveries.find(
      (e) => e.aluno_id === "a00" && e.missao_id === missionId,
    );
    return e ? { ...e } : null;
  };
  for (const name of Object.keys(window.TeacherData)) {
    const fn = window.TeacherData[name];
    if (typeof fn === "function" && !["uid", "session"].includes(name))
      window.TeacherData[name] = function (...args) {
        pull();
        return fn.apply(this, args);
      };
  }
})();
