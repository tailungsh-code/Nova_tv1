const IC={home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',heart:'M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z',clock:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',gear:'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',back:'M9 5l7 7-7 7',prev:'M9 5l7 7-7 7',next:'M15 5l-7 7 7 7',play:'M7 4l13 8-13 8z',pause:'M7 4h4v16H7zM13 4h4v16h-4z',reload:'M20 12a8 8 0 11-3-6.2M20 4v5h-5',fs:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',vol:'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6',mute:'M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6',plus:'M12 5v14M5 12h14',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',link:'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',morocco:'M12 3l2.6 6.2 6.4.5-4.9 4.2 1.5 6.3L12 16.9 6.4 20.2l1.5-6.3L3 9.7l6.4-.5z',arab:'M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z',news:'M4 5h13v14H4zM17 9h3v8a2 2 0 01-2 2M7 9h7M7 13h7M7 16h4',sports:'M12 3a9 9 0 100 18 9 9 0 000-18zM5.6 5.6c3.5 3 3.5 10.8 0 12.8M18.4 5.6c-3.5 3-3.5 10.8 0 12.8M3 12h18',movies:'M4 5h16v14H4zM10 9l5 3-5 3z',kids:'M12 3a9 9 0 100 18 9 9 0 000-18zM8.5 14.5a4.5 4.5 0 007 0M9 9.5v.5M15 9.5v.5',docs:'M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2 5-5 2 2-5z',fun:'M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zM19 16a3 3 0 11-6 0 3 3 0 016 0z',religion:'M4 20v-7h16v7M7 13a5 5 0 0110 0M12 3v3M2 20h20',intl:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',other:'M5 12h.01M12 12h.01M19 12h.01'};
const ic=n=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="${n=='play'||n=='pause'?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

const Player=(()=>{
const $=id=>document.getElementById(id);
let v,hls,list=[],i=0,bk=false,tries=0,tm,wd,tk=0,ht;
const on=()=>!$('pl').hidden,sh=(id,f)=>{$(id).hidden=!f};
const tg=()=>{$('tg').innerHTML=ic(v.paused?'play':'pause')};
function showCt(){const ct=$('ct');ct.classList.remove('h');clearTimeout(ht);ht=setTimeout(()=>{if(!v.paused)ct.classList.add('h')},3500)}
function clr(){clearTimeout(tm);clearTimeout(wd);if(hls){hls.destroy();hls=null}v.pause();v.removeAttribute('src');v.load()}
function stop(m){clr();sh('ld',0);$('em').textContent=m;sh('er',1)}
function fail(){
 const c=list[i];
 if(tries<4){tries++;const nb=c.backupUrl?!bk:bk;App.toast(nb!==bk?'جارٍ تجربة الرابط الاحتياطي…':'انقطع البث، تتم إعادة الاتصال…');clearTimeout(tm);tm=setTimeout(()=>{if(on())begin(nb)},tries>1?2500:300);return}
 stop('تعذر تشغيل القناة. قد يكون الرابط متوقفاً أو محمياً بـ DRM أو مقيداً بحسب المنطقة.');App.health(c.id,'bad')
}
function begin(b){
 clr();const c=list[i],u=b?c.backupUrl:c.streamUrl,my=++tk;bk=b;sh('er',0);sh('ld',1);
 if(!u)return fail();
 if(!navigator.onLine)return stop('لا يوجد اتصال بالإنترنت. تحقق من الشبكة ثم أعد المحاولة.');
 try{
  if(/\.m3u8(\?|#|$)/i.test(u)&&window.Hls&&Hls.isSupported()){
   hls=new Hls({maxBufferLength:20});
   hls.on(Hls.Events.MANIFEST_PARSED,()=>v.play().catch(()=>{}));
   hls.on(Hls.Events.ERROR,(e,d)=>{if(!d.fatal||my!==tk)return;if(d.type===Hls.ErrorTypes.MEDIA_ERROR&&tries<2){tries++;hls.recoverMediaError()}else fail()});
   hls.loadSource(u);hls.attachMedia(v)
  }else{v.src=u;v.play().catch(()=>{})}
 }catch(e){return fail()}
 wd=setTimeout(()=>{if(my===tk&&v.readyState<3)fail()},20000)
}
function go(n){i=Math.max(0,n);tries=0;const c=list[i];$('pn').textContent=c.name;$('pg').innerHTML=App.logo(c);const e=$('ep');e.hidden=!c.epgUrl;if(c.epgUrl)e.href=c.epgUrl;App.recent(c);begin(false);showCt()}
async function fs(){const p=$('pl');try{if(document.fullscreenElement){await document.exitFullscreen();try{screen.orientation.unlock()}catch(e){}}else{await(p.requestFullscreen||p.webkitRequestFullscreen).call(p);try{await screen.orientation.lock('landscape')}catch(e){}}}catch(e){App.toast('ملء الشاشة غير مدعوم هنا. أدر الهاتف أفقياً يدوياً.')}}
function init(){
 v=$('v');const pl=$('pl');
 v.addEventListener('playing',()=>{clearTimeout(wd);clearTimeout(tm);tries=0;sh('ld',0);sh('er',0);App.health(list[i].id,'ok');tg()});
 v.addEventListener('waiting',()=>{sh('ld',1);clearTimeout(wd);const my=tk;wd=setTimeout(()=>{if(my===tk&&v.readyState<3)fail()},15000)});
 v.addEventListener('canplay',()=>sh('ld',0));
 v.addEventListener('error',()=>{if(!hls&&on())fail()});
 v.addEventListener('ended',()=>{if(!isFinite(v.duration))fail()});
 v.addEventListener('play',tg);v.addEventListener('pause',tg);
 v.addEventListener('timeupdate',()=>{const s=$('sk'),f=isFinite(v.duration)&&v.duration>0;s.hidden=!f;$('lv').hidden=f;if(f)s.value=v.currentTime/v.duration*1000});
 v.addEventListener('volumechange',()=>{$('vol').value=v.muted?0:v.volume;$('mu').innerHTML=ic(v.muted||!v.volume?'mute':'vol')});
 $('sk').oninput=e=>{v.currentTime=e.target.value/1000*v.duration};
 $('vol').oninput=e=>{v.muted=false;v.volume=+e.target.value};
 pl.addEventListener('pointerdown',e=>{const ct=$('ct');if(e.target.closest('#ct button,#ct input,#ct a'))showCt();else if(ct.classList.contains('h'))showCt();else ct.classList.add('h')});
 pl.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const a=b.dataset.p;
  if(a=='back')history.back();
  else if(a=='toggle'){v.paused?v.play().catch(()=>{}):v.pause()}
  else if(a=='next'||a=='prev'){if(list.length>1)go((i+(a=='next'?1:-1)+list.length)%list.length)}
  else if(a=='reload'){tries=0;begin(false)}
  else if(a=='mute')v.muted=!v.muted;
  else if(a=='fs')fs()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&on())v.pause()});
 addEventListener('online',()=>{if(on()&&!$('er').hidden){tries=0;begin(false)}});
 tg();$('mu').innerHTML=ic('vol')
}
return{init,isOpen:on,
 open(l,idx){list=l;$('pl').hidden=false;document.body.classList.add('lock');history.pushState({p:1},'');go(idx)},
 close(){if(!on())return;clr();$('pl').hidden=true;document.body.classList.remove('lock');try{if(document.fullscreenElement)document.exitFullscreen();screen.orientation.unlock()}catch(e){}}}
})();
