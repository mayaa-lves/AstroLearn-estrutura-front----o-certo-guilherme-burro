/* Modelo didático fictício. Tempo em segundos de simulação. */
(function(root){
class Simulation {
 constructor(config={},seed=42){this.cfg={population:30,initial:1,radius:15,speed:42,transmission:true,recovery:12,masked:0,vaccinated:0,...config};this.seed=seed>>>0;this.time=0;this.contacts=0;this.cases=this.cfg.initial;this.peak=this.cfg.initial;this.history=[];this.agents=[];this.width=900;this.height=520;
 for(let i=0;i<this.cfg.population;i++){let a=this.rand()*Math.PI*2;this.agents.push({id:i,x:30+this.rand()*840,y:30+this.rand()*460,vx:Math.cos(a)*this.cfg.speed,vy:Math.sin(a)*this.cfg.speed,state:i<this.cfg.initial?'I':'S',infectedAt:0,mask:i>=this.cfg.initial&&this.rand()<this.cfg.masked,vaccine:i>=this.cfg.initial&&this.rand()<this.cfg.vaccinated});}this.record(); }
 rand(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 counts(){return this.agents.reduce((o,a)=>(o[a.state]++,o),{S:0,I:0,R:0});}
 protect(id,tool){let a=this.agents[id];if(!a)return false;if(tool==='mask'){if(a.mask)return false;a.mask=true;return true;}if(tool==='vaccine'&&a.state==='S'&&!a.vaccine){a.vaccine=true;return true;}return false;}
 step(dt){this.time+=dt;const r=this.cfg.radius;for(const a of this.agents){a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<r||a.x>this.width-r){a.x=Math.max(r,Math.min(this.width-r,a.x));a.vx*=-1;}if(a.y<r||a.y>this.height-r){a.y=Math.max(r,Math.min(this.height-r,a.y));a.vy*=-1;}if(a.state==='I'&&this.cfg.recovery>0&&this.time-a.infectedAt>=this.cfg.recovery)a.state='R';}
 const newly=new Set();if(this.cfg.transmission)for(let i=0;i<this.agents.length;i++)for(let j=i+1;j<this.agents.length;j++){let a=this.agents[i],b=this.agents[j];if(Math.hypot(a.x-b.x,a.y-b.y)>2*r)continue;let sick=a.state==='I'?a:b,healthy=a.state==='S'?a:b;if(sick===healthy||sick.state!=='I'||healthy.state!=='S')continue;this.contacts++;let rate=3*(sick.mask?.35:1)*(healthy.mask?.35:1)*(healthy.vaccine?.15:1);if(this.rand()<1-Math.exp(-rate*dt))newly.add(healthy);}
 for(const a of newly){a.state='I';a.infectedAt=this.time;this.cases++;}this.peak=Math.max(this.peak,this.counts().I);if(this.time-this.history[this.history.length-1].t>=.5)this.record();}
 record(){this.history.push({t:this.time,...this.counts()});}
}
root.Simulation=Simulation;if(typeof module!=='undefined')module.exports={Simulation};
})(typeof window!=='undefined'?window:globalThis);

