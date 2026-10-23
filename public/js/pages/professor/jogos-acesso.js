import {api,sessaoObrigatoria} from '../../services/conexao.js';
sessaoObrigatoria('professor');
const sala=new URLSearchParams(location.search).get('sala');
const message=document.getElementById('accessMessage'),check=document.getElementById('allowGames'),save=document.getElementById('saveAccess'),refresh=document.getElementById('refreshAccess');
const route='/api/professor/salas/'+encodeURIComponent(sala||'')+'/jogos/acesso';
let busy=false,ready=false;
const controls=()=>{save.disabled=busy||!ready;check.disabled=busy||!ready;refresh.disabled=busy;};
function failure(error){ready=false;message.textContent=error.status===404?'O controle de jogos ainda não foi disponibilizado para esta turma no servidor. Nenhuma permissão foi alterada.':error.message;}
async function load(){if(busy)return;if(!sala){message.textContent='Abra uma turma antes de configurar os jogos.';return;}busy=true;ready=false;controls();try{const data=await api(route);if(typeof data?.liberado!=='boolean')throw new Error('Configuração inválida recebida do servidor.');check.checked=data.liberado;ready=true;message.textContent=data.liberado?'Jogos liberados para esta turma.':'Jogos pausados para esta turma.';}catch(error){failure(error);}finally{busy=false;controls();}}
refresh.onclick=load;
document.getElementById('accessForm').onsubmit=async event=>{event.preventDefault();if(busy||!ready)return;busy=true;controls();try{const data=await api(route,'PUT',{liberado:check.checked});if(typeof data?.liberado!=='boolean')throw new Error('O servidor não confirmou a alteração. Consulte novamente.');check.checked=data.liberado;message.textContent=data.liberado?'Acesso liberado e confirmado pelo servidor.':'Bloqueio confirmado pelo servidor. Os alunos verão a mudança na próxima verificação de acesso.';}catch(error){failure(error);}finally{busy=false;controls();}};
load();
