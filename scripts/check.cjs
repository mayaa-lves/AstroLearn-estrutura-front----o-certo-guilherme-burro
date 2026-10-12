const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
let count=0;
function conferir(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  if(item.name==='node_modules'||item.name.startsWith('.'))continue;
  const file=path.join(dir,item.name);
  if(item.isDirectory())conferir(file);
  else if(/\.(js|cjs)$/.test(file)){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){console.error(r.stderr);process.exitCode=1;}count++;}
}}
conferir(path.resolve(__dirname,'..'));
if(!process.exitCode)console.log(`Sintaxe conferida: ${count} arquivos.`);
