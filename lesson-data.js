/* V2: fixed rule illustrations only. No assignment or live game state. */
'use strict';
window.BangLesson=(()=>{
 const chapters=[['prepare','준비하기'],['turn','내 턴에 할 일'],['distance','거리와 사거리'],['loss','탈락·벌칙·보상'],['ending','게임 종료']];
 const groups={prepare:[['요약카드·게임보드',['summary','board']],['카드 구분',['sort-roles','sort-people','sort-game']],['역할 뽑기',['roles']],['보안관 공개',['sheriff']],['인물 뽑기',['character']],['총알 토큰',['bullets']],['보안관 추가 총알',['bonus']],['게임 카드 가져오기',['deal']],['남은 게임 카드',['deck','ready']]],turn:[['카드 두 장 가져오기',['draw','search-tip']],['원하는 카드 원하는 만큼 사용하기',['use','brown','blue','weapon-type']],['넘치는 카드 사용하거나 버리기',['discard','turn-done']]],distance:[['거리',['distance-1','distance-2','distance-3']],['기본 사거리',['range']],['무기 사거리',['weapon-range','distance-done']]],loss:[['탈락',['eliminate','eliminated','closer']],['벌칙: 보안관이 부관을 죽였을 때',['penalty']],['보상: 무법자를 탈락시켰을 때',['reward','loss-done']]],ending:[['무법자 승리',['outlaws-win']],['배신자 승리',['renegade-win']],['보안관팀 승리',['sheriff-win','complete']]]};
 const groupFor=id=>{if(id.startsWith('intro-'))id=id.slice(6);for(const [chapter,items]of Object.entries(groups)){const index=items.findIndex(([,ids])=>ids.includes(id));if(index>=0)return {chapter,index,name:items[index][0],total:items.length};}return null;};
 const scene=(id,chapter,title,text,kind,options={})=>({id,chapter,title,text,kind,...options});
 const common=[
 scene('summary','prepare','각자 요약카드와 게임 보드를 받아요.','카드 아래의 기호를 읽는 데 도움을 주는 설명 카드예요. 카드 하단의 기호와 비교하면서 능력을 간단하게 확인해요.','summary'),
 scene('board','prepare','각자 요약카드와 게임 보드를 받아요.','역할·인물·무기 카드를 놓고, 남은 총알 수를 표시하는 곳이에요.','board'),
 scene('sort-roles','prepare','역할 카드와 인물 카드, 게임 카드를 구분해요.','','sort-roles'),
 scene('sort-people','prepare','역할 카드와 인물 카드, 게임 카드를 구분해요.','인물카드는 뒷면이 총알 모양이에요. 인물 카드도 따로 구분해요.','sort-people'),
 scene('sort-game','prepare','역할 카드와 인물 카드, 게임 카드를 구분해요.','게임카드는 뒷면에 ‘BANG’이 적혀 있어요. 파란 카드와 갈색 카드 구분 없이 따로 한 곳에 모아줘요.','sort-game'),
 scene('roles','prepare','역할 카드를 한 장씩 뽑아요.','아까 구분해놓은 곳에서 뽑아요.','roles',{warning:'뽑은 역할은 자기만 확인해요.'}),
 scene('goals','goals','이기는 법','카드로 하는 마피아 게임이라고 생각하면 쉬워요','goals',{dark:true}),
 scene('sheriff','prepare','보안관만 역할을 공개해요.','','sheriff',{warning:'보안관이 아닌 사람은 공개하지 마세요!'}),
 scene('character','prepare','인물 카드를 한 장씩 뽑고\n모두 공개해요.','다른 사람도 능력을 알 수 있게, 자기 인물의 이름과 능력을 소리 내어 읽어요.','character',{links:[['내 인물 능력 찾아보기','component/people']]}),
 scene('bullets','prepare','인물 카드에 표시된 총알 수만큼\n총알 토큰을 놓아요.','총알은 남은 생명력을 나타내요.','bullets',{warning:'이 총알 수가 내 최대 생명이에요.'}),
 scene('bonus','prepare','보안관은 총알을 하나 더 받아요.','추가된 총알까지 포함해서 보안관의 최대 생명력이 돼요.','bonus'),
 scene('deal','prepare','각자 총알 수만큼 게임 카드를 가져와요.','','deal',{warning:'손에 든 카드는 다른 사람에게 보여주지 마세요!',links:[['게임 카드 설명 찾아보기','component/cards']]}),
 scene('deck','prepare','남은 게임 카드를 중앙에 놓아요.','게임 카드를 섞어 뒷면으로 쌓아요. 옆에는 사용하거나 버린 카드를 놓을 자리를 남겨요.','deck'),
 scene('ready','prepare','이제 준비가 끝났어요.','보안관부터 시계방향으로 시작해요.','ready',{dark:true}),
 scene('draw','turn','카드를 두 장 가져와요.','내 차례마다 카드 더미에서 두 장을 가져와요.\n내 차례 중에는 손에 든 카드가 남은 총알 수보다 많아도 괜찮아요.','draw'),
 scene('search-tip','turn','카드 사용 방법은 여기서 찾아봐요.','하단 바의 카드 검색에서 이름을 찾을 수 있어요. 검색하지 않고 화살표로 넘어가도 돼요.','search-tip',{dark:true}),
 scene('use','turn','원하는 카드를 원하는 만큼 사용해요.','뱅을 제외하고 원하는 만큼 자유롭게 카드를 사용해요. 원한다면 쓰지 않아도 좋아요.','use',{warning:'기본적으로 뱅! 카드는 내 차례에 한 장만 사용할 수 있어요.',links:[['뱅!','entry/cards/bang'],['내가 가진 카드 설명 찾기','component/cards']]}),
 scene('brown','turn','갈색 카드는 1회용이에요.','사용할 때 효과를 적용하고 버려요.','brown',{links:[['갈색 카드 찾아보기','component/cards/brown']]}),
 scene('blue','turn','파란 카드는 장착해서 사용해요.','파란 카드 중 스킬 카드는 게임판 주변에 놓아요. 효과와 버리는 시점은 카드마다 달라요.','blue',{warning:'같은 이름의 카드는 중복해서 장착할 수 없어요. 같은 이름이 아니면 중복해서 장착할 수 있어요.',links:[['파란 카드 찾아보기','component/cards/blue']]}),
 scene('weapon-type','turn','파란 카드 중 무기 카드는 게임보드에 장착해요.','보드의 무기 칸에 놓으며, 아래 숫자는 뱅!을 쓸 수 있는 사거리를 말해요.','weapon-type',{warning:'무기는 한 개만 장착 가능해요.',links:[['뱅!','entry/cards/bang'],['무기 카드 찾아보기','component/cards/weapon'],['거리와 사거리 규칙 알아보기','answer/distance']]}),
 scene('discard','turn','넘치는 카드를 사용하거나 버려요.','손에 든 카드가 지금 남은 총알 수보다 많다면, 지금 남은 총알 수만큼만 남기고 사용하거나 버려요.','discard',{warning:'보드 위 카드는 손에 든 카드 수에 포함하지 않아요.'}),
 scene('turn-done','turn','이렇게 내 차례가 끝나요.','이제 다음 사람 차례예요!','turn-done',{dark:true,action:['거리와 사거리 알아보기','intro-distance-1']}),
 scene('range','distance','사거리 안에 있는 사람에게 뱅!을 사용할 수 있어요.','사거리는 무기의 사거리예요. 즉, 내가 공격할 수 있는 거리예요. 기본은 사거리 1이고, 장착한 무기에 따라 달라질 수 있어요.','range',{links:[['무기카드 검색하기','component/cards/weapon']]}),
 scene('attack','combat','뱅!이나 기관총으로 다른 사람을 공격해요.','뱅!은 무기 사거리 안의 다른 사람 한 명을 공격해요.','attack',{warning:'뱅!은 기본적으로 내 차례에 공격용으로 한 장만 사용할 수 있어요. 다른 갈색 카드는 사용 조건에 맞으면 여러 장 사용할 수 있어요.',links:[['뱅!','entry/cards/bang']]}),
 scene('gatling','combat','뱅!이나 기관총으로 다른 사람을 공격해요.','기관총은 거리에 관계없이 자신을 제외한 살아 있는 사람 모두에게 뱅 효과를 줘요. 각자 방어해요.','gatling',{warning:'기관총은 뱅! 카드의 한 장 제한과 별개예요. 결투·인디언에 대응하며 버리는 뱅!도 일반 공격과 구분해요.',links:[['기관총','entry/cards/gatling'],['결투','entry/cards/duel'],['인디언','entry/cards/indians']]}),
 scene('volcanic','combat','볼캐닉은 뱅! 사용 횟수를 늘려요.','장착하면 내 차례에 가진 뱅!을 여러 장 사용할 수 있어요. 사거리는 1이에요.','volcanic',{warning:'무기만으로 공격하지 않아요. 공격할 때마다 뱅! 카드가 필요해요.',links:[['볼캐닉','entry/cards/volcanic']]}),
 scene('weapon-range','distance','무기 카드를 장착해 사거리를 늘려요.','무기 카드 하단의 숫자가 장착 후 사거리예요.','weapon-range',{warning:'무기는 한 개만 장착해요. 교체하면 기존 무기를 버려요.',links:[['무기 카드 찾아보기','component/cards/weapon']]}),
 scene('defend','combat','빗나감이나 술통으로 공격을 막아요.','빗나감은 내 차례가 아니어도 사용할 수 있어요. 나를 향한 뱅 효과를 막아요.','defend',{warning:'인디언과 결투에는 빗나감·술통을 사용할 수 없어요.',links:[['빗나감','entry/cards/missed'],['술통','entry/cards/barrel'],['인디언','entry/cards/indians'],['결투','entry/cards/duel']]}),
 scene('barrel','combat','빗나감이나 술통으로 공격을 막아요.','술통을 장착하고 난 뒤 공격받으면 카드 더미 맨 위 한 장을 뒤집어요. 뒤집은 카드가 하트면 뱅을 막을 수 있어요! 뒤집은 카드는 버려요.','barrel',{links:[['하트인지 확인하는 게 판정이에요','answer/judgment'],['술통','entry/cards/barrel']]}),
 scene('barrel-fail','combat','술통이 실패해도 빗나감을 쓸 수 있어요.','하트가 아니면 술통으로 막지 못해요. 이어서 빗나감을 사용하면 그 공격을 막을 수 있어요.','barrel-fail',{warning:'같은 공격에 술통 한 장으로 여러 번 판정하지 않아요.'}),
 scene('damage','combat','막지 못하면 총알을 하나 내려놓아요.','공격받은 사람의 총알이 4개에서 3개가 돼요. 공격한 사람의 총알을 탄약처럼 쓰는 것은 아니에요.','damage'),
 scene('beer','combat','맥주나 주점으로 총알을 회복해요.','맥주는 자신의 총알 하나를 회복해요.','beer',{warning:'회복할 때 자신의 최대 총알 개수를 넘을 수 없어요. 생존자 두 명일 때는 효과가 없어요.',links:[['맥주','entry/cards/beer'],['맥주는 언제 쓸 수 있나요','answer/beer-timing']]}),
 scene('beer-limits','combat','맥주는 언제 쓸 수 있나요?','맥주는 내 차례에 사용해요. 단, 마지막 총알을 잃는 순간에는 다른 사람 차례에도 사용할 수 있어요.','beer-limits',{warning:'두 명만 남으면 맥주는 효과가 없어요. 큰 피해를 받았다면 살아남을 만큼 여러 장이 필요할 수도 있어요.',links:[['맥주','entry/cards/beer']]}),
 scene('saloon','combat','맥주나 주점으로 총알을 회복해요.','주점은 자신을 포함해 살아 있는 사람 모두 총알 하나를 회복해요. 최대치인 사람은 더 받지 않아요.','saloon',{warning:'주점은 두 명만 남아도 효과가 있어요. 마지막 총알을 잃는 순간 사용해 탈락을 피할 수는 없어요.',links:[['주점','entry/cards/saloon']]}),
 scene('eliminate','loss','총알을 모두 잃으면 탈락해요.','','eliminate',{warning:'마지막 총알을 잃을 위기에는 맥주를 사용하면 회복할 수 있어요.',links:[['맥주','entry/cards/beer']]}),
 scene('eliminated','loss','역할을 공개하고 카드를 모두 버려요.','살아남지 못했다면 손에 든 카드와 앞에 놓인 카드를 모두 버려요.','eliminated',{warning:'역할·인물은 게임 카드 더미에 버리지 않아요. 벌쳐 샘 등 인물 능력의 예외는 상세 설명을 확인해요.',links:[['벌쳐 샘','entry/people/vulture']]}),
 scene('closer','loss','탈락한 사람은 거리 계산에서 빼요.','같은 자리에 앉아 있어도, 살아 있는 사람만 양쪽으로 세어 거리를 다시 계산해요.','closer'),
 scene('penalty','loss','보안관이 부관을 탈락시키면,\n보안관은 카드를 모두 버려요.','손에 든 카드와 앞에 놓인 무기·파란 카드도 모두 버려요.','penalty',{warning:'보안관의 역할·인물·총알은 그대로예요. 이 벌칙 예시는 5~7인에 해당해요. 4인에는 부관이 없어요.'}),
 scene('reward','loss','무법자를 탈락시키면 카드 더미에서 세 장을 가져와요.','탈락시킨 사람이 카드를 받아요. 이 예시는 다른 무법자와 배신자가 남아 있어 게임이 계속되는 상황이에요.','reward',{warning:'무법자가 다른 무법자를 탈락시켜도 보상을 받아요.',links:[['게임 종료 조건','learn/outlaws-win']]}),
 scene('loss-done','loss','탈락과 특정 역할이 벌칙과 보상까지 익혔어요.','','loss-done',{dark:true,action:['게임이 끝나는 조건 배우기','outlaws-win']}),
 scene('outlaws-win','ending','보안관이 탈락하면 즉시 끝나요.','그때 배신자만 남은 것이 아니라면 무법자가 이겨요. 무법자가 이미 모두 탈락했어도 같아요.','outlaws-win',{warning:'먼저 탈락한 무법자도 자기편이 이기면 함께 이겨요.'}),
 scene('renegade-win','ending','배신자만 살아남았다면 배신자가 이겨요.','보안관이 탈락한 순간, 다른 생존자는 없고 배신자만 혼자 남아 있는 상황이에요.','renegade-win'),
 scene('sheriff-win','ending','무법자와 배신자가 모두 죽으면 보안관팀이 이겨요.','보안관이 살아 있고 무법자와 배신자가 모두 죽으면 게임이 끝나요. 먼저 부관이 죽었어도 함께 이겨요.','sheriff-win'),
 scene('complete','ending','기본 규칙 안내를 마쳤어요.','실제 게임에서 필요한 규칙과 카드 설명은 메뉴와 검색에서 다시 찾아보세요.','complete',{dark:true})
 ];
 const distance=(level)=>scene(`distance-${level}`,'distance','거리에 대해서 알아봐요.','양옆 사람은 거리 1이에요. 양옆으로 멀어질수록 거리도 멀어져요.','distance',{level,links:[['거리 규칙 자세히 보기','answer/distance']]});
 function scenes(n){const all=common.filter(s=>!['damage','beer-limits','goals'].includes(s.id)&&s.chapter!=='combat').map(s=>s.id==='sort-roles'?{...s,text:`역할카드는 뒷면이 별 모양이에요. 이 중 ${['sheriff','deputy','outlaw','renegade'].filter(id=>window.BangData.roleSetups[n][id]).map(id=>`${window.BangData.roles.find(r=>r.id===id).name} ${window.BangData.roleSetups[n][id]}장`).join(', ')}을 빼놓습니다. 나머지는 필요 없어요.`}:n===4&&s.id==='sheriff-win'?{...s,text:'보안관이 살아 있고 무법자와 배신자가 모두 죽으면 게임이 끝나요. 4인에는 부관이 없어요.'}:s);const weaponIndex=all.findIndex(s=>s.id==='weapon-range');const weapon=all.splice(weaponIndex,1)[0];all.splice(all.findIndex(s=>s.id==='range')+1,0,weapon,scene('distance-done','distance','거리와 사거리를 배웠어요.','','distance-done',{dark:true,action:['누군가 탈락했을 때는?','eliminate']}));all.splice(all.findIndex(s=>s.id==='range'),0,...Array.from({length:Math.floor(n/2)},(_,i)=>distance(i+1)));return all.flatMap(s=>{const info=groupFor(s.id),item={...s,chapter:info?.chapter||s.chapter};const first=info&&groups[info.chapter][info.index][1][0]===s.id;if(first&&info.chapter==='turn')return s.id==='draw'?[scene('intro-draw','turn','내 턴이 올 때마다 3가지를 해요.','뒤에서 자세한 설명을 보세요.','turn-overview'),item]:[item];return first&&!['prepare','distance','loss','ending'].includes(info.chapter)?[scene('intro-'+s.id,info.chapter,info.name,'','section-intro',{dark:s.id==='distance-1'}),item]:[item];});}
 const create=playerCount=>({version:2,playerCount,scene:'summary',seenSearchHint:false,distanceLevels:{}});
 const sanitize=value=>value&&[4,5,6,7].includes(value.playerCount)?{...create(value.playerCount),scene:scenes(value.playerCount).some(s=>s.id===value.scene)?value.scene:'summary',seenSearchHint:!!value.seenSearchHint,distanceLevels:{...(value.distanceLevels||{})}}:null;
 const distanceBetween=(a,b,alive)=>{const i=alive.indexOf(a),j=alive.indexOf(b);return i<0||j<0?null:Math.min(Math.abs(i-j),alive.length-Math.abs(i-j));};
 function example(id,n){
  const e={participants:n,roleCounts:window.BangData.roleSetups[n],character:'lucky',baseBullets:4,sheriffBullets:5,startingCards:{normal:4,sheriff:5},drawCount:2,discard:{bullets:3,before:5,removed:2,after:3},range:id==='weapon-range'?2:1,recovery:{before:3,after:4,max:4},alive:Array.from({length:n},(_,i)=>i)};
  if(id==='closer')e.alive=e.alive.filter(i=>i!==1);
  e.distances=Array.from({length:n},(_,i)=>distanceBetween(0,i,e.alive));return e;
 }
 return {chapters,groups,groupFor,cardScenes:common.filter(s=>s.chapter==='combat'),goalScene:common.find(s=>s.id==='goals'),scenes,create,sanitize,example,distanceBetween};
})();
