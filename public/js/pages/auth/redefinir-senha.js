import {capturarRecuperacao,requisitosSenha,salvarNovaSenha} from '../../services/recuperacao.js';
const $ = id => document.getElementById(id);
const form=$('resetForm'), password=$('newPassword'), confirm=$('confirmPassword');
const submit=form.querySelector('[type="submit"]'), status=$('resetStatus');
let recovery=null,busy=false,completed=false;
function invalid(message){
  recovery=null;form.hidden=true;$('invalidLink').hidden=false;
  $('invalidLink').querySelector('p').textContent=message;
  password.value='';confirm.value='';
}
function requirements(){
  for(const [id,label,test] of requisitosSenha){
    const li=$('requirement-'+id);const ok=test(password.value);
    li.dataset.met=String(ok);li.textContent=(ok?'✓ ':'○ ')+label;
  }
}
try{recovery=capturarRecuperacao();form.hidden=false;requirements();}
catch(error){invalid(error.message);}
password.oninput=()=>{requirements();$('passwordError').textContent='';password.removeAttribute('aria-invalid');};
confirm.oninput=()=>{$('confirmError').textContent='';confirm.removeAttribute('aria-invalid');};
document.querySelectorAll('[data-reveal]').forEach(button=>{
 button.onclick=()=>{
  const input=$(button.dataset.reveal), reveal=input.type==='password';
  input.type=reveal?'text':'password';button.setAttribute('aria-pressed',String(reveal));
  button.setAttribute('aria-label',(reveal?'Ocultar ':'Mostrar ')+(input===password?'nova senha':'confirmação da senha'));
 };
});
form.onsubmit=async event=>{
 event.preventDefault();if(busy || completed || !recovery)return;
 if(recovery.expiresAt<=Date.now()){invalid('Seu link expirou. Solicite outro e-mail de recuperação.');return;}
 const valid=requisitosSenha.every(([, ,test])=>test(password.value));
 $('passwordError').textContent=valid?'':'Sua senha precisa atender a todos os requisitos abaixo.';
 password.setAttribute('aria-invalid',String(!valid));
 const matches=confirm.value && confirm.value===password.value;
 $('confirmError').textContent=matches?'':'As duas senhas precisam ser iguais.';
 confirm.setAttribute('aria-invalid',String(!matches));
 if(!valid || !matches){(valid?confirm:password).focus();return;}
 busy=true;submit.disabled=true;password.readOnly=true;confirm.readOnly=true;
 form.setAttribute('aria-busy','true');status.textContent='Salvando sua nova senha…';
 try {
  await salvarNovaSenha(password.value,recovery.token);
  completed=true;recovery=null;password.value='';confirm.value='';
  form.hidden=true;$('resetResult').hidden=false;status.textContent='';
  $('resetResult').tabIndex=-1;$('resetResult').focus();
 } catch(error) {
  if(error.status===401 || error.status===403){invalid('O servidor não aceitou este link. Solicite um novo e-mail de recuperação.');status.textContent='';}
  else status.textContent=error.message;
 } finally {
  busy=false;submit.disabled=false;password.readOnly=false;confirm.readOnly=false;form.setAttribute('aria-busy','false');
 }
};
addEventListener('pagehide',()=>{recovery=null;password.value='';confirm.value='';});
addEventListener('pageshow',event=>{if(event.persisted && !completed)invalid('Por segurança, abra novamente o link de recuperação do seu e-mail.');});
