import {perguntasAluno,perguntarProfessor} from '../../services/comunicacao.js';
const params=new URLSearchParams(location.search), mission=params.get('atividade');
const form=document.getElementById('pergunta-form'), input=document.getElementById('pergunta'), status=document.getElementById('pergunta-status');
const submit=form.querySelector('button'), list=document.createElement('div');
list.className='activity-questions';list.setAttribute('aria-label','Suas perguntas e respostas');form.before(list);
let sending=false,loading=false;
function item(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function render(rows){
  list.replaceChildren();
  for(const q of rows){
    const article=document.createElement('article');article.className='question-card';article.id='pergunta-'+q.id;
    article.append(item('strong','Você · '+new Date(q.criado_em).toLocaleString('pt-BR')),item('p',q.texto));
    if(q.resposta) article.append(item('strong','Resposta do professor'),item('p',q.resposta));
    else article.append(item('small','Aguardando resposta do professor.'));
    list.append(article);
  }
  if(!rows.length) list.append(item('p','Ainda não há perguntas nesta atividade.'));
}
async function load(){
  if(loading || sending || document.hidden) return;
  loading=true;
  try {const data=await perguntasAluno(mission);render(data.perguntas || []);status.textContent='';submit.disabled=false;}
  catch(error){status.textContent=error.status===404?'As perguntas ainda não estão disponíveis no servidor.':error.message;submit.disabled=true;}
  finally{loading=false;}
}
if(params.get('preview')==='1' || !mission){input.disabled=true;submit.disabled=true;status.textContent='Prévia do professor: perguntas disponíveis somente na conta do aluno.';}
else {
  submit.disabled=true;load();
  form.onsubmit=async event=>{
    event.preventDefault();if(sending) return;
    const texto=input.value.trim();if(texto.length<3){status.textContent='Escreva uma pergunta com pelo menos 3 caracteres.';return;}
    sending=true;submit.disabled=true;status.textContent='Enviando…';
    let saved=false;
    try{await perguntarProfessor(mission,texto);saved=true;input.value='';status.textContent='Pergunta enviada ao professor.';}
    catch(error){status.textContent=error.message;}
    finally{sending=false;submit.disabled=false;}
    if(saved){try{const data=await perguntasAluno(mission);render(data.perguntas || []);}catch{status.textContent='Pergunta enviada. Atualize a página para consultar a conversa.';}}
  };
  const refresh=document.createElement('button');refresh.type='button';refresh.className='text-button';refresh.textContent='Atualizar conversa';refresh.onclick=load;form.after(refresh);
  setInterval(()=>{if(!input.value.trim()) load();},30000);
}
