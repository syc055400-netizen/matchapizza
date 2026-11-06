/* Original schematic 3D geometry for seat-view practice. No external assets or tracking. */
(function () {
  'use strict';
  const NAMES = { yes24:'YES24 LIVE HALL', worldcup:'서울월드컵경기장', gocheok:'고척스카이돔' };
  const TAU = Math.PI * 2;
  const clamp = (n,a,b)=>Math.min(b,Math.max(a,n));
  const add = (a,b)=>a.map((v,i)=>v+b[i]);
  const sub = (a,b)=>a.map((v,i)=>v-b[i]);
  const mul = (a,s)=>a.map(v=>v*s);
  const dot = (a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cross = (a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm = a=>mul(a,1/(Math.hypot(...a)||1));
  let active = null;

  function normalizeVenue(id) {
    const key=String(id||'').toLowerCase();
    if(/yes|live|hall/.test(key))return 'yes24';
    if(/world|sangam|seoul|football/.test(key))return 'worldcup';
    if(/gocheok|dome|baseball/.test(key))return 'gocheok';
    return 'yes24';
  }
  function seatDetails(options,venue) {
    const text=String(options.zoneId||'')+' '+String(options.zoneLabel||'');
    const row=typeof options.row==='number'?options.row: /^\d+$/.test(String(options.row))?Number(options.row):Math.max(1,String(options.row||'A').toUpperCase().charCodeAt(0)-64);
    const number=Math.max(1,Number(options.number)||1);
    const tier=Number.isFinite(Number(options.tier))?Number(options.tier):/4층|4F|4\d\d/.test(text)?3:/3층|3F|3\d\d/.test(text)?2:/2층|2F|발코니|^[XYZ]\b/.test(text)?1:0;
    const supplied=options.seatPosition;
    if(supplied && [supplied.x,supplied.y,supplied.z].every(Number.isFinite)) return {position:[supplied.x,supplied.y,supplied.z],row,number,tier};
    if(venue==='yes24'){
      const zone=String(options.zoneId||'B').toUpperCase();
      const upper=tier>0 || /^[XYZ]$/.test(zone);
      const side=options.side||(/^[AX]$/.test(zone)?'west':/^[CZ]$/.test(zone)?'east':'center');
      const baseX=side==='west'||side==='left'?-7:side==='east'||side==='right'?7:0;
      const x=baseX+(clamp(number,1,20)-10.5)*.22;
      const rear=/^[DE]$/.test(zone);
      return {position:[clamp(x,-10.4,10.4),upper?6.7+clamp(row-1,0,6)*.35:1.2,rear?9+clamp(row-1,0,6)*.7:upper?13+clamp(row-1,0,6)*.7:-8+clamp(row-1,0,17)*.95],row,number,tier:upper?1:0};
    }
    let side=String(options.side||'').toLowerCase();
    if(!side){
      if(venue==='worldcup')side=/\bN|북/.test(text)?'north':/\bS|남/.test(text)?'south':/\bE|동/.test(text)?'east':'west';
      else {
        const section=Number(String(options.zoneId||'').match(/\d{3}/)?.[0]);
        const outfield=(section>=115&&section<=132)||(section>=211&&section<=222)||(section>=323&&section<=334)||(section>=425&&section<=435);
        side=outfield||/외야|outfield/.test(text)?'outfield':/3루|third/.test(text)?'third':/1루|first/.test(text)?'first':'home';
      }
    }
    const rowDepth=clamp(row-1,0,14);
    if(venue==='worldcup'){
      const angle=side==='north'?Math.PI:side==='south'?0:side==='east'?Math.PI/2:-Math.PI/2;
      const offset=(clamp(number,1,30)-15.5)*.012;
      // Use the same radial step/rise as the mesh below, then add seated eye
      // height. A mismatched radius previously placed front-row eyes below a tread.
      const step=tier?.75:.78,rise=tier?.7:.66;
      const xR=(tier?66:48)+rowDepth*step+.3,zR=(tier?95:77)+rowDepth*step+.3;
      const eye=(tier?17:1.6)+rowDepth*rise+1.6;
      return {position:[Math.sin(angle+offset)*xR,eye,Math.cos(angle+offset)*zR],row,number,tier};
    }
    const angle=side==='outfield'?Math.PI:side==='first'?Math.PI*.32:side==='third'?-Math.PI*.32:0;
    const offset=(clamp(number,1,30)-15.5)*.012;
    const layer=clamp(tier,0,3),upper=layer>=2;
    // Official 1F/2F and 3F/4F sections occupy front/rear portions of the two
    // schematic seating decks. Exact tier construction is not a surveyed model.
    const deckRow=(layer===1?7:layer===3?6:0)+clamp(row-1,0,layer===2?5:6);
    const radius=(upper?77:61)+deckRow*(upper?.8:.83)+.3;
    const eye=(upper?14:1.7)+deckRow*(upper?.74:.61)+1.6;
    return {position:[Math.sin(angle+offset)*radius,eye,Math.cos(angle+offset)*(radius+5)-17],row,number,tier};
  }

  function geometry(venue) {
    const shapes=[], labels=[];
    const poly=(points,color,stroke)=>shapes.push({points,color,stroke});
    const line=(points,color='#78858d',width=1)=>shapes.push({points,color,line:true,width});
    // Coplanar field graphics are a painted surface, not independently occluding
    // objects. Preserve their paint order before the stadium's depth-sorted mesh.
    const finishField=()=>shapes.forEach((shape,index)=>{shape.fieldOrder=index;});
    const box=(x,y,z,w,h,d,color,side='#aab4ba',top='#dbe1e3')=>{
      const X=x+w,Y=y+h,Z=z+d;
      poly([[x,y,z],[X,y,z],[X,Y,z],[x,Y,z]],color);
      poly([[X,y,z],[X,y,Z],[X,Y,Z],[X,Y,z]],side);
      poly([[x,y,Z],[x,y,z],[x,Y,z],[x,Y,Z]],side);
      poly([[X,y,Z],[x,y,Z],[x,Y,Z],[X,Y,Z]],color);
      poly([[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]],top);
    };
    const label=(text,position,size=15,color='#344452')=>labels.push({text,position,size,color});
    const ellipsePoint=(angle,xR,zR,y,centerZ=0)=>[Math.sin(angle)*xR,y,Math.cos(angle)*zR+centerZ];
    const ring=(xR,zR,y,width,height,color,centerZ=0,segments=56)=>{
      for(let i=0;i<segments;i++){
        const a=i/segments*TAU,b=(i+1)/segments*TAU;
        poly([ellipsePoint(a,xR,zR,y,centerZ),ellipsePoint(b,xR,zR,y,centerZ),ellipsePoint(b,xR+width,zR+width,y+height,centerZ),ellipsePoint(a,xR+width,zR+width,y+height,centerZ)],color,i%7===0?'#dce4e4':null);
      }
    };
    if(venue==='yes24'){
      poly([[-13,0,-23],[13,0,-23],[13,0,22],[-13,0,22]],'#b5b8b9');
      poly([[-13,0,-23],[-13,13,-23],[-13,13,22],[-13,0,22]],'#e5e7e8');
      poly([[13,0,22],[13,13,22],[13,13,-23],[13,0,-23]],'#e8eaeb');
      poly([[-13,0,-23],[13,0,-23],[13,13,-23],[-13,13,-23]],'#222a33');
      box(-10.45,0,-22,20.9,1.3,11,'#3a4148','#252d35','#454d55');
      box(-7.8,1.4,-22,15.6,7,.15,'#34465d','#34465d','#34465d');
      box(-10.7,1.3,-20,1.2,7,8.5,'#591f2a','#752939','#752939');
      box(9.5,1.3,-20,1.2,7,8.5,'#591f2a','#752939','#752939');
      // Simple standing performer gives a human scale without claiming a measured view.
      box(-.22,1.3,-14.8,.44,1.5,.35,'#e5b99f','#b58a75','#c99f87');
      box(-.23,2.8,-14.8,.46,.42,.35,'#c0a087','#987c67','#d4b7a2');
      label('STAGE',[0,5.3,-21.7],28,'#edf2fc');
      for(let row=0;row<16;row++)for(let col=0;col<22;col++){
        const x=-10.8+col*.98+(col>6?.18:0)+(col>14?.18:0),z=-8.5+row*1.05;
        // A full chair volume makes the perspective visibly three-dimensional.
        box(x,.05,z,.6,.40,.58,'#667588','#4c5b6c','#8193a6');
        poly([[x,.4,z+.51],[x+.6,.4,z+.51],[x+.6,.9,z+.58],[x,.9,z+.58]],'#52657b');
      }
      for(let row=0;row<7;row++){
        const y=5.4+row*.35,z=12.6+row*.84;
        box(-12,y-.2,z,24,.2,.84,'#919aa1','#818b93','#b8bfc3');
        for(let col=0;col<26;col++){
          const x=-11.3+col*.88;
          poly([[x,y+.35,z+.3],[x+.55,y+.35,z+.3],[x+.55,y+.9,z+.4],[x,y+.9,z+.4]],'#577091');
        }
      }
      box(-12,5.2,12.4,24,.55,.18,'#aeb8be','#88959f','#d2d9dd');
      for(const x of [-11,0,11])line([[x,12,-22],[x,12,20]],'#b3bdc5',1.5);
      label('2F',[0,9,19.2],17,'#486077');
      return {shapes,labels,target:[0,2.7,-15],overview:[36,32,37],background:['#e5e9ee','#fafbfc']};
    }
    if(venue==='worldcup'){
      poly([[-90,-.15,-118],[90,-.15,-118],[90,-.15,118],[-90,-.15,118]],'#b7c5c2');
      poly([[-39,0,-58.5],[39,0,-58.5],[39,0,58.5],[-39,0,58.5]],'#2b865c');
      for(let i=0;i<12;i++)poly([[-34,.03,-52.5+i*8.75],[34,.03,-52.5+i*8.75],[34,.03,-43.75+i*8.75],[-34,.03,-43.75+i*8.75]],i%2?'#61a672':'#529b66');
      line([[-34,.08,-52.5],[34,.08,-52.5],[34,.08,52.5],[-34,.08,52.5],[-34,.08,-52.5]],'#ffffff',2);
      line([[-34,.1,0],[34,.1,0]],'#ffffff',2);
      line(Array.from({length:49},(_,i)=>[Math.sin(i/48*TAU)*9.15,.1,Math.cos(i/48*TAU)*9.15]),'#ffffff',2);
      for(const end of [-1,1]){
        line([[-20.16,.1,end*52.5],[-20.16,.1,end*36],[20.16,.1,end*36],[20.16,.1,end*52.5]],'#ffffff',2);
        line([[-9.16,.1,end*52.5],[-9.16,.1,end*47],[9.16,.1,end*47],[9.16,.1,end*52.5]],'#ffffff',1.5);
        line([[-3.66,0,end*52.7],[-3.66,2.44,end*52.7],[3.66,2.44,end*52.7],[3.66,0,end*52.7]],'#fff',2.5);
        line([[-3.66,2.44,end*52.7],[-3.66,2.44,end*55],[3.66,2.44,end*55],[3.66,2.44,end*52.7]],'#e8f1ea',1);
      }
      finishField();
      for(let row=0;row<17;row++)ring(48+row*.78,77+row*.78,1.6+row*.66,.7,.65,row%3===0?'#738a91':row%2?'#99b6b2':'#8ca9a7');
      ring(62,91,13.6,4,0,'#e0e4e3');
      for(let row=0;row<16;row++)ring(66+row*.75,95+row*.75,17+row*.7,.68,.7,row%3===0?'#728d96':row%2?'#9cb8b2':'#89a6a9');
      ring(60,89,32,22,0,'#e6e7e3');
      for(let i=0;i<28;i++){const a=i/28*TAU;line([ellipsePoint(a,59,88,31.8),ellipsePoint(a,83,112,33)],'#c0c6c6',1);}
      label('N',[0,30,-106],20);label('S',[0,30,106],20);label('E',[78,30,0],20);label('W',[-78,30,0],20);
      return {shapes,labels,target:[0,.5,0],overview:[160,137,178],background:['#bfd7eb','#f3f8fb']};
    }
    // Baseball field: home plate faces the outfield at negative Z.
    poly([[-103,-.1,-120],[103,-.1,-120],[103,-.1,82],[-103,-.1,82]],'#c6d0cf');
    poly(Array.from({length:65},(_,i)=>ellipsePoint(i/64*TAU,62,65,.02,-20)),'#3d925d');
    for(let i=0;i<11;i++){
      const low=-85+i*12,high=Math.min(45,low+6);
      if(low>=45)break;
      const edge=Array.from({length:7},(_,j)=>{
        const z=low+(high-low)*j/6;
        return [62*Math.sqrt(Math.max(0,1-((z+20)/65)**2)),.04,z];
      });
      poly([...edge,...edge.slice().reverse().map(([x,y,z])=>[-x,y,z])],'#499d67');
    }
    poly([[0,.08,31],[29,.08,2],[0,.08,-27],[-29,.08,2]],'#c29c71');
    poly([[0,.11,23],[21,.11,2],[0,.11,-19],[-21,.11,2]],'#5d9e65');
    line([[0,.15,31],[27,.15,4],[0,.15,-23],[-27,.15,4],[0,.15,31]],'#efdfc5',1.8);
    line([[-63,.2,-32],[0,.2,31],[63,.2,-32]],'#fff',2.2);
    for(const [x,z] of [[0,31],[27,4],[0,-23],[-27,4]])poly([[x-.65,.22,z-.65],[x+.65,.22,z-.65],[x+.65,.22,z+.65],[x-.65,.22,z+.65]],'#fff');
    poly(Array.from({length:17},(_,i)=>[Math.sin(i/16*TAU)*3,.16,Math.cos(i/16*TAU)*3+4]),'#bb9268');
    finishField();
    for(let row=0;row<14;row++)ring(61+row*.83,66+row*.83,1.7+row*.61,.78,.61,row%3===0?'#7a8fab':row%2?'#b5c5da':'#a1b5cf',-17,60);
    ring(73,78,10.6,3,0,'#d9dfe5',-17);
    for(let row=0;row<13;row++)ring(77+row*.8,82+row*.8,14+row*.74,.74,.72,row%3===0?'#687ea2':row%2?'#92a9c7':'#7e98b9',-17,60);
    box(-14,24,-112,28,10,1,'#253f5c','#253f5c','#344a64');
    label('GOCHEOK',[0,29,-110.8],20,'#fff');
    // Lightweight dome ribs retain an open view of the field from any camera.
    for(let i=0;i<18;i++){
      const a=i/18*TAU;
      line(Array.from({length:21},(_,j)=>{const t=j/20*Math.PI/2;return [Math.sin(a)*96*Math.cos(t),26+33*Math.sin(t),Math.cos(a)*101*Math.cos(t)-17];}),'#b9c4ce',1.2);
    }
    for(let j=1;j<=4;j++){const t=j/5*Math.PI/2;line(Array.from({length:61},(_,i)=>ellipsePoint(i/60*TAU,96*Math.cos(t),101*Math.cos(t),26+33*Math.sin(t),-17)),'#ced7df',1);}
    return {shapes,labels,target:[0,.8,-8],overview:[164,145,170],background:['#dce5ed','#f6f8fa']};
  }

  function close() { if(active){active.dialog.close();cleanup();} }
  function cleanup(){
    if(!active)return;
    cancelAnimationFrame(active.frame);active.observer?.disconnect();
    const previous=active.previous;active.dialog.remove();active=null;
    if(previous?.isConnected)previous.focus({preventScroll:true});
  }
  function open(options={}) {
    close();
    const venue=normalizeVenue(options.venueId),details=seatDetails(options,venue),scene=geometry(venue);
    const dialog=document.createElement('dialog');
    dialog.className='sv-dialog';dialog.setAttribute('aria-labelledby','sv-title');
    dialog.innerHTML='<div class="sv-header"><div><p class="sv-eyebrow">SEAT VIEW</p><h2 id="sv-title">3D 좌석 시야</h2><p class="sv-seat-label"></p></div><button type="button" class="sv-close" aria-label="3D 시야 닫기">×</button></div><div class="sv-stage"><canvas class="sv-canvas" tabindex="0" role="img" aria-label="선택한 좌석에서 보는 3D 모의 시야. 드래그 또는 방향키로 둘러보고 더하기, 빼기로 확대와 축소할 수 있습니다."></canvas><span class="sv-view-badge">좌석에서 보기</span><span class="sv-drag-hint">드래그해서 둘러보기</span><div class="sv-compass" aria-hidden="true"><span>시선</span><i></i></div></div><div class="sv-toolbar"><div class="sv-mode-switch" aria-label="시점 선택"><button type="button" data-sv="seat" class="selected" aria-pressed="true">좌석 시야</button><button type="button" data-sv="overview" aria-pressed="false">전체 배치</button></div><div class="sv-zoom"><button type="button" data-sv="out" aria-label="시야 축소">−</button><span class="sv-zoom-value" aria-live="polite">1.0×</span><button type="button" data-sv="in" aria-label="시야 확대">+</button><button type="button" data-sv="reset" class="sv-reset">시점 초기화</button></div></div><p class="sv-disclaimer">3D 모의 시야 · 실제 시야와 다를 수 있어요</p><p class="sv-detail-note">공식 좌석 구역을 참고한 공간 모형입니다. 무대 구성·단차·난간·앞사람에 의한 가림은 재현하지 않습니다.</p>';
    const rowLabel=options.row?` ${options.row}열`:'';
    dialog.querySelector('.sv-seat-label').textContent=`${NAMES[venue]} · ${options.zoneLabel||options.zoneId||'선택 구역'}${rowLabel}${options.number?` ${options.number}번`:''}`;
    document.body.appendChild(dialog);
    const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');
    active={dialog,canvas,ctx,scene,venue,details,mode:'seat',yaw:0,pitch:0,fov:60,frame:0,pointers:new Map(),previous:document.activeElement,width:0,height:0};
    if(!ctx){dialog.querySelector('.sv-stage').textContent='이 브라우저에서는 3D 시야를 표시할 수 없어요.';}
    const updateControls=()=>{
      if(!active)return;
      dialog.querySelector('.sv-view-badge').textContent=active.mode==='seat'?'좌석에서 보기':'전체 배치 · 선택 위치 표시';
      dialog.querySelectorAll('.sv-mode-switch button').forEach(button=>{const selected=button.dataset.sv===active.mode;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
      dialog.querySelector('.sv-zoom-value').textContent=(Math.tan(Math.PI/6)/Math.tan(active.fov*Math.PI/360)).toFixed(1)+'×';
      dialog.querySelector('.sv-compass i').style.transform=`rotate(${active.yaw*180/Math.PI}deg)`;
    };
    const schedule=()=>{if(active&&!active.frame)active.frame=requestAnimationFrame(()=>{if(active){active.frame=0;draw();}});};
    const zoom=delta=>{if(!active)return;active.fov=clamp(active.fov+delta,35,85);updateControls();schedule();};
    dialog.querySelector('.sv-close').addEventListener('click',close);
    dialog.addEventListener('close',()=>{if(active?.dialog===dialog)cleanup();},{once:true});
    dialog.addEventListener('click',event=>{const action=event.target.closest('[data-sv]')?.dataset.sv;if(!action||!active)return;if(action==='seat'||action==='overview'){active.mode=action;active.yaw=0;active.pitch=0;active.fov=60;}else if(action==='reset'){active.yaw=0;active.pitch=0;active.fov=60;}else zoom(action==='in'?-7:7);updateControls();schedule();});
    canvas.addEventListener('pointerdown',event=>{if(!active)return;active.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');canvas.focus({preventScroll:true});});
    canvas.addEventListener('pointermove',event=>{
      if(!active||!active.pointers.has(event.pointerId))return;
      const previous=active.pointers.get(event.pointerId);
      if(active.pointers.size===2){const other=[...active.pointers.entries()].find(([id])=>id!==event.pointerId)[1];const oldDistance=Math.hypot(previous.x-other.x,previous.y-other.y),distance=Math.hypot(event.clientX-other.x,event.clientY-other.y);zoom((oldDistance-distance)*.12);}
      else{active.yaw=clamp(active.yaw-(event.clientX-previous.x)*.005,-1.3,1.3);active.pitch=clamp(active.pitch+(event.clientY-previous.y)*.004,-.65,.65);}
      active.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});updateControls();schedule();
    });
    const release=event=>{if(!active)return;active.pointers.delete(event.pointerId);if(!active.pointers.size)canvas.classList.remove('dragging');};
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('wheel',event=>{event.preventDefault();zoom(event.deltaY*.025);},{passive:false});
    canvas.addEventListener('keydown',event=>{if(!active)return;const k=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(k))return;event.preventDefault();if(k==='ArrowLeft')active.yaw+=.12;if(k==='ArrowRight')active.yaw-=.12;if(k==='ArrowUp')active.pitch+=.08;if(k==='ArrowDown')active.pitch-=.08;if(k==='+'||k==='=')zoom(-7);if(k==='-')zoom(7);if(k==='0'){active.yaw=0;active.pitch=0;active.fov=60;}active.yaw=clamp(active.yaw,-1.3,1.3);active.pitch=clamp(active.pitch,-.65,.65);updateControls();schedule();});
    dialog.showModal();
    const resize=()=>{if(active?.dialog!==dialog)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);active.width=rect.width;active.height=rect.height;canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));ctx?.setTransform(dpr,0,0,dpr,0,0);schedule();};
    active.observer=new ResizeObserver(resize);active.observer.observe(canvas);resize();canvas.focus({preventScroll:true});
  }

  function draw(){
    const a=active;if(!a?.ctx)return;
    const {ctx,scene,width,height}=a;if(!width||!height)return;
    const camera=a.mode==='seat'?a.details.position:scene.overview;
    const target=a.mode==='seat'?scene.target:a.venue==='yes24'?[0,2,0]:[0,0,0];
    const base=norm(sub(target,camera));
    const yaw=Math.atan2(base[0],base[2])+a.yaw,pitch=Math.asin(base[1])+a.pitch;
    const forward=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)];
    const right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
    const focal=height/(2*Math.tan(a.fov*Math.PI/360));
    const toCamera=p=>{const rel=sub(p,camera);return [dot(rel,right),dot(rel,up),dot(rel,forward)];};
    const project=p=>[width/2+p[0]*focal/p[2],height*.49-p[1]*focal/p[2]];
    const near=.2;
    const clip=points=>{
      let out=[];
      for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],inside=p[2]>=near,next=q[2]>=near;if(inside)out.push(p);if(inside!==next){const t=(near-p[2])/(q[2]-p[2]);out.push(add(p,mul(sub(q,p),t)));}}
      return out;
    };
    const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,scene.background[0]);gradient.addColorStop(1,scene.background[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
    const rendered=[];
    for(const shape of scene.shapes){
      const transformed=shape.points.map(toCamera);
      if(shape.line){
        for(let i=0;i<transformed.length-1;i++){
          let p=transformed[i],q=transformed[i+1];if(p[2]<near&&q[2]<near)continue;
          if(p[2]<near||q[2]<near){const t=(near-p[2])/(q[2]-p[2]),v=add(p,mul(sub(q,p),t));if(p[2]<near)p=v;else q=v;}
          rendered.push({points:[project(p),project(q)],depth:(p[2]+q[2])/2,line:true,color:shape.color,width:shape.width,fieldOrder:shape.fieldOrder});
        }
      }else{
        const points=clip(transformed);if(points.length<3)continue;
        rendered.push({points:points.map(project),depth:points.reduce((sum,p)=>sum+p[2],0)/points.length,color:shape.color,stroke:shape.stroke,fieldOrder:shape.fieldOrder});
      }
    }
    rendered.sort((p,q)=>{
      const pField=Number.isFinite(p.fieldOrder),qField=Number.isFinite(q.fieldOrder);
      if(pField&&qField)return p.fieldOrder-q.fieldOrder;
      if(pField!==qField)return pField?-1:1;
      return q.depth-p.depth;
    });
    for(const item of rendered){ctx.beginPath();item.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(item.line){ctx.strokeStyle=item.color;ctx.lineWidth=item.width||1;ctx.stroke();}else{ctx.closePath();ctx.fillStyle=item.color;ctx.fill();if(item.stroke){ctx.strokeStyle=item.stroke;ctx.lineWidth=.7;ctx.stroke();}}}
    for(const label of scene.labels){const p=toCamera(label.position);if(p[2]<near)continue;const [x,y]=project(p);if(x<0||x>width||y<0||y>height)continue;const size=clamp(label.size*focal/p[2],10,label.size*1.5);ctx.font=`700 ${size}px system-ui, sans-serif`;ctx.fillStyle=label.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label.text,x,y);}
    if(a.mode==='overview'){
      const p=toCamera(a.details.position);if(p[2]>near){const [x,y]=project(p);ctx.beginPath();ctx.arc(x,y,9,0,TAU);ctx.fillStyle='#fa2828';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.font='700 12px system-ui,sans-serif';ctx.fillStyle='#b71c25';ctx.textAlign='center';ctx.fillText('선택 좌석',x,y-20);}
    }else{
      // Subtle aim mark keeps the active camera viewpoint clear.
      ctx.strokeStyle='rgba(27,49,64,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(width/2-5,height*.49);ctx.lineTo(width/2+5,height*.49);ctx.moveTo(width/2,height*.49-5);ctx.lineTo(width/2,height*.49+5);ctx.stroke();
    }
  }
  window.MatchaSeatView=Object.freeze({open,close});
})();
