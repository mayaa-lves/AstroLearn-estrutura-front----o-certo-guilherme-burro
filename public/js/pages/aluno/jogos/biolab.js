import { montarJogo } from './frame-jogo.js';
montarJogo({frame:document.getElementById('biolab'),status:document.getElementById('gameStatus'),src:new URL('../../../../jogos/biolab/index.html',import.meta.url).href});
