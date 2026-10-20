import { api, id } from "./conexao.js";
export const dashboard = () => api("/api/aluno/dashboard");
export const biblioteca = () => api("/api/aluno/biblioteca");
export const missao = (valor) => api("/api/aluno/missoes/" + id(valor));
export const entrarSala = (codigo) =>
  api("/api/aluno/entrar-sala", "POST", {
    codigo_sala: String(codigo).trim().toUpperCase(),
  });
// Compatibilidade: novos envios devem incluir texto e/ou arquivos.
export { enviarEntrega } from './atividades.js';
