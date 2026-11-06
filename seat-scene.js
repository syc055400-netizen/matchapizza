/* Photo-informed schematic venue architecture. Not a measured seat-view survey. */
(()=>{
'use strict';
const TAU=Math.PI*2;
  function make(venue) {
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
      poly([[-13,0,-23],[13,0,-23],[13,0,22],[-13,0,22]],'#323940');
      poly([[-13,0,-23],[-13,13,-23],[-13,13,22],[-13,0,22]],'#1d242c');
      poly([[13,0,22],[13,13,22],[13,13,-23],[13,0,-23]],'#242d37');
      poly([[-13,0,-23],[13,0,-23],[13,13,-23],[-13,13,-23]],'#222a33');
      box(-10.45,0,-22,20.9,1.3,11,'#3a4148','#252d35','#454d55');
      box(-7.8,1.4,-22,15.6,7,.15,'#152b43','#152b43','#24425f');
      box(-10.7,1.3,-20,1.2,7,8.5,'#171c23','#242b33','#292f37');
      box(9.5,1.3,-20,1.2,7,8.5,'#171c23','#242b33','#292f37');
      // Simple standing performer gives a human scale without claiming a measured view.
      box(-.22,1.3,-14.8,.44,1.5,.35,'#e5b99f','#b58a75','#c99f87');
      box(-.23,2.8,-14.8,.46,.42,.35,'#c0a087','#987c67','#d4b7a2');
      label('LIVE HALL',[0,5.3,-21.7],26,'#e9f0f9');
      // Suspended line arrays and the lighting truss observed in hall photographs.
      for(const side of [-1,1]){
        for(let n=0;n<7;n++){const x=side<0?-10.6:9.7,y=6.5+n*.52,z=-12.5+n*.08;box(x,y,z,.9,.44,.7,'#151a20','#303944','#3c4651');line([[x+.08,y+.2,z+.72],[x+.82,y+.2,z+.72]],'#626e7a',.8);}
        line([[side*10.2,10.1,-12],[side*10.2,12,-12]],'#697582',1.5);
      }
      for(const z of [-15,-8,4]){line([[-12,11.5,z],[12,11.5,z]],'#687481',2);line([[-12,11,z],[12,11,z]],'#303c48',1);for(let n=0;n<12;n++){const x=-11+n*2;line([[x,11,z],[x+1,11.5,z],[x+2,11,z]],'#7b8791',.7);if(z<0){box(x,10.5,z,.45,.5,.5,'#20262d','#2b3540','#8095a8');poly([[x+.05,10.5,z+.51],[x+.4,10.5,z+.51],[x+.4,10.75,z+.51],[x+.05,10.75,z+.51]],n%3===0?'#d4eaff':'#fff2db');}}}
      for(let n=0;n<20;n++){const x=-10.5+n*1.1;line([[x,1.4,-20.2],[x,8.6,-20.2]],'#34404c',.7);}
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
      return {shapes,labels,target:[0,2.7,-15],overview:[36,32,37],background:['#151c25','#3b4653']};
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
      for(let row=0;row<17;row++)ring(48+row*.78,77+row*.78,1.6+row*.66,.7,.65,row%3===0?'#647680':row%2?'#a2afb6':'#8999a3');
      ring(62,91,13.6,4,0,'#e0e4e3');
      for(let row=0;row<16;row++)ring(66+row*.75,95+row*.75,17+row*.7,.68,.7,row%3===0?'#657581':row%2?'#aab6be':'#92a1ab');
      // The central aperture is rectangular, unlike the elliptical seating bowl.
      // White membrane panels rest above dark radial truss pairs.
      const roofStart=shapes.length;
      const corner=Math.atan2(45,69);
      const angles=Array.from({length:64},(_,i)=>i/64*TAU).concat([corner,Math.PI-corner,Math.PI+corner,TAU-corner]).sort((a,b)=>a-b);
      const inner=a=>{const r=1/Math.max(Math.abs(Math.sin(a))/45,Math.abs(Math.cos(a))/69);return [Math.sin(a)*r,35.5,Math.cos(a)*r];};
      const outer=a=>ellipsePoint(a,94,123,40);
      for(let i=0;i<angles.length;i++){
        const a=angles[i],b=angles[(i+1)%angles.length],p=inner(a),q=inner(b),r=outer(a),t=outer(b);
        poly([p,q,t,r],i%2?'#edf1f3':'#f8fafb','#c6cfd5');
        const lowP=[p[0],p[1]-2.8,p[2]],lowR=[r[0],r[1]-2.8,r[2]];
        line([p,r,lowR,lowP,p],'#344554',1.4);
        for(let k=0;k<5;k++){
          const f=k/5,g=(k+1)/5;
          const x=p.map((v,j)=>v+(r[j]-v)*f),y=p.map((v,j)=>v+(r[j]-v)*g);y[1]-=2.8;
          line([x,y],'#53616c',.8);
        }
        line([p,q],'#263b4a',2.2);
      }
      for(let i=roofStart;i<shapes.length;i++)shapes[i].roof=true;
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
    for(let row=0;row<14;row++)ring(61+row*.83,66+row*.83,1.7+row*.61,.78,.61,row%3===0?'#798b9d':row%2?'#bdc9d3':'#a1b1c0',-17,60);
    ring(73,78,10.6,3,0,'#d9dfe5',-17);
    for(let row=0;row<13;row++)ring(77+row*.8,82+row*.8,14+row*.74,.74,.72,row%3===0?'#65798d':row%2?'#aabac9':'#93a6b9',-17,60);
    box(-14,24,-112,28,10,1,'#253f5c','#253f5c','#344a64');
    label('GOCHEOK',[0,29,-110.8],20,'#fff');
    // The photo reference shows a closed pale roof supported by dense steelwork.
    // Small panels prevent giant near-plane polygons in this painter renderer.
    const roofStart=shapes.length;
    const roofPoint=(a,t,lift=0)=>[Math.sin(a)*96*Math.cos(t),26+33*Math.sin(t)+lift,Math.cos(a)*101*Math.cos(t)-17];
    for(let i=0;i<40;i++)for(let j=0;j<12;j++){
      const a=i/40*TAU,b=(i+1)/40*TAU,t=j/12*Math.PI/2,u=(j+1)/12*Math.PI/2;
      poly([roofPoint(a,t,1.4),roofPoint(b,t,1.4),roofPoint(b,u,1.4),roofPoint(a,u,1.4)],j>7?(i%2?'#f6f7f6':'#ffffff'):(i%2?'#d8dee1':'#e4e8e9'));
      line([roofPoint(a,t),roofPoint(a,u)],'#7d8f99',1.1);
      line([roofPoint(a,t),roofPoint(b,t)],'#9aa9b0',.9);
      if(j<11)line([roofPoint(a,t),roofPoint(b,u)],'#a0adb4',.65);
    }
    // Tall perimeter steel columns and cross bracing at the enclosed side walls.
    for(let i=0;i<36;i++){
      const a=i/36*TAU,b=(i+1)/36*TAU,p=ellipsePoint(a,96,101,10,-17),q=ellipsePoint(b,96,101,26,-17);
      line([p,ellipsePoint(a,96,101,26,-17)],'#9daab1',1.6);
      line([p,q],'#aab5bb',.8);
    }
    for(let i=roofStart;i<shapes.length;i++)shapes[i].roof=true;
    return {shapes,labels,target:[0,.8,-8],overview:[164,145,170],background:['#dce5ed','#f6f8fa']};
  }

window.MatchaSeatGeometry=Object.freeze({make});
})();
