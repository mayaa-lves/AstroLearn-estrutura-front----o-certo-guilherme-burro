export function criarArmazenamento(id,jogo) {
 const prefix='astrolearn-jogo:'+encodeURIComponent(id)+':'+jogo+':';
 const memory=new Map();
 return {
  getItem(key){try{const raw=localStorage.getItem(prefix+key);if(raw===null)return memory.get(key)||null;JSON.parse(raw);return raw;}catch{return memory.get(key)||null;}},
  setItem(key,value){memory.set(key,String(value));try{localStorage.setItem(prefix+key,String(value));}catch{window.dispatchEvent(new Event('astrolearn:game-storage-unavailable'));}},
  removeItem(key){memory.delete(key);try{localStorage.removeItem(prefix+key);}catch{}}
 };
}
