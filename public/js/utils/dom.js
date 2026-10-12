// Utilitário simples: procura um elemento sem criar HTML a partir de dados externos.
export const selecionar = (seletor, raiz = document) => raiz.querySelector(seletor);
