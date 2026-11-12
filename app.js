const CFG={URL:'channels.json',VER:'1.1.0'};
const S={g(k,d){try{const x=localStorage.getItem('nova_'+k);return x==null?d:JSON.parse(x)}catch(e){return d}},s(k,x){try{localStorage.setItem('nova_'+k,JSON.stringify(x))}catch(e){}}};
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
let D={categories:[],channels:[]},state='loading',lists={},favs=S.g('fav',[]),rec=S.g('rec',[]),vw=S.g('views',{}),hl=S.g('health',{}),tt;

function clean(d){
 if(!d||!Array.isArray(d.channels))throw new Error('bad');
 const ids=new Set(),str=x=>typeof x=='string'?x.trim():'',url=x=>/^https?:\/\//i.test(str(x))?str(x):'',img=x=>/^(javascript|data):/i.test(str(x))?'':str(x);
 const ch=d.channels.map(c=>c&&typeof c=='object'?{id:str(c.id),name:str(c.name),logo:img(c.logo),country:str(c.country).toUpperCase(),category:str(c.category)||'other',streamUrl:url(c.streamUrl),backupUrl:url(c.backupUrl),epgUrl:url(c.epgUrl),featured:c.featured===true}:null)
  .filter(c=>c&&c.id&&c.name&&c.streamUrl&&!ids.has(c.id)&&ids.add(c.id));
 const cats=(Array.isArray(d.categories)?d.categories:[]).filter(c=>c&&c.id&&c.name).map(c=>({id:String(c.id),name:String(c.name),icon:str(c.icon)}));
 ch.forEach(c=>{if(!cats.some(k=>k.id==c.category))cats.push({id:c.category,name:c.category})});
 return{version:str(d.version),categories:cats,channels:ch}
}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2800)}
async function load(manual){
 state='loading';draw(1);
 try{
  if(!navigator.onLine)throw 0;
  const r=await fetch(CFG.URL+(CFG.URL.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw 0;
  Src.base=clean(await r.json());S.s('data',Src.base);S.s('upd',Date.now());state='ok';
  if(manual){hl={};S.s('health',hl);toast('تم تحديث القنوات')}
 }catch(e){
  try{Src.base=clean(S.g('data',null));state='ok';toast('تعذر التحديث، تم استخدام آخر قائمة محفوظة')}catch(_){state=S.g('src',[]).length?'ok':'err'}
 }
 await Src.sync();draw(1)
}
const cn=id=>(D.categories.find(c=>c.id==id)||{name:id}).name;
const ctry=c=>{if(!/^[A-Z]{2}$/.test(c))return c;let n=c;try{n=new Intl.DisplayNames(['ar'],{type:'region'}).of(c)}catch(e){}return String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0)))+' '+n};
const ini=n=>n.split(/\s+/).slice(0,2).map(w=>[...w][0]).join('').toUpperCase();
const logo=c=>`<div class="lg"><span>${esc(ini(c.name))}</span>${c.logo?`<img src="${esc(c.logo)}" alt="" loading="lazy" onerror="this.remove()">`:''}</div>`;
const upd=()=>{const t=S.g('upd',0);return t?new Date(t).toLocaleString('ar'):'لم يتم بعد'};
const byId=id=>D.channels.find(c=>c.id==id);
const card=c=>{const h=hl[c.id];return`<article class="card" data-a="play" data-id="${esc(c.id)}">${logo(c)}<button class="fav${favs.includes(c.id)?' on':''}" data-a="fav" data-id="${esc(c.id)}" aria-label="المفضلة">${ic('heart')}</button><h3>${esc(c.name)}</h3><p>${esc(ctry(c.country))}</p><p>${esc(cn(c.category))}</p><span class="st ${h||''}">${h=='ok'?'● مباشر':h=='bad'?'لا يعمل':'لم تُفحص بعد'}</span></article>`};
const grid=(k,a,cls)=>{lists[k]=a;return`<div class="${cls||'grid'}" data-list="${k}">${a.map(card).join('')}</div>`};
const sec=(t,h)=>`<section><h2>${t}</h2>${h}</section>`;
const empty=(t,p,a,b)=>`<div class="em"><h3>${t}</h3><p>${p}</p>${a?`<button class="bt" data-a="${a}">${b}</button>`:''}</div>`;

const V={
 home(){
  const A=D.channels;
  if(!A.length)return empty('لا توجد قنوات بعد','أضف روابط قنوات مصرّحاً ببثها، أو عدّل ملف channels.json ثم اضغط تحديث.','goSrc','إضافة قنوات');
  const f=A.filter(c=>c.featured),r=rec.map(byId).filter(Boolean).slice(0,10),m=A.filter(c=>vw[c.id]).sort((a,b)=>vw[b.id]-vw[a.id]).slice(0,10);
  return`<div class="hero" data-a="live"><span class="lv">مباشر</span><h1>شاهد القنوات المباشرة</h1><p>${A.length} قناة في القائمة</p><button class="bt">ابدأ المشاهدة</button></div>
  <p class="upd">آخر تحديث: ${upd()} <button data-a="refresh" class="lk">تحديث</button></p>`
  +(f.length?sec('القنوات المميزة',grid('f',f,'hs')):'')
  +(r.length?sec('شوهدت مؤخراً',grid('r',r,'hs')):'')
  +sec('التصنيفات',`<div class="chips">${D.categories.filter(k=>A.some(c=>c.category==k.id)).map(k=>`<a href="#cat/${encodeURIComponent(k.id)}">${esc(k.name)}</a>`).join('')}</div>`)
  +(m.length?sec('الأكثر مشاهدة',grid('m',m,'hs')):'')
  +sec('كل القنوات',grid('a',A))
 },
 cats(){return sec('التصنيفات',D.categories.length?`<div class="tiles">${D.categories.map(k=>`<a class="tile" href="#cat/${encodeURIComponent(k.id)}"><b>${esc(k.name)}</b><small>${D.channels.filter(c=>c.category==k.id).length} قناة</small></a>`).join('')}</div>`:empty('لا توجد تصنيفات',''))},
 cat(id){const a=D.channels.filter(c=>c.category==id);return sec(esc(cn(id)),a.length?grid('c',a):empty('لا توجد قنوات في هذا التصنيف',''))},
 fav(){const a=favs.map(byId).filter(Boolean);return sec('المفضلة',a.length?grid('fv',a):empty('لا توجد قنوات مفضلة','اضغط على القلب في أي قناة لإضافتها هنا.'))},
 recent(){const a=rec.map(byId).filter(Boolean);return sec('آخر المشاهدات',a.length?grid('rc',a):empty('لم تشاهد أي قناة بعد','القنوات التي تشاهدها ستظهر هنا.'))},
 search(){const cs=[...new Set(D.channels.map(c=>c.country).filter(Boolean))];
  return`<div class="sb" style="margin-top:12px"><input id="q" type="search" placeholder="ابحث عن قناة بالعربية أو الإنجليزية" autocomplete="off"><div class="fl"><select id="fc"><option value="">كل التصنيفات</option>${D.categories.map(k=>`<option value="${esc(k.id)}">${esc(k.name)}</option>`).join('')}</select><select id="fn"><option value="">كل الدول</option>${cs.map(c=>`<option value="${esc(c)}">${esc(ctry(c))}</option>`).join('')}</select></div></div><div id="res"></div>`},
 settings(){const t=S.g('theme','dark');
  return sec('الإعدادات',`<div class="set"><h4>المظهر</h4><div class="seg">${[['dark','داكن'],['amoled','أسود كامل'],['light','فاتح']].map(([k,n])=>`<button data-a="theme" data-id="${k}" class="${t==k?'on':''}">${n}</button>`).join('')}</div>
  <h4>القنوات</h4><p class="upd">آخر تحديث: ${upd()}<br>عدد القنوات: ${D.channels.length}</p><button class="bt" data-a="refresh">تحديث قائمة القنوات</button>
  <h4>البيانات</h4><button class="bt ghost" data-a="clr" data-id="rec">مسح سجل المشاهدة</button> <button class="bt ghost" data-a="clr" data-id="fav">مسح المفضلة</button>
  <h4>التطبيق</h4><p class="upd">الإصدار ${CFG.VER}</p><div class="chips"><a href="#sources">إضافة القنوات</a><a href="#about">حول التطبيق</a><a href="#privacy">سياسة الخصوصية</a></div></div>`)},
 sources(){return Src.view()},
 about(){return sec('حول التطبيق','<p class="tx">NOVA TV مشغّل قنوات يعرض البث المجاني والمصرّح به فقط. تُدار القنوات وروابطها من ملف channels.json ويمكن تحديثها دون إعادة بناء التطبيق.<br>لا يتجاوز التطبيق أنظمة الحماية DRM ولا القيود الجغرافية، لذلك قد لا تعمل بعض الروابط.</p>')},
 privacy(){return sec('سياسة الخصوصية','<p class="tx">لا يجمع NOVA TV أي بيانات شخصية. تُحفظ المفضلة وسجل المشاهدة والإعدادات على جهازك فقط، ويمكنك مسحها من الإعدادات.<br>عند تشغيل قناة يتصل جهازك بخادم الجهة التي تبثها، وتخضع بياناتك هناك لسياسة تلك الجهة.</p>')}
};
function bindSearch(){
 const f=()=>{const q=norm($('#q').value.trim()),c=$('#fc').value,n=$('#fn').value;
  const a=D.channels.filter(x=>(!c||x.category==c)&&(!n||x.country==n)&&(!q||norm(x.name+' '+cn(x.category)+' '+ctry(x.country)).includes(q)));
  $('#res').innerHTML=a.length?grid('s',a):empty('لا توجد نتائج','جرّب كلمة أخرى أو غيّر التصنيف.')};
 ['#q','#fc','#fn'].forEach(s=>{$(s).oninput=$(s).onchange=f});f();$('#q').focus()
}
function draw(keep){
 const [v,a]=(location.hash.slice(1)||'home').split('/');
 try{
  $('#view').innerHTML=state=='loading'&&!D.channels.length?'<div class="sk"><i></i><i></i><i></i></div>':state=='err'?empty('تعذر تحميل القنوات','تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى.','refresh','إعادة المحاولة'):(V[v]||V.home)(decodeURIComponent(a||''));
  if(state!='err'&&!(state=='loading'&&!D.channels.length)&&v=='search')bindSearch()
 }catch(e){$('#view').innerHTML=empty('حدث خطأ غير متوقع','أعد تحميل الصفحة.','refresh','إعادة المحاولة')}
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go==(v=='cat'?'cats':v||'home')));
 if(!keep)scrollTo(0,0)
}
function toggleFav(id){const k=favs.indexOf(id);k<0?favs.unshift(id):favs.splice(k,1);S.s('fav',favs);
 document.querySelectorAll('.fav[data-id="'+CSS.escape(id)+'"]').forEach(b=>b.classList.toggle('on',k<0));
 if(location.hash.slice(1).split('/')[0]=='fav')draw(1);toast(k<0?'أُضيفت إلى المفضلة':'أُزيلت من المفضلة')}
function recent(c){rec=[c.id,...rec.filter(x=>x!=c.id)].slice(0,30);vw[c.id]=(vw[c.id]||0)+1;S.s('rec',rec);S.s('views',vw)}
function health(id,s){if(hl[id]!=s){hl[id]=s;S.s('health',hl)}}
function theme(){const t=S.g('theme','dark'),b=document.body.classList;b.remove('amoled','light');if(t!='dark')b.add(t)}
window.App={toast,logo,recent,health};

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-a],[data-go]');if(!t||t.closest('#pl'))return;
 if(t.dataset.go){location.hash='#'+t.dataset.go;return}
 const a=t.dataset.a,id=t.dataset.id;
 if(a=='fav')toggleFav(id);
 else if(a=='play'){const l=lists[t.closest('[data-list]').dataset.list];Player.open(l,l.findIndex(c=>c.id==id))}
 else if(a=='live'){const A=D.channels;Player.open(A,A.findIndex(c=>c.featured))}
 else if(a=='refresh')load(true);
 else if(a=='goSrc')location.hash='#sources';
 else if(a&&a.startsWith('s_'))Src.act(a,id,t);
 else if(a=='theme'){S.s('theme',id);theme();draw(1)}
 else if(a=='clr'){
  if(!t.dataset.sure){t.dataset.sure=1;t.textContent='اضغط مرة أخرى للتأكيد';return}
  if(id=='rec'){rec=[];vw={};S.s('rec',rec);S.s('views',vw)}else{favs=[];S.s('fav',favs)}
  toast('تم المسح');draw(1)}
});
(function(){
 document.querySelectorAll('[data-ic]').forEach(b=>{b.innerHTML=ic(b.dataset.ic)});
 $('#tabs').innerHTML=[['home','home','الرئيسية'],['cats','grid','التصنيفات'],['fav','heart','المفضلة'],['recent','clock','المشاهدات']].map(([k,i,n])=>`<button data-go="${k}">${ic(i)}<span>${n}</span></button>`).join('');
 theme();Player.init();
 addEventListener('hashchange',()=>draw());
 addEventListener('popstate',()=>{if(Player.isOpen()){Player.close();draw(1)}});
 addEventListener('online',()=>{if(state!='ok')load()});
 addEventListener('error',()=>{});addEventListener('unhandledrejection',e=>e.preventDefault());
 setTimeout(()=>$('#sp').classList.add('out'),1500);setTimeout(()=>$('#sp').remove(),2100);
 let ok=0;try{Src.base=clean(S.g('data',null));ok=1}catch(e){}D=Src.merge();if(ok||D.channels.length)state='ok';
 draw(1);load()
})();
