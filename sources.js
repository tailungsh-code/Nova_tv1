const DEF=[['morocco','القنوات المغربية'],['arab','القنوات العربية'],['news','القنوات الإخبارية'],['sports','القنوات الرياضية'],['movies','الأفلام والمسلسلات'],['kids','قنوات الأطفال'],['docs','القنوات الوثائقية'],['fun','القنوات الترفيهية'],['religion','القنوات الدينية'],['intl','القنوات الدولية'],['other','قنوات أخرى']].map(([id,name])=>({id,name,icon:''}));
const ALIAS=[['news|اخبار','news'],['sport|رياض','sports'],['movie|film|series|فيلم|افلام|مسلسل','movies'],['kid|cartoon|اطفال','kids'],['doc|وثائق','docs'],['relig|islam|quran|دين|قران','religion'],['entertain|music|ترفيه|منوع','fun'],['morocc|maroc|مغرب','morocco'],['arab|عرب','arab']];
const hsh=s=>{let h=5381;for(const c of s)h=((h*33)^c.charCodeAt(0))>>>0;return h.toString(36)};
const host=u=>{try{return new URL(u).host}catch(e){return u}};
const sg=()=>S.g('src',[]),sd=()=>S.g('srcdata',{});
const icn=k=>IC[k.icon]?k.icon:IC[k.id]?k.id:'other';
function m3u(t){const out=[];let m=null;
 for(const l of t.split(/\r?\n/)){const s=l.trim(),at=r=>(s.match(r)||[])[1]||'';
  if(/^#EXTINF/i.test(s)){const c=at(/tvg-country="([^"]*)"/i);m={name:s.split(',').slice(1).join(',').trim(),logo:at(/tvg-logo="([^"]*)"/i),category:at(/group-title="([^"]*)"/i),country:/^[A-Za-z]{2}$/.test(c)?c:''}}
  else if(s&&s[0]!='#'&&m){out.push({...m,streamUrl:s});m=null}}
 return out}
function mapCat(x){x=norm(x);const k=Src.base.categories.find(k=>k.id==x||norm(k.name)==x);if(k)return k.id;const a=ALIAS.find(([r])=>new RegExp(r).test(x));return a?a[1]:'other'}

const Src={
 base:{categories:[],channels:[]},
 merge(){const u=Object.values(sd()).flat(),b=Src.base;return clean({categories:b.categories.length?b.categories:DEF,channels:[...b.channels,...u]})},
 parse(t,s){const T=t.trim();let a;
  if(T[0]=='{'||T[0]=='['){const j=JSON.parse(T);a=Array.isArray(j)?j:j.channels}else if(/#EXTINF/i.test(T))a=m3u(T);else throw 1;
  if(!Array.isArray(a))throw 1;
  const o=a.filter(c=>c&&typeof c=='object').map(c=>({...c,id:'u'+hsh(s.id+(c.streamUrl||c.id||'')),category:s.cat=='*'?mapCat(c.category):s.cat,featured:false}));
  if(!clean({channels:o}).channels.length)throw 2;return o},
 async fetch(s){const r=await fetch(s.url,{cache:'no-store'});if(!r.ok)throw 0;return Src.parse(await r.text(),s)},
 async sync(){
  const l=sg().filter(s=>s.t=='list');let bad=0;
  if(l.length&&navigator.onLine){const d=sd();
   await Promise.all(l.map(async s=>{try{d[s.id]=await Src.fetch(s)}catch(e){bad++}}));
   S.s('srcdata',d)}
  else if(l.length)bad=l.length;
  D=Src.merge();if(bad)toast('تعذر تحديث '+bad+' من روابطك، بقيت النسخة المحفوظة')},
 async add(cat,mode,url,name,logo){
  url=url.trim();if(!/^https?:\/\//i.test(url))throw new Error('الرابط يجب أن يبدأ بـ https://');
  if(cat=='*')mode='list';
  const s={id:'s'+hsh(cat+url+Date.now()),cat,url,t:mode,name:name.trim()},d=sd();
  if(mode=='one'){if(!s.name)throw new Error('اكتب اسم القناة.');d[s.id]=[{id:'u'+hsh(s.id),name:s.name,logo:logo.trim(),country:'',category:cat,streamUrl:url}]}
  else{try{d[s.id]=await Src.fetch(s)}catch(e){throw new Error('تعذرت قراءة القائمة. تأكد أن الرابط صحيح وأنه قائمة M3U أو JSON، وأن الموقع يسمح بقراءتها من المتصفح (CORS).')}}
  S.s('src',[...sg(),s]);S.s('srcdata',d);D=Src.merge();return d[s.id].length},
 view(){
  const src=sg(),d=sd();
  const row=s=>`<div class="sr"><div><b>${esc(s.t=='one'?s.name:host(s.url))}</b><small>${s.t=='one'?'قناة واحدة':'قائمة'} · ${(d[s.id]||[]).length} قناة</small></div><button data-a="s_del" data-id="${s.id}" aria-label="حذف">${ic('trash')}</button></div>`;
  const box=(id,name,icon,desc)=>{const l=src.filter(s=>s.cat==id);return`<div class="sc"><div class="sh"><span class="si">${ic(icon)}</span><div><b>${esc(name)}</b><small>${desc}${l.length?' · '+l.length+' رابط':''}</small></div><button class="pb" data-a="s_new" data-id="${esc(id)}" aria-label="إضافة إلى ${esc(name)}">${ic('plus')}</button></div>${l.map(row).join('')}</div>`};
  return`<section><h2>إضافة القنوات</h2><p class="upd">أضف رابط قائمة قنوات (M3U أو JSON) أو قناة واحدة. تُحفظ على هذا الجهاز فقط. أضف روابط تملك حق استخدامها أو تبثها جهتها مجاناً.</p>`
  +box('*','رابط شامل لكل القنوات','link','يوزّع القنوات على التصنيفات تلقائياً')
  +D.categories.map(k=>box(k.id,k.name,icn(k),'قائمة أو قناة واحدة')).join('')+'</section>'},
 dlg(cat){
  const k=cat=='*'?{name:'الرابط الشامل'}:D.categories.find(c=>c.id==cat)||{name:cat};
  const o=$('#dlg');if(o)o.remove();
  document.body.insertAdjacentHTML('beforeend',`<div id="dlg" data-cat="${esc(cat)}" data-mode="list"><div class="bx"><h3>إضافة إلى: ${esc(k.name)}</h3>${cat=='*'?'':'<div class="seg"><button data-a="s_mode" data-id="list" class="on">قائمة قنوات</button><button data-a="s_mode" data-id="one">قناة واحدة</button></div>'}<input id="du" type="url" dir="ltr" placeholder="https://..." autocomplete="off"><input id="dn" placeholder="اسم القناة" hidden><input id="dl" type="url" dir="ltr" placeholder="رابط الشعار (اختياري)" hidden><p class="upd" id="dh">الصق رابط قائمة M3U أو JSON.</p><p class="err" id="de" hidden></p><div class="fl"><button class="bt" data-a="s_save">حفظ</button><button class="bt ghost" data-a="s_close">إلغاء</button></div></div></div>`)},
 async act(a,id,t){
  const w=$('#dlg');
  if(a=='s_new')Src.dlg(id);
  else if(a=='s_close')w.remove();
  else if(a=='s_mode'){const one=id=='one';w.dataset.mode=id;$('#dn').hidden=$('#dl').hidden=!one;$('#dh').textContent=one?'الصق رابط البث المباشر (m3u8 أو mp4).':'الصق رابط قائمة M3U أو JSON.';w.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.id==id))}
  else if(a=='s_save'){const e=$('#de');e.hidden=true;t.disabled=true;t.textContent='جارٍ الحفظ…';
   try{const n=await Src.add(w.dataset.cat,w.dataset.mode,$('#du').value,$('#dn').value,$('#dl').value);w.remove();toast('تمت إضافة '+n+' قناة');draw(1)}
   catch(x){e.textContent=x.message||'تعذر الحفظ.';e.hidden=false;t.disabled=false;t.textContent='حفظ'}}
  else if(a=='s_del'){if(!t.dataset.sure){t.dataset.sure=1;t.classList.add('on');toast('اضغط مرة أخرى للحذف');return}
   S.s('src',sg().filter(s=>s.id!=id));const d=sd();delete d[id];S.s('srcdata',d);D=Src.merge();draw(1)}}
};
