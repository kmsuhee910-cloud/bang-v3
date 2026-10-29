/* V2 scenes illustrate rules. Only arrow/navigation buttons change scenes. */
'use strict';
window.BangHealth=(el,img,life,character='lucky',compact=false,width=48)=>{
  const count=Math.max(0,Math.min(5,life));
  const reveal=count?0.08+count*0.16:0;
  const cardHeight=width*640/452,pairHeight=cardHeight*(1+reveal);
  const planes=el('div',{class:'health-planes'},img('character-back','','health-back'),img(character,'','health-front'));
  planes.style.width=`${width}px`;planes.style.height=`${cardHeight}px`;
  planes.children[1].style.top=`${reveal*100}%`;
  const pair=el('div',{class:'health-pair'},planes);
  pair.style.width=`${width}px`;pair.style.height=`${pairHeight}px`;
  const marker=el('div',{class:`health-marker${compact?' horizontal':''}`,role:'img','data-health':count,'data-front-offset':reveal,'aria-label':`인물 카드로 총알 ${count}개가 보이게 표시한 체력`},pair);
  if(compact){marker.style.width=`${pairHeight}px`;marker.style.height=`${width}px`;pair.style.transform=`translateX(${pairHeight}px) rotate(90deg)`;}
  return marker;
};

window.BangTutorial=ctx=>{
 const L=window.BangLesson,D=window.BangData,{el,img}=ctx;
 const names=new Map([...D.roles,...D.people,...D.cards].map(c=>[c.id,c.name]));
 const routes=new Map([...D.roles.map(c=>[c.id,`entry/roles/${c.id}`]),...D.people.map(c=>[c.id,`entry/people/${c.id}`]),...D.cards.map(c=>[c.id,`entry/cards/${c.id}`]),['playing-back','component/cards'],['role-back','component/roles'],['character-back','component/people'],['bullet-token','component/bullets']]);
 const link=(text,route)=>el('button',{type:'button',class:'v2-inline-link',onclick:()=>route.startsWith('learn/')?ctx.openRule(route):ctx.go(route)},text);
 const card=(asset,cls='',interactive=true)=>{
  const picture=img(asset,`${names.get(asset)||'카드'} 예시`,cls);
  if(!interactive||!routes.has(asset))return picture;
  return el('button',{type:'button',class:'v2-image-link',onclick:()=>ctx.go(routes.get(asset)),'aria-label':`${names.get(asset)||'카드'} 설명 보기`},picture);
 };
 function bullets(count){return el('div',{class:'v2-bullets','data-bullets':count,'aria-label':`총알 ${count}개`},Array.from({length:count},()=>el('span',{class:'v2-token-frame'},card('bullet-token','v2-token'))));}
 const group=(label,...children)=>el('div',{class:'v2-example-group'},label?el('strong',{},label):null,...children);
 const arrow=()=>el('span',{class:'v2-transfer-arrow','aria-hidden':'true'},'→');
 const fan=(count,asset='playing-back')=>{const node=el('div',{class:'v2-card-fan','data-card-count':count},Array.from({length:count},()=>card(asset)));node.style.setProperty('--fan-width',count<=2?'50%':count===3?'37%':'28%');return node;};
 const mini=assets=>el('div',{class:'v2-mini-cards'},assets.map(asset=>card(asset)));
 const pile=(asset='playing-back')=>el('div',{class:'v2-pile','aria-label':asset==='character-back'?'인물 카드 더미':'게임 카드 더미'},Array.from({length:3},()=>card(asset)));
 const transfer=(from,to)=>el('div',{class:'v2-transfer'},from,arrow(),to);
 const overlap=(assets,cls='')=>{
  const node=el('div',{class:`v2-overlap ${cls}`,'data-card-count':assets.length});node.style.setProperty('--layers',assets.length-1);
  assets.forEach((asset,i)=>{const layer=el('div',{class:'v2-overlap-layer'},card(asset));layer.style.left=`${i*8}px`;node.append(layer);});return node;
 };
 function missedSymbol(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 85 100 75');svg.setAttribute('class','v2-missed-symbol');svg.setAttribute('role','img');svg.setAttribute('aria-label','요약 카드의 빗나감 기호');
  const source=document.createElementNS('http://www.w3.org/2000/svg','image');source.setAttribute('href','media/summary.png');source.setAttribute('width','640');source.setAttribute('height','387');svg.append(source);return svg;
 }
 const discardZones=(keepLabel,keepAssets)=>el('div',{class:'v2-card-zones'},
  el('div',{class:'v2-card-zone keep'},el('strong',{},keepLabel),el('div',{class:'v2-zone-cards '+(keepAssets.length>1?'v2-placed-cards':'v2-reveal-cards')},...keepAssets.map(asset=>card(asset)))),
  el('div',{class:'v2-card-zone discard'},el('strong',{},'버릴 카드'),el('div',{class:'v2-zone-cards v2-discard-cards'},mini(['bang','beer','remington','barrel']))));
 function person(label,cls=''){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 48 56');svg.setAttribute('aria-hidden','true');
  const head=document.createElementNS('http://www.w3.org/2000/svg','circle');head.setAttribute('cx','24');head.setAttribute('cy','14');head.setAttribute('r','10');
  const body=document.createElementNS('http://www.w3.org/2000/svg','path');body.setAttribute('d','M6 52V43a18 18 0 0 1 36 0v9Z');svg.append(head,body);
  return el('div',{class:`v2-person ${cls}`},svg,el('strong',{},label));
 }
 function circle(n,options={}){
  const alive=Array.from({length:n},(_,i)=>i).filter(i=>i!==options.eliminated);
  const ring=el('div',{class:`v2-distance-ring${options.table?' v3-distance-diagram':''}`,'data-participants':n});
  if(options.table)ring.append(el('div',{class:'v3-distance-table','aria-hidden':'true'}));
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','v2-ring-lines');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  const points=Array.from({length:n},(_,i)=>{const angle=Math.PI/2+i*Math.PI*2/n;return {x:50+38*Math.cos(angle),y:50+37*Math.sin(angle)};});
  if(options.level){
   for(let i=0;i<n;i++){
    if(i===options.eliminated)continue;
    const j=alive[(alive.indexOf(i)+1)%alive.length],a=points[i],b=points[j];
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),padding=Math.min(15,len/2-1);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    for(const [k,v]of Object.entries({'data-from':i,'data-to':j,x1:a.x+dx/len*padding,y1:a.y+dy/len*padding,x2:b.x-dx/len*padding,y2:b.y-dy/len*padding,stroke:'#b08e75','stroke-width':.6}))line.setAttribute(k,v);
    svg.append(line);
   }
  }
  ring.append(svg);
  points.forEach((point,i)=>{
   const distance=L.distanceBetween(0,i,alive),dead=i===options.eliminated;
   const shown=true;
   const reachable=options.highlight!==false&&i!==0&&!dead&&(options.level?distance===options.level:options.allTargets||options.range&&distance<=options.range);
   const node=el('div',{class:`v2-seat${reachable?' reachable':''}${dead?' out':''}`,'data-seat':i,'data-distance':distance??'out','data-reachable':String(!!reachable)},
    person(i===0?'나':''),el('small',{},dead?'탈락':i===0?'':`거리 ${distance}`));
   node.style.left=`${point.x}%`;node.style.top=`${point.y}%`;ring.append(node);
  });
  if(options.guns)for(const i of [1,n-1]){
   const gun=el('div',{class:'v3-distance-gun','aria-hidden':'true'},distanceGun());
   gun.style.left=`${(points[0].x+points[i].x)/2}%`;gun.style.top=`${(points[0].y+points[i].y)/2}%`;
   gun.style.setProperty('--gun-direction',i===1?-1:1);ring.append(gun);
  }
  ring.append(el('span',{class:'v2-ring-center'},options.eliminated!==undefined?'살아 있는 사람만 세어요':options.allTargets?'나를 제외한 모두':options.range?(options.range===1?'기본 사거리':`사거리 ${options.range}\n테두리 안: 공격 가능`):'' ));
  return ring;
 }
 function distanceGun(){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 128 92');svg.setAttribute('aria-hidden','true');
  // Reuse the revolver paths already used in the V3 role guide.
  const parts=[
   ['path',{d:'m29 27-9-14 5-4 16 16',fill:'#d9cbb9',stroke:'#30251f','stroke-width':2}],
   ['path',{d:'M52 15h67v5H52Z',fill:'#d9cbb9',stroke:'#30251f','stroke-width':2}],
   ['path',{d:'M60 20h63v13H59Z',fill:'#fff7eb',stroke:'#30251f','stroke-width':2}],
   ['path',{d:'M114 14v-4h6v6m-1 6v9M68 26h45',fill:'none',stroke:'#30251f','stroke-width':2}],
   ['path',{d:'M26 28h38v20l-7 12H43l-6-10H25Z',fill:'#d9cbb9',stroke:'#30251f','stroke-width':2}],
   ['rect',{x:36,y:22,width:29,height:25,rx:7,fill:'#fff7eb',stroke:'#30251f','stroke-width':2}],
   ['path',{d:'M43 27v14m7-14v14m7-14v14',stroke:'#776657','stroke-width':2,'stroke-linecap':'round'}],
   ['path',{d:'M46 49c25-4 26 21-1 15m7-14c-1 7 1 9 4 9',fill:'none',stroke:'#fff7eb','stroke-width':2.5,'stroke-linecap':'round'}],
   ['path',{d:'M25 44h18l-6 32c-1 7-8 9-16 6L9 76Z',fill:'#776657',stroke:'#fff7eb','stroke-width':2}],
   ['path',{d:'m26 52 6 2m-8 5 6 2m-8 5 6 2m-8 5 6 2',stroke:'#30251f','stroke-width':2,'stroke-linecap':'round'}],
   ['circle',{cx:29,cy:47,r:2.5,fill:'#fff7eb'}]
  ];
  for(const [tag,attrs]of parts){const node=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);svg.append(node);}return svg;
 }
 function searchIcon(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
  const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx','10');circle.setAttribute('cy','10');circle.setAttribute('r','6');
  const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d','M15 15L21 21');
  svg.append(circle,line);return svg;
 }
 function navigationIcon(kind){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
  const shapes={
   'chevron-right':[['path',{d:'m8 5 7 7-7 7'}]],
   'chevron-left':[['path',{d:'m16 5-7 7 7 7'}]],
   'chevron-down':[['path',{d:'m5 8 7 7 7-7'}]],
   cards:[['path',{d:'M10 5H2v17h12v-8'}],['circle',{cx:17,cy:6.5,r:4}],['path',{d:'m20 9.5 3 3.5'}]],
   menu:[['path',{d:'M2 5h7M2 12h7M2 19h7'}],['circle',{cx:17,cy:10,r:4}],['path',{d:'m20 13 2 3'}]],
   goals:[['path',{d:'m3 6 5 5 4-8 4 8 5-5-2 13H5ZM6 22h12'}]],
   toc:[['path',{d:'M3 5h18M3 12h18M3 19h18'}]],
   pin:[['path',{d:'M12 23S4 15 4 9a8 8 0 1 1 16 0c0 6-8 14-8 14Z',fill:'currentColor'}],['circle',{cx:12,cy:9,r:3,fill:'var(--panel)'}]]
  };
  for(const [tag,attrs] of shapes[kind]){const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);svg.append(node);}
  return svg;
 }
 let lockedUntil=0;
 function navigation(active=''){
  return el('footer',{class:'v3-rules-footer'},el('nav',{class:'v3-rules-bar','aria-label':'게임 규칙 바로가기'},
   el('button',{type:'button',class:`v2-card-search${active==='hint'?' highlighted':''}`,'aria-label':active==='search'?'카드 검색 닫기':'카드 검색 열기','aria-pressed':String(active==='search'),onclick:()=>ctx.togglePanel('card-search')},navigationIcon('cards'),el('span',{},'카드 검색')),
   el('button',{type:'button','aria-label':'메뉴 열기',onclick:()=>ctx.go('menu')},navigationIcon('menu'),el('span',{},'메뉴')),
   el('button',{type:'button','aria-label':active==='goals'?'이기는 법 닫기':'이기는 법 보기','aria-pressed':String(active==='goals'),onclick:()=>ctx.togglePanel('rule-goals')},navigationIcon('goals'),el('span',{},'이기는 법'))));
 }
 function screen(id,options={}){
  const learning=ctx.learning(),n=learning.playerCount||4;
  let sequence=L.scenes(n).filter(s=>s.id!=='search-tip'||!learning.seenSearchHint||id==='search-tip');
  const reference=id==='goals';
  const index=sequence.findIndex(s=>s.id===id),scene=options.exampleOnly?(L.cardScenes.find(s=>s.id===id)||sequence[index]||(reference?L.goalScene:null)):reference?L.goalScene:sequence[index];if(!scene)return null;
  if(id==='search-tip'){learning.seenSearchHint=true;ctx.persist();}
  const example=L.example(id,n),same=sequence.filter(s=>s.chapter===scene.chapter),step=same.findIndex(s=>s.id===id)+1;
  const title=options.exampleOnly?'':reference?'이기는 법':L.chapters.find(c=>c[0]===scene.chapter)[1],section=reference?null:L.groupFor(id);const grouped=L.groups[scene.chapter];
  const returnInfo=ctx.ruleReturn(),shortcut=!!returnInfo&&(returnInfo.chapter?returnInfo.chapter===section?.chapter:returnInfo.group===section?.name);
  let disposed=false;
  const pending=new Set();
  const schedule=(fn,ms)=>{const timer=setTimeout(()=>{pending.delete(timer);if(!disposed)fn();},ms);pending.add(timer);};
  function move(offset){if(Date.now()<lockedUntil)return;const next=sequence[index+offset];if(!next)return;lockedUntil=Date.now()+250;ctx.go(`learn/${next.id}`);}
  const chapterIndex=L.chapters.findIndex(([key])=>key===scene.chapter);
  function moveChapter(offset){
   if(Date.now()<lockedUntil)return;
   const chapter=L.chapters[chapterIndex+offset];if(!chapter)return;
   const next=sequence.find(item=>item.chapter===chapter[0]);if(!next)return;
   lockedUntil=Date.now()+250;ctx.go(`learn/${next.id}`);
  }
  const roleCounts=D.roleSetups[n];
  function sorting(kind){
   const step=['sort-roles','sort-people','sort-game'].indexOf(kind),backs=['role-back','character-back','playing-back'];
   const boxes=el('div',{class:'v3-sort-zones'},['역할카드','인물카드','게임카드'].map((name,i)=>el('div',{class:'v3-sort-zone','data-zone':i,'data-filled':String(i<step)},el('strong',{},name),card(backs[i],'',false))));
   const roles=['sheriff','deputy','outlaw','renegade'].filter(role=>roleCounts[role]);
   let assets=step===0?roles.flatMap(id=>Array(roleCounts[id]).fill(id)):step===1?['kit']:['bang','remington'];
   const stage=el('div',{class:`v3-sort-stage v3-sort-stage-${step}`},assets.map((asset,i)=>{
    const front=el('div',{class:'v3-sort-front'},card(asset,'',false));
    const back=el('div',{class:'v3-sort-back'},card(backs[step],'',false));
    const item=el('div',{class:'v3-sort-card','data-card':asset},front,back);
    item.style.setProperty('--i',i);item.style.setProperty('--count',assets.length);
    if(step===0){item.style.setProperty('--role-x',`${(roles.indexOf(asset)+.5)/roles.length*100}%`);item.style.setProperty('--role-copy',assets.slice(0,i).filter(id=>id===asset).length);}
    return item;
   }));
   if(step===0){
    stage.style.setProperty('--role-groups',roles.length);
    stage.append(el('div',{class:'v3-sort-counts'},roles.map(role=>el('strong',{},`${names.get(role)} ${roleCounts[role]}장`))));
   }
   const root=el('div',{class:'v3-sort-example','data-sort-step':step,'data-phase':step===0?'back':'front'},stage,boxes);root.style.setProperty('--zone-shift',`${(step-1)*33}%`);
   const finish=()=>{root.setAttribute('data-phase','stored');boxes.children[step].setAttribute('data-filled','true');};
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
   else{
    if(step===0){
     schedule(()=>root.setAttribute('data-phase','front'),1000);
     schedule(()=>root.setAttribute('data-phase','spread'),2000);
     schedule(()=>root.setAttribute('data-phase','gather'),3000);
     schedule(()=>root.setAttribute('data-phase','back-again'),4000);
     schedule(finish,5000);
    }else{
     schedule(()=>root.setAttribute('data-phase','back-again'),1000);
     schedule(finish,2000);
    }
   }
   return root;
  }
  function summaryExample(){
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','140 420 160 160');svg.setAttribute('aria-hidden','true');
   const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.setAttribute('href','media/beer.png');image.setAttribute('width','452');image.setAttribute('height','640');svg.append(image);
   return el('div',{class:'v3-summary-example'},el('div',{class:'v3-summary-card'},card('beer'),el('div',{class:'v3-summary-magnifier'},svg)),arrow(),card('summary'));
  }
  function goals(){return el('div',{class:'v2-role-goals'},D.roles.map(r=>{
   const text=D.roleGoals[r.id],splitAt=r.id==='outlaw'?text.indexOf(' 단,'):r.id==='renegade'?text.indexOf(' 다른'): -1;
   const primary=splitAt<0?text:text.slice(0,splitAt),extra=splitAt<0?'':text.slice(splitAt).trim();
   return el('article',{class:'v2-goal'},card(r.id),el('div',{},el('h3',{},link(r.name,`entry/roles/${r.id}`),options.hideCounts?'':` · ${roleCounts[r.id]}명`),el('p',{},el('strong',{class:'v2-goal-primary'},primary),extra?el('span',{class:'v2-goal-extra'},extra):null)));
  }));}
  function prepBoard(count=0,showPerson=true){
   const stage=el('div',{class:'v2-prep-board'},img('board','보드'),el('div',{class:'v2-prep-slot role'},card('sheriff')),
    showPerson?el('div',{class:'v2-prep-slot character'},card('lucky')):null);
   for(let i=0;i<count;i++){const token=el('div',{class:'v2-prep-token'},card('bullet-token'));token.style.left=`${[13,32,50,69,88][i]}%`;stage.append(token);}return stage;
  }
  function brownExample(){
   const moving=el('div',{class:'v3-brown-moving'},card('bang'));
   const area=el('div',{class:'v3-brown-example','data-arrived':'false'},
    group('사용하기',el('div',{class:'v3-brown-origin'})),
    group('버린카드/사용한카드 더미',el('div',{class:'v3-brown-zone'})),moving);
   const arrive=()=>area.setAttribute('data-arrived','true');
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)arrive();else schedule(arrive,500);
   return area;
  }
  function illustration(){
   switch(scene.kind){
    case 'turn-overview':return el('ol',{class:'v3-turn-overview'},['첫째, 카드 두 장 가져오기','둘째, 원하는 카드 원하는 만큼 사용하기','셋째, 넘치는 카드 사용하거나 버리기'].map(text=>el('li',{class:'v2-caution'},el('h3',{class:'v2-subtitle'},text))));
    case 'summary':return summaryExample();
    case 'sort-roles':case 'sort-people':case 'sort-game':return sorting(scene.kind);
    case 'board':{
     const board=el('div',{class:'v2-labelled-board'},img('board','역할·인물·무기 카드와 총알을 놓는 보드'),...['역할','인물','무기'].map((label,i)=>el('span',{class:`v2-board-label slot-${i}`},label)));
     return board;
    }
    case 'sheriff':return el('div',{class:'v2-prep-composition'},card('sheriff'));
    case 'roles':return el('div',{class:'v2-roles-v1'},el('div',{class:'v2-role-pictures'},D.roles.filter(r=>roleCounts[r.id]).map(r=>group(`${r.name} ${roleCounts[r.id]}명`,overlap(Array(roleCounts[r.id]).fill(r.id),'v2-role-stack')))),el('div',{class:'v3-pile-zone'},card('role-back')));
    case 'goals':return goals();
    case 'character':return el('div',{class:'v2-character-example'},el('div',{class:'v3-pile-zone v3-character-back-zone'},pile('character-back')),arrow(),group('',card('lucky'),el('strong',{class:'v2-image-caption'},'공개하고 능력을 읽어요')));
    case 'bullets':return el('div',{class:'v2-prep-composition'},el('div',{class:'v2-prep-token-row'},el('div',{class:'v3-life-card'},card('lucky'),el('span',{class:'v3-life-ring','aria-hidden':'true'})),bullets(4)));
    case 'bonus':return el('div',{class:'v2-prep-composition'},el('div',{class:'v2-prep-token-row'},card('sheriff'),bullets(1)));
    case 'deck':return el('div',{class:'v2-deck-pair'},group('가져올 카드 자리',pile()),group('버린카드/사용한카드 자리',el('div',{class:'v2-discard-space v3-discard-space'},'버리거나 사용한 카드는 한 곳에 모아요.')));
    case 'deal':return el('div',{class:'v2-starting-cards'},bullets(5),el('span',{class:'v2-transfer-arrow','aria-hidden':'true'},'↓'),fan(5));
    case 'ready':return el('div',{class:'v2-ready-icon'},person('보안관'),el('span',{},'→ 시계 방향'));
    case 'draw':return transfer(group('카드 더미',pile()),group('가져온 카드 두 장',fan(2)));
    case 'search-tip':return el('div',{class:'v2-search-tip-mark'},el('span',{'aria-hidden':'true'},'↓'),el('strong',{},'하단 바의 돋보기 + 카드 검색'));
    case 'use':return el('div',{class:'v3-use-example'},el('div',{class:'v3-turn-types'},
     group('갈색 카드',card('bang'),el('span',{class:'v3-card-type-caption'},'스킬')),
     el('div',{class:'v3-turn-blue-types'},el('strong',{},'파란 카드'),el('div',{class:'v3-turn-blue-columns'},
      group('',card('barrel'),el('span',{class:'v3-card-type-caption'},'스킬')),
      group('',card('remington'),el('span',{class:'v3-card-type-caption'},'무기'))))),
     el('p',{class:'v3-use-caption'},'뒤에서 카드마다 사용법을 간단히 알려줄게요!'));
    case 'brown':return brownExample();
    case 'blue':return el('div',{class:'v3-skill-placement'},el('div',{class:'v3-board-surround'},img('board','게임보드'),el('div',{class:'v3-skill-slot'},card('barrel','v2-arrived'))));
    case 'weapon-type':return el('div',{class:'v2-prep-board v3-turn-weapon-board'},img('board','게임보드의 무기 칸'),el('div',{class:'v2-prep-slot v3-turn-weapon-slot'},card('remington','v2-arrived')));
    case 'discard':return el('div',{class:'v2-discard-example'},bullets(3),transfer(fan(5),fan(3)));
    case 'turn-done':return el('div',{class:'v2-ready-icon'},person('나'),arrow(),person('다음 사람'));
    case 'distance':{if(options.exampleOnly)return circle(n,{level:scene.level,table:true});let level=learning.distanceLevels?.[id]||scene.level;const area=el('div',{class:'v2-distance-tap',role:'button',tabindex:'0','aria-label':'다음 거리 예시 보기'});const update=()=>{area.replaceChildren(circle(n,{level,table:true}));requestAnimationFrame(fitLines);};const advance=()=>{level=level%Math.floor(n/2)+1;learning.distanceLevels={...(learning.distanceLevels||{}),[id]:level};ctx.persist();update();};area.addEventListener('click',advance);area.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();advance();}});update();return area;}
    case 'range':return circle(n,{range:1,table:true,guns:true});
    case 'gatling':return el('div',{},transfer(card('gatling'),group('나를 제외한 모두',el('div',{class:'v2-crowd'},person(''),person(''),person('')),el('div',{class:'v2-token-delta'},'−1',bullets(1)))));
    case 'attack':return el('div',{},transfer(card('bang'),group('상대',person(''),el('div',{class:'v2-token-delta'},'−1',bullets(1)))));
    case 'volcanic':return transfer(el('div',{class:'v2-prep-board v3-turn-weapon-board'},img('board','볼캐닉을 장착한 게임보드'),el('div',{class:'v2-prep-slot v3-turn-weapon-slot'},card('volcanic'))),overlap(['bang','bang','bang'],'v2-bang-stack'));
    case 'weapon-range':{const ring=circle(n,{range:2,table:true}),center=ring.querySelector('.v2-ring-center');center.className+=' v2-range-weapon';center.replaceChildren(card('schofield'),el('strong',{},'사거리 2'));return ring;}
    case 'defend':return el('div',{class:'v3-defense-pair'},['bang','gatling'].map(asset=>el('div',{class:'v2-defense-stack'},el('div',{class:'v2-attacking-card'},card(asset),el('span',{class:'v2-attack-card-label'},asset==='bang'?'상대가 낸 뱅':'상대가 낸 기관총')),el('div',{class:'v2-blocking-card'},card('missed')))));
    case 'barrel':return el('div',{class:'v2-barrel-example'},transfer(group('앞에 놓인 술통',card('barrel')),group('뒤집은 카드 · 하트 10',el('div',{class:'v2-judgment'},card('beer'),el('span',{},'♥ 하트')))),el('div',{class:'v2-blocked-symbol'},el('span',{class:'v2-transfer-arrow','aria-hidden':'true'},'↓'),missedSymbol(),el('strong',{},'막음')));
    case 'barrel-fail':return transfer(group('',el('p',{},'판정 실패 → 판정 카드는 버려요')),group('이어서 빗나감 사용',card('missed','v2-arrived')));
    case 'damage':return el('div',{},transfer(group('공격받기 전 · 총알 4개',bullets(4)),group('막지 못한 뒤 · 총알 3개',bullets(3))),group('내려놓은 총알 1개',bullets(1)));
    case 'beer':return transfer(card('beer'),group('',person('나'),el('div',{class:'v2-token-delta'},'+1',bullets(1))));
    case 'beer-limits':return el('div',{class:'v2-limit-example'},group('맥주',card('beer')),el('div',{},el('p',{},'내 차례: 사용 가능'),el('p',{},'다른 사람 차례: 마지막 총알을 잃는 순간만'),el('strong',{},'생존자 2명: 효과 없음')));
    case 'saloon':return transfer(card('saloon'),group('나를 포함한 모두',el('div',{class:'v2-crowd'},person(''),person(''),person('')),el('div',{class:'v2-token-delta'},'+1',bullets(1))));
    case 'eliminate':return transfer(group('',el('strong',{},'총알 0개'),el('div',{class:'v3-empty-bullet-board'},img('board','총알 토큰이 하나도 없는 게임보드'),el('span',{class:'v3-empty-bullet-zone','aria-hidden':'true'}))),group('탈락',el('span',{class:'v2-zero'},'×')));
    case 'eliminated':return discardZones('공개한 카드',['outlaw']);
    case 'closer':return circle(n,{level:Math.floor(n/2),eliminated:1,table:true,highlight:false});
    case 'penalty':return discardZones('유지할 카드',['sheriff','lucky']);
    case 'reward':return el('div',{},group('탈락한 무법자',card('outlaw','v2-small-card')),transfer(group('카드 더미에서',pile()),group('탈락시킨 사람에게 3장',fan(3))));
    case 'outlaws-win':case 'renegade-win':case 'sheriff-win':{
     const winners=id==='outlaws-win'?['outlaw']:id==='renegade-win'?['renegade']:n===4?['sheriff']:['sheriff','deputy'];
     return el('div',{class:'v2-winners'},winners.map(role=>group(`${names.get(role)} 승리`,card(role),el('p',{},D.roleGoals[role]))));
    }
    case 'complete':return group('게임 중에는 메뉴에서 다시 찾아보세요',el('button',{type:'button',class:'primary',onclick:()=>ctx.go('menu')},'메뉴로'),el('button',{type:'button',class:'primary v3-player-reselect',onclick:()=>ctx.go('setup')},'인원선택'));
   }
  }
  if(options.exampleOnly){const example=el('div',{class:'v2-illustration v3-card-rule-example','data-card-example':id},illustration());if(pending.size)ctx.dispose(()=>{disposed=true;for(const timer of pending)clearTimeout(timer);pending.clear();});return example;}
  const prev=el('button',{type:'button',class:'v2-scene-arrow','aria-label':'이전 장면',disabled:index===0,onclick:()=>move(-1)},'‹');
  const next=el('button',{type:'button',class:'v2-scene-arrow','aria-label':'다음 장면',disabled:index===sequence.length-1||!!scene.action,onclick:()=>move(1)},'›');
  const announcement=['ready','search-tip','turn-done','distance-done','loss-done','complete'].includes(id);
  const usedLinks=new Set();
  function rich(text){
   const parts=[text];
   for(const [name,route]of scene.links||[]){
    if(!route.startsWith('entry/'))continue;
    const at=parts.findIndex(part=>typeof part==='string'&&part.includes(name));if(at<0)continue;
    const part=parts[at],start=part.indexOf(name);parts.splice(at,1,part.slice(0,start),link(name,route),part.slice(start+name.length));usedLinks.add(route);
   }
   return parts;
  }
  const titleParts=id==='defend'?rich(scene.title):[scene.title];
  const descriptionParts=id==='sort-roles'
   ?scene.text.split(/((?:보안관|부관|무법자|배신자) \d+장)/u).map(part=>/^(?:보안관|부관|무법자|배신자) \d+장$/u.test(part)?el('span',{class:'v3-role-count-emphasis'},part):part)
   :rich(scene.text);
  const description=scene.text&&id!=='search-tip'?el('p',{class:'v2-scene-description'},...descriptionParts):null;
  const warning=scene.warning?el('aside',{class:'v2-caution'},el('span',{'aria-hidden':'true'},'!'),el('p',{},...rich(scene.warning))):null;
  const related=(scene.links||[]).filter(([,route])=>!usedLinks.has(route));
  const relatedPanel=related.length?el('div',{class:'v2-related'},related.map(([name,route])=>link(name,route))):null;
  const below=['character','deal','use','brown','weapon-type','range','weapon-range','volcanic','beer','eliminate','reward','barrel'].includes(id)||scene.kind==='distance';
  const art=(['ready','search-tip','turn-done','distance-done','loss-done'].includes(id)||scene.kind==='section-intro')?null:el('div',{class:'v2-illustration','data-example':id},illustration());
  if(id==='reward'&&art&&relatedPanel)art.append(relatedPanel);
  const panel=el('section',{class:'v2-scene-panel'+(scene.kind==='section-intro'?' v2-section-intro':'')},
   el('div',{class:'v2-title-bar'},reference?null:prev,el('h2',{},...titleParts),reference?null:['turn-done','distance-done','loss-done','complete'].includes(id)?el('span',{'aria-hidden':'true'}):next),
   ['summary','board','attack','gatling','defend','beer','saloon'].includes(id)?el('h3',{class:'v2-subtitle'},{summary:'요약카드',board:'게임보드',attack:'뱅 카드',gatling:'기관총',defend:'빗나감',beer:'맥주',saloon:'주점'}[id]):null,
   description,warning,
   below?null:relatedPanel,art,
   below&&id!=='reward'?relatedPanel:null,
   id==='roles'?el('div',{class:'v3-goals-hint'},el('p',{},'역할별 이기는 법은 하단 바에서 볼 수 있어요.'),el('span',{'aria-hidden':'true'},'↓')):null,
   scene.action?el('button',{type:'button',class:'primary v2-transition',onclick:()=>ctx.go(`learn/${scene.action[1]}`)},scene.action[0]):null);
  let root,drawer=null,disposeDrawer=()=>{};
  function skip(){
   if(drawer){drawer.querySelector('button').focus({preventScroll:true});return;}
   const opener=document.activeElement;
   const hidden=[...root.children].filter(node=>node.getAttribute('inert')===null);
   const oldOverflow=document.body.style.overflow;
   const close=()=>{
    if(!drawer)return;
    drawer.remove();drawer=null;disposeDrawer=()=>{};
    for(const node of hidden){node.removeAttribute('inert');node.removeAttribute('aria-hidden');}
    document.body.style.overflow=oldOverflow;
    if(!disposed)opener?.focus?.({preventScroll:true});
   };
   const jump=target=>{close();const intro='intro-'+target;ctx.go(`learn/${sequence.some(s=>s.id===intro)?intro:target}`);};
   const sections=[];
   const overlay=el('div',{class:'v2-modal-backdrop v3-toc-backdrop'},el('section',{class:'v2-skip-dialog v3-toc-drawer',role:'dialog','aria-modal':'true','aria-label':'게임 규칙 목차'},
    el('div',{class:'v2-dialog-heading'},el('h2',{},'목차'),el('button',{type:'button',class:'filter v3-toc-close',onclick:close,'aria-label':'목차 닫기'},navigationIcon('chevron-right'))),
    el('nav',{'aria-label':'게임 규칙 단계'},L.chapters.map(([key,name],i)=>{
     const items=key==='prepare'?L.groups.prepare.filter(([,ids])=>!ids.includes('bonus')&&!ids.includes('deck')).map(([label,ids])=>ids.includes('deal')?['게임 카드',['deal','deck','ready']]:[label,ids]):L.groups[key],active=key===scene.chapter;
     let details;
     const summary=el('summary',{'aria-expanded':String(active),onclick:event=>{
      event.preventDefault();
      const open=details.getAttribute('open')===null;
      for(const other of sections){other.removeAttribute('open');other.firstElementChild.setAttribute('aria-expanded','false');}
      if(open){details.setAttribute('open','');summary.setAttribute('aria-expanded','true');}
     }},el('span',{class:'v3-toc-marker','aria-hidden':'true'},navigationIcon('pin')),el('span',{class:'v3-toc-title'},el('small',{},`Step ${i+1}`),el('strong',{class:'v2-chapter-title'},name)),el('span',{class:'v3-toc-chevron','aria-hidden':'true'},navigationIcon('chevron-down')));
     details=el('details',{class:'v3-toc-chapter',open:active,'data-chapter':key},summary,...items.map(([label,ids])=>el('button',{type:'button',class:'v2-skip-item','aria-current':ids.includes(id)?'step':'false',onclick:()=>jump(ids[0])},label)));
     sections.push(details);return details;
    }))));
   drawer=overlay;disposeDrawer=close;
   for(const node of hidden){node.setAttribute('inert','');node.setAttribute('aria-hidden','true');}
   document.body.style.overflow='hidden';
   root.append(overlay);const dialog=overlay.firstElementChild;
   overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
   overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){
     const buttons=[...dialog.querySelectorAll('button,summary')].filter(node=>node.offsetParent!==null),first=buttons[0],last=buttons[buttons.length-1];
     if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
   });
   dialog.querySelector('button').focus({preventScroll:true});
  }
  root=el('div',{class:`app-shell v2-learning v3-rules${reference?' v3-reference-goals':''}${scene.dark?' v2-dark':''}${announcement?' v2-announcement':''}`,'data-player-count':n},
   shortcut?el('header',{class:'v3-rule-return-header'},el('button',{type:'button','aria-label':'바로가기 전 설명으로 돌아가기',onclick:ctx.returnFromRule},'‹ 뒤로가기')):reference||announcement||scene.kind==='section-intro'?null:el('header',{class:'v2-learning-header v3-rules-header'},
    el('div',{class:'v3-chapter-navigation'},
     el('button',{type:'button',class:'v3-chapter-arrow','aria-label':'이전 챕터',disabled:chapterIndex===0,onclick:()=>moveChapter(-1)},navigationIcon('chevron-left')),
     el('div',{class:'v2-step-label'},el('strong',{},`${title} ${section.index+1}/${section.total}`),el('div',{class:'v2-progress','aria-label':`${title} ${section.total}개 중 ${section.index+1}번째`},grouped.map((s,i)=>el('span',{class:i<=section.index?'active':''})))),
     el('button',{type:'button',class:'v3-chapter-arrow','aria-label':'다음 챕터',disabled:chapterIndex===L.chapters.length-1,onclick:()=>moveChapter(1)},navigationIcon('chevron-right'))),
    el('button',{type:'button',class:'v2-skip-button v3-toc-trigger','aria-label':'목차 열기',onclick:skip},'목차',navigationIcon('toc'))),
   el('main',{id:'main',tabindex:'-1',class:'v2-learning-main','data-scene':id},panel),
   navigation(reference?'goals':id==='search-tip'?'hint':''));
  if(id==='search-tip'){
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','v3-search-guide');svg.setAttribute('aria-hidden','true');
   for(const cls of ['v3-search-guide-line','v3-search-guide-head']){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('class',cls);svg.append(path);}root.append(svg);
  }
  root.style.setProperty('--role-card-width',`${(86+(n-1)*9)/n}%`);
  function fitLines(){
   if(disposed)return;
   const guide=root.querySelector('.v3-search-guide');
   if(guide){
    const source=panel.querySelector('h2')?.getBoundingClientRect(),target=root.querySelector('.v2-card-search')?.getBoundingClientRect();
    if(source?.width&&target?.width){
     const sx=source.left+source.width/2,sy=source.bottom-8,ex=target.left+target.width/2,ey=target.top-12,bend=Math.max(0,(ey-sy)*.55);
     guide.querySelector('.v3-search-guide-line').setAttribute('d',`M${sx} ${sy} C${sx} ${sy+bend} ${ex} ${ey-bend} ${ex} ${ey}`);
     guide.querySelector('.v3-search-guide-head').setAttribute('d',`M${ex-9} ${ey-13} L${ex} ${ey} L${ex+9} ${ey-13}`);
    }
   }
   const ring=root.querySelector('.v2-distance-ring');if(!ring)return;
   const bounds=ring.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
   const seats=[...ring.querySelectorAll('.v2-seat')];
   for(const line of ring.querySelectorAll('line')){
    const a=seats.find(seat=>String(seat.getAttribute('data-seat'))===String(line.getAttribute('data-from')))?.getBoundingClientRect();
    const b=seats.find(seat=>String(seat.getAttribute('data-seat'))===String(line.getAttribute('data-to')))?.getBoundingClientRect();if(!a||!b)continue;
    const ax=a.left+a.width/2,ay=a.top+a.height/2,bx=b.left+b.width/2,by=b.top+b.height/2,dx=bx-ax,dy=by-ay;
    const edge=rect=>Math.min(dx?(rect.width/2+7)/Math.abs(dx):Infinity,dy?(rect.height/2+7)/Math.abs(dy):Infinity);
    const start=edge(a),end=edge(b);line.style.opacity=start+end>=1?'0':'1';
    if(start+end>=1)continue;
    for(const [key,value]of Object.entries({x1:(ax+dx*start-bounds.left)/bounds.width*100,y1:(ay+dy*start-bounds.top)/bounds.height*100,x2:(bx-dx*end-bounds.left)/bounds.width*100,y2:(by-dy*end-bounds.top)/bounds.height*100}))line.setAttribute(key,value);
   }
  }
  const resize=()=>requestAnimationFrame(fitLines);window.addEventListener('resize',resize);requestAnimationFrame(fitLines);
  if(id==='search-tip')window.addEventListener('scroll',resize,{passive:true});
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(root);
  ctx.dispose(()=>{disposed=true;for(const timer of pending)clearTimeout(timer);pending.clear();disposeDrawer();observer?.disconnect();window.removeEventListener('resize',resize);if(id==='search-tip')window.removeEventListener('scroll',resize);});return root;
 }
 return {screen,navigation,icon:navigationIcon,cardExample:(id,options={})=>screen(id,{...options,exampleOnly:true})};
};
