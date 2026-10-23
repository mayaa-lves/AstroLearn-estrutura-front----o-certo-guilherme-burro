import {cadastrar, entrar} from './autenticacao.js';

export function mensagemDeAcesso(error) {
 const text=String(error?.message || 'Não foi possível confirmar o acesso.');
 if(/email not confirmed|e-mail.*não.*confirmad/i.test(text)) return 'O servidor ainda exige a confirmação deste e-mail. Peça ao responsável para conferir a conta no Supabase.';
 if(/user already registered|email.*already.*registered|e-mail.*já.*cadastrad/i.test(text)) return 'Este e-mail já tem um cadastro. Entre pela tela de login.';
 if(/invalid login credentials|invalid credentials/i.test(text)) return 'O servidor não aceitou o e-mail e a senha. Tente o login e confira os dados.';
 return text;
}

// Só persiste uma sessão quando /login retorna token e perfil válidos.
// Um 409 isolado nunca vira sucesso. Não repete sign_up automaticamente.
export async function cadastrarEVerificarAcesso(dados, options={}) {
 let avisoPerfil=false;
 try { await cadastrar(dados, options); }
 catch(error) {
  // Compatibilidade com o back atual: o trigger pode criar o perfil antes
  // dessa verificação. Login real é necessário para confirmar o acesso.
  const pendente=error.status===409 && /aguardando confirma[cç][aã]o/i.test(error.message);
  if(!pendente) throw error;
  avisoPerfil=true;
 }
 try {
  const usuario=await entrar({email:dados.email,senha:dados.senha},options);
  return {acessoConfirmado:true,usuario,mensagem:avisoPerfil?'O servidor retornou um aviso de cadastro, mas seu acesso foi confirmado pelo login.':'Seu acesso está pronto!'};
 } catch(error) {
  if(avisoPerfil) throw error;
  return {acessoConfirmado:false,mensagem:'O servidor recebeu o cadastro, mas não confirmou o login. '+mensagemDeAcesso(error)};
 }
}
