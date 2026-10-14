import { api, id } from "./conexao.js";
export const dashboard = () => api("/api/aluno/dashboard");
export const biblioteca = () => api("/api/aluno/biblioteca");
export const missao = (valor) => api("/api/aluno/missoes/" + id(valor));
export const entrarSala = (codigo) =>
  api("/api/aluno/entrar-sala", "POST", {
    codigo_sala: String(codigo).trim().toUpperCase(),
  });
// Esta rota registra somente o status. Não recebe texto ou anexos.
export const registrarConclusao = (missao_id) =>
  api("/api/aluno/missoes/enviar", "POST", { missao_id });
