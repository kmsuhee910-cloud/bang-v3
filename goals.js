'use strict';
// Trial features are independent; no user settings or persistence are added.
window.BangGoalsOptions = {typing: true};
window.BangGoals = ctx => {
  const {el, img, go} = ctx;
  const names = {sheriff:'보안관',deputy:'부관',outlaw:'무법자',renegade:'배신자'};
  const units = [
    {id:'intro',title:'게임 목표',notice:true,text:['뱅 팀은 게임 목표를 먼저 읽기로 했어요! 다른 사람에게 읽는 시간을 가진 후에 보드게임에 들어가자 제안하세요.']},
    {id:'concept',title:'게임 전체 컨셉',art:'concept',text:['이 게임은 카드로 하는 마피아 게임입니다.','카드를 뽑아 자신의 역할을 정한 뒤, 속고 속이면서 자신의 승리를 이끌어냅시다!']},
    {id:'role1',title:'역할1',art:'all',text:['역할별로 이기는 방법은 다 다른데요, 그 방법을 알아봅시다.']},
    {id:'role2',title:'역할2',art:'teams',text:['우선 보안관, 부관은 경찰팀이라고 생각하면 쉽습니다','무법자는 마피아 같은 거죠','배신자는 새로운 캐릭터네요, 무법자팀은 아닙니다!']},
    {id:'role3-1',title:'보안관팀',art:'police',text:['보안관팀을 알아봅시다.']},
    {id:'role3-2',title:'보안관팀',art:'police-attack',text:['보안관 팀은 무법자와 배신자를 모두 죽이면 이겨요!']},
    {id:'role3-3',title:'보안관팀',art:'sheriff-falls',text:['보안관이 죽으면 둘 다 바로 패배하니 꼭 살아남으세요!']},
    {id:'role3-4',title:'보안관팀',art:'deputy-wins',text:['부관은 목숨을 바쳐서라도 보안관을 지켜야겠죠?\n\n보안관이 무법자와 배신자를 모두 죽이면, 부관은 죽은 상태에서도 이기게 됩니다!']},
    {id:'role4-1',title:'무법자',art:'outlaw',text:['이제 무법자를 알아보아요!']},
    {id:'role4-2',title:'무법자',art:'outlaw-attack',text:['무법자는 보안관만 죽이면 이깁니다! 무슨 수를 써서라도 보안관을 죽이세요']},
    {id:'role5-1',title:'배신자',art:'renegade',text:['배신자는 뭘까요?']},
    {id:'role5-2',title:'배신자',art:'alone',text:['배신자는 자신 혼자만 살아남아야 해요! 무법자도 적입니다!']},
    {id:'role5-3',title:'배신자',art:'order',text:['주의할 점은 다른 사람이 남아 있을 때 보안관이 먼저 죽어버리면 무법자의 승리입니다!','부관인 척하면서 보안관을 지키다가 마지막에 죽이세요.']},
    {id:'outro',title:'게임 목표',notice:true,text:['이기는 방법은 메뉴나 하단 바에서 찾을 수 있어요. 그럼 굿 럭!']}
  ];
  let lastInput = -Infinity;
  function screen(id='intro',part='0') {
    const index = Math.max(0, units.findIndex(unit=>unit.id===id));
    const unit = units[index];
    const step = Math.max(0,Math.min(unit.text.length-1,Number(part)||0));
    const text = unit.text[step];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const options = window.BangGoalsOptions;
    let disposed=false, typing=false, typed=0;
    const pending = new Set(), motionTimers = new Set();
    const later = (fn,delay,motion=false) => {
      const timer=setTimeout(()=>{pending.delete(timer);motionTimers.delete(timer);if(!disposed)fn();},delay);
      pending.add(timer);if(motion)motionTimers.add(timer);return timer;
    };
    let typingTimer;
    const stops = [], finals = [];
    const card = (id,dead=false,cls='') => {
      const picture=img(id,`${names[id]} 카드`);
      picture.setAttribute('decoding','sync');
      return el('figure',{class:'v3-role '+cls,'data-role':id,'data-dead':String(dead)},
        el('div',{class:'v3-card-face'},picture,el('span',{class:'v3-cross','aria-hidden':'true'})),
        el('figcaption',{},names[id]));
    };
    const kill = node => {node.setAttribute('data-dead','true');node.setAttribute('aria-label',`${names[node.getAttribute('data-role')]} 탈락`);};
    const group = (...cards) => el('div',{class:'v3-role-group'},cards);
    const arrow = () => el('span',{class:'v3-diagram-arrow','aria-hidden':'true'},'→');
    const svgIcon = (viewBox,cls,label,parts) => {
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      for(const [key,value] of Object.entries({viewBox,class:cls,role:'img','aria-label':label}))svg.setAttribute(key,value);
      for(const [tag,attrs] of parts){
        const node=document.createElementNS(ns,tag);
        for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
        svg.append(node);
      }
      return svg;
    };
    const crown = (label='보안관과 탈락한 부관 함께 승리') => svgIcon('0 0 64 48','v3-crown',label,[
      ['path',{d:'M10 12 22 23 32 7 42 23 54 12 49 36H15Z',fill:'none',stroke:'currentColor','stroke-width':3,'stroke-linejoin':'round'}],
      ['path',{d:'M16 42h32',fill:'none',stroke:'currentColor','stroke-width':3,'stroke-linecap':'round'}]
    ]);
    const skull = () => {
      return svgIcon('0 0 88 100','v3-skull','보안관팀 패배',[
        ['path',{d:'M17 56C8 46 10 23 20 14 30 4 58 4 68 14c10 9 12 32 3 42l-9 7v19c0 8-36 8-36 0V63Z',fill:'currentColor'}],
        ['path',{d:'M20 36c1-10 19-12 20-2 1 9-5 15-11 14-7-1-10-5-9-12Zm48 0c-1-10-19-12-20-2-1 9 5 15 11 14 7-1 10-5 9-12ZM44 48l-6 13h12Z',fill:'#30251f'}],
        ['path',{d:'M29 72h30M35 72v13m9-13v15m9-15v13',fill:'none',stroke:'#30251f','stroke-width':2.5,'stroke-linecap':'round'}],
        ['path',{d:'m11 83 66 12m-66 0 66-12',stroke:'currentColor','stroke-width':6,'stroke-linecap':'round'}]
      ]);
    };
    const gun = () => {
      return svgIcon('0 0 128 92','v3-revolver','총',[
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
      ]);
    };
    function attack(left,right,teamVictory=false) {
      const weapon=el('div',{class:'v3-weapon'},gun());
      const result=el('div',{class:'v3-team-victory','data-visible':'false'},crown());
      const allies=group(...left);
      if(left.length===2)allies.className+=' v3-stacked-team';
      const row=el('div',{class:'v3-battle','data-phase':'ready',role:'group','aria-label':teamVictory?'탈락한 부관도 보안관과 함께 승리':'오른쪽 역할들이 탈락하는 예시'},allies,weapon,group(...right));
      const final=()=>{row.setAttribute('data-phase','done');right.forEach(kill);if(teamVictory)result.setAttribute('data-visible','true');};
      finals.push(final);
      stops.push(()=>row.setAttribute('data-phase','done'));
      later(()=>row.setAttribute('data-phase','raising'),160,true);
      later(()=>{right.forEach(kill);row.setAttribute('data-phase','hit');},850,true);
      later(final,1200,true);
      return el('div',{class:'v3-battle-wrap'+(teamVictory?' v3-deputy-battle':'')},row,teamVictory?result:null);
    }
    function orderRow(win) {
      const renegade=card('renegade',false,'v3-viewpoint'),outlaw=card('outlaw'),sheriff=card('sheriff');
      const badge=el('span',{class:'v3-outcome','data-visible':'false'},win?crown('배신자 승리'):el('span',{lang:'en'},'lose'));
      const row=el('section',{class:'v3-order-row','data-result':win?'win':'lose','aria-label':`배신자 ${win?'승리':'패배'} 예시`},
        el('div',{class:'v3-order-cards'},renegade,outlaw,sheriff,arrow(),badge));
      const final=()=>{if(win)kill(outlaw);kill(sheriff);badge.setAttribute('data-visible','true');};
      finals.push(final);
      if(win){later(()=>kill(outlaw),400,true);later(()=>kill(sheriff),1000,true);later(()=>badge.setAttribute('data-visible','true'),1350,true);}
      else{later(()=>kill(sheriff),450,true);later(()=>badge.setAttribute('data-visible','true'),850,true);}
      return row;
    }
    function art() {
      switch(unit.art){
        case 'all':case 'teams': {
          const police=group(card('sheriff'),card('deputy'));
          const outlaw=card('outlaw'),renegade=card('renegade');
          if(unit.art==='teams'){
            const target=step===0?police:step===1?outlaw:renegade;
            target.setAttribute('data-highlight','true');finals.push(()=>target.setAttribute('data-settled','true'));
          }
          return el('div',{class:'v3-role-grid'},police,group(outlaw,renegade));
        }
        case 'police':return el('div',{class:'v3-police-pair'},card('sheriff'),card('deputy'));
        case 'police-attack':return attack([card('sheriff'),card('deputy')],[card('outlaw'),card('renegade')]);
        case 'deputy-wins':return attack([card('sheriff'),card('deputy',true)],[card('outlaw'),card('renegade')],true);
        case 'sheriff-falls':return el('div',{class:'v3-fall'},card('sheriff',true),arrow(),skull());
        case 'outlaw':case 'renegade':return el('div',{class:'v3-single'},card(unit.art));
        case 'outlaw-attack':return attack([card('outlaw')],[card('sheriff')]);
        case 'alone':return el('div',{class:'v3-alone'},card('renegade',false,'v3-survivor'),el('div',{class:'v3-fallen-roles'},card('sheriff',true),card('deputy',true),card('outlaw',true)));
        case 'order':return el('div',{class:'v3-order'},orderRow(step===1));
        default:return null;
      }
    }
    const illustration=el('div',{class:'v3-illustration','data-art':unit.art||'notice'},art());
    const reserve=el('span',{class:'v3-text-reserve','aria-hidden':'true'},text);
    const visible=el('span',{class:'v3-typed','aria-hidden':'true'},'');
    // Assistive technology reads one complete sentence, never a stream of letters.
    const speech=el('p',{class:'v3-speech'},reserve,visible,el('span',{class:'sr-only'},text));
    function finishMotion() {
      for(const timer of motionTimers){clearTimeout(timer);pending.delete(timer);}motionTimers.clear();
      stops.forEach(fn=>fn());finals.forEach(fn=>fn());
    }
    function complete(manual=false) {
      clearTimeout(typingTimer);pending.delete(typingTimer);typing=false;visible.textContent=text;
      if(manual){
        finishMotion();
      }
    }
    function target(i,s=0){go(`goals/${units[i].id}/${s}`);}
    function advance(event) {
      event.preventDefault();event.stopPropagation();
      if(disposed||event.repeat||Date.now()-lastInput<300)return;
      lastInput=Date.now();
      if(typing){complete(true);return;}
      if(step<unit.text.length-1)target(index,step+1);
      else if(index<units.length-1)target(index+1);
      else go('menu');
    }
    function previous(event) {
      event.preventDefault();event.stopPropagation();
      if(disposed||Date.now()-lastInput<300)return;lastInput=Date.now();
      if(step>0)target(index,step-1);else if(index>0)target(index-1,units[index-1].text.length-1);
    }
    const next=el('button',{type:'button',class:'v3-next','aria-label':unit.notice?(unit.id==='intro'?'하셨나요? 다음으로':'메뉴로 이동'):'글 완성 또는 다음 설명',onclick:advance},
      unit.id==='intro'?el('span',{},'하셨나요? 다음으로'):null,el('span',{'aria-hidden':'true'},'→'));
    const box=el('section',{class:'v3-speech-box'},speech,el('div',{class:'v3-controls'},unit.notice?null:el('button',{type:'button',class:'v3-previous','aria-label':'이전 목표 설명',onclick:previous},'←'),next));
    // A listener-free copy of the real menu; only the underlay is blurred.
    const menu=ctx.menuBackdrop().cloneNode(true);
    for(const node of menu.querySelectorAll('[id],[data-scene]')){node.removeAttribute('id');node.removeAttribute('data-scene');}
    for(const node of menu.querySelectorAll('.source-note'))node.remove();
    const backdrop=el('div',{class:'v3-goals-backdrop',inert:true,'aria-hidden':'true'},menu);
    const root=el('div',{class:`app-shell v3-goals${unit.notice?' v3-goals-notice':''}${unit.art==='concept'?' v3-concept':''}`,'data-goal':unit.id,'data-unit':step,'aria-label':unit.title},backdrop,
      el('main',{id:'main',tabindex:'-1',class:'v3-goals-main'},illustration,box));
    if(unit.notice||!options.typing||reduced){complete();if(reduced)finishMotion();}
    else {
      const graphemes=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(text.normalize('NFC'))].map(x=>x.segment):Array.from(text.normalize('NFC'));
      typing=true;
      const write=()=>{if(disposed)return;visible.textContent=graphemes.slice(0,++typed).join('');if(typed<graphemes.length)typingTimer=later(write,35);else typing=false;};
      typingTimer=later(write,35);
    }
    ctx.dispose(()=>{disposed=true;for(const timer of pending)clearTimeout(timer);pending.clear();motionTimers.clear();});
    return root;
  }
  return {screen};
};
