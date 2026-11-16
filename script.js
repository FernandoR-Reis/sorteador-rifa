const $=id=>document.getElementById(id);
let off=new Set(),won=[],busy=false;
const KEY='sorteador-rifa-v1';
function save(){try{localStorage.setItem(KEY,JSON.stringify({off:[...off],won,min:$('min').value,max:$('max').value}))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d){off=new Set(d.off||[]);won=d.won||[];$('min').value=d.min||1;$('max').value=d.max||500}}catch(e){}}
const rng=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296};
function range(){let a=parseInt($('min').value),b=parseInt($('max').value);if(isNaN(a)||isNaN(b)||a>b)return null;return[a,b]}
function pool(){const r=range();if(!r)return[];const p=[];for(let i=r[0];i<=r[1];i++)if(!off.has(i)&&!won.includes(i))p.push(i);return p}
function parse(t){const s=new Set();t.split(/[\s,;]+/).filter(Boolean).forEach(x=>{const m=x.match(/^(\d+)-(\d+)$/);if(m){let a=+m[1],b=+m[2];if(a>b)[a,b]=[b,a];for(let i=a;i<=b&&i-a<5000;i++)s.add(i)}else if(/^\d+$/.test(x))s.add(+x)});return s}
function syncText(){$('ex').value=[...off].sort((a,b)=>a-b).join(', ')}
function drawGrid(){const r=range(),g=$('grid');g.innerHTML='';if(!r)return;for(let i=r[0];i<=r[1];i++){const d=document.createElement('div');d.className='n'+(off.has(i)?' off':'')+(won.includes(i)?' won':'');d.textContent=i;d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-pressed',off.has(i));d.onclick=()=>toggle(i);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(i)}};g.appendChild(d)}}
function toggle(i){off.has(i)?off.delete(i):off.add(i);syncText();refresh()}
function stat(){const r=range();if(!r){$('stat').textContent='Intervalo inválido.';return}const t=r[1]-r[0]+1,o=[...off].filter(n=>n>=r[0]&&n<=r[1]).length;$('stat').textContent=`${t} números no total, ${o} de fora, ${pool().length} disponíveis.`}
function hist(){const h=$('hist');if(!won.length){h.innerHTML='<li style="list-style:none;color:var(--mute)">Nenhum sorteio ainda.</li>';return}h.innerHTML=won.map(n=>`<li>${n}</li>`).join('')}
function refresh(){drawGrid();stat();hist();save()}
$('apply').onclick=()=>{off=parse($('ex').value);refresh()};
$('clear').onclick=()=>{off=new Set();syncText();refresh()};
$('reset').onclick=()=>{won=[];$('display').innerHTML='<span class="hint">Pronto para sortear</span>';refresh()};
$('min').onchange=$('max').onchange=refresh;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText([...off].sort((a,b)=>a-b).join(', '));$('copy').textContent='Copiado';setTimeout(()=>$('copy').textContent='Copiar excluídos',1500)}catch(e){$('ex').select()}};
$('go').onclick=()=>{
 if(busy)return;
 const p=pool(),q=Math.max(1,parseInt($('qty').value)||1);
 if(!p.length){$('display').innerHTML='<span class="hint">Não há números disponíveis.</span>';return}
 const n=Math.min(q,p.length),picks=[];
 for(let i=0;i<n;i++){const k=Math.floor(rng()*p.length);picks.push(p.splice(k,1)[0])}
 const all=pool(),d=$('display');
 d.className=n>1?'small':'';busy=true;$('go').disabled=true;
 let t=0;const iv=setInterval(()=>{
  d.innerHTML=Array.from({length:n},()=>`<span>${all[Math.floor(Math.random()*all.length)]}</span>`).join('');
  if(++t>=22){clearInterval(iv);won.push(...picks);d.innerHTML=picks.map(x=>`<span class="w">${x}</span>`).join('');busy=false;$('go').disabled=false;refresh()}
 },70)};
function setAdmin(s){$('exbox').classList.toggle('hidden',!s);$('gridcard').classList.toggle('hidden',!s)}
$('tog').onclick=()=>setAdmin(false);
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='e'){e.preventDefault();setAdmin($('exbox').classList.contains('hidden'))}});
let taps=0,tt;document.querySelector('h1').addEventListener('click',()=>{taps++;clearTimeout(tt);tt=setTimeout(()=>taps=0,2000);if(taps>=5){taps=0;setAdmin(true)}});
load();syncText();refresh();
