export function formatarMensagem(texto) {
 const fragment=document.createDocumentFragment();
 const pattern=/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
 let start=0;
 for(const match of String(texto).matchAll(pattern)) {
  fragment.append(document.createTextNode(texto.slice(start,match.index)));
  const code=match[0].startsWith('`');
  const element=document.createElement(code?'code':'strong');
  element.textContent=match[0].slice(code?1:2,code?-1:-2);
  fragment.append(element);start=match.index+match[0].length;
 }
 fragment.append(document.createTextNode(texto.slice(start)));
 return fragment;
}
