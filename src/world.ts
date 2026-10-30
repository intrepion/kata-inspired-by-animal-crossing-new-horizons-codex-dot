import { type GameState,type Point,type Furniture,resources,neighbors,home,workshop,fishingSpot,distance,placementValid } from './game';
import {shadows,linePhase,type Line} from './fishing';
export interface Scene {target:Point|null;placing:Furniture|null;hover:Point|null;fishing:Line|null;moving:boolean;reduced:boolean;rod:boolean;facing:Point}
export function cameraTransform(w:number,h:number,player:Point,zoom:number){
 const scale=(w<650?.9:Math.min(w/1200,h/850))*zoom,follow=w<650||zoom>1;
 return {scale,ox:w/2-(follow?player.x:600)*scale,oy:h/2-(follow?player.y:425)*scale};
}
export class World {
 private ctx:CanvasRenderingContext2D; private scale=1; private ox=0; private oy=0; private zoom=1;
 setZoom(zoom:number){this.zoom=Math.max(1,Math.min(2,zoom));}
 constructor(public canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;}
 toWorld(x:number,y:number):Point {const r=this.canvas.getBoundingClientRect();return {x:(x-r.left-this.ox)/this.scale,y:(y-r.top-this.oy)/this.scale};}
 draw(s:GameState,scene:Scene,time:number){
  const c=this.ctx;const rect=this.canvas.getBoundingClientRect();const w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio,2);
  if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#8dcac4');gradient.addColorStop(1,'#5eaaa9');c.fillStyle=gradient;c.fillRect(0,0,w,h);
  const transform=cameraTransform(w,h,s.player,this.zoom);this.scale=transform.scale;this.ox=transform.ox;this.oy=transform.oy;
  c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
  const ellipse=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const line=(x:number,y:number,x2:number,y2:number,color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
  // Hand-drawn tidal ripples and the pale shoreline.
  for(let i=0;i<46;i++){const x=(i*173)%1320-60,y=(i*109)%930-40;const drift=scene.reduced?0:Math.sin(time/1800+i)*5;line(x+drift,y,x+25+drift,y,'#a9d8d1',2);}
  ellipse(607,460,521,357,'#559c95');ellipse(600,439,520,355,'#e9f4d9');ellipse(600,437,511,345,'#f2dba6');ellipse(600,426,473,305,'#91b974');
  // Gentle grass texture, deterministic rather than random frame noise.
  for(let i=0;i<240;i++){const x=180+(i*137)%835,y=150+(i*83)%560;if(((x-600)/459)**2+((y-426)/290)**2<1){ellipse(x,y,17+(i%9),6,'#98bf7b');if(i%4===0){line(x,y,x-2,y-5,'#7ca76a',1.5);line(x+2,y,x+4,y-4,'#7ca76a',1.5);}}}
  c.strokeStyle='#d7c99b';c.lineWidth=42;c.lineCap='round';c.beginPath();c.moveTo(355,255);c.bezierCurveTo(350,370,500,365,560,445);c.bezierCurveTo(630,510,760,475,830,560);c.stroke();
  c.lineWidth=30;c.strokeStyle='#e6d6a8';c.stroke();
  line(560,420,580,290,'#e6d6a8',35);line(515,465,360,585,'#e6d6a8',32);
  ellipse(898,344,112,83,'#d1c899');ellipse(895,335,105,78,'#76bfc2');ellipse(895,330,96,67,'#80caca');
  for(let i=0;i<7;i++){const y=300+i*10;line(850+i*5,y,878+i*9,y,'#a8ded3',2);}
  // Original fish silhouettes visibly face the direction in which they can see a bobber.
  shadows.forEach((fish,i)=>{let x=fish.x,y=fish.y;const cast=scene.fishing;if(cast?.target===i){const f=Math.min(.8,cast.elapsed/cast.biteAt*.8);x+=(cast.point.x-fish.x)*f;y+=(cast.point.y-fish.y)*f;}c.save();c.translate(x,y);c.rotate(Math.atan2(fish.facing.y,fish.facing.x));ellipse(0,0,15,6,'#315f6477');c.fillStyle='#315f6477';c.beginPath();c.moveTo(-12,0);c.lineTo(-24,-8);c.lineTo(-24,8);c.fill();ellipse(10,0,2,2,'#183e46');c.restore();});
  // Lily pads and a little dock.
  for(const [x,y]of [[926,300],[950,355],[880,286]]){ellipse(x,y,11,6,'#599d7b');ellipse(x+2,y-3,3,2,'#f4c8c1');}
  c.fillStyle='#957049';c.fillRect(779,350,65,49);for(let i=0;i<6;i++){c.fillStyle=i%2?'#d1a66e':'#c69c68';c.fillRect(780+i*11,350,9,46);}line(780,350,845,350,'#8c6949',4);
  // Island homes, with scalloped roof tiles.
  const house=(x:number,y:number,color:string,roof:string,small=false)=>{c.save();c.translate(x,y);if(small)c.scale(.75,.75);ellipse(4,48,74,17,'#6a915b55');c.fillStyle=color;c.fillRect(-53,-35,106,78);c.fillStyle='#ebdbba';c.fillRect(-57,37,114,8);c.fillStyle=roof;c.beginPath();c.moveTo(-69,-30);c.lineTo(0,-98);c.lineTo(69,-30);c.closePath();c.fill();for(let i=0;i<5;i++)line(-52+i*5,-35-i*10,52-i*5,-35-i*10,'#ffffff20',3);c.fillStyle='#725b48';c.beginPath();c.roundRect(-14,2,28,40,[16,16,0,0]);c.fill();ellipse(7,24,2,2,'#e9c180');for(const x of [-35,35]){c.fillStyle='#f9e7b5';c.fillRect(x-10,-15,20,23);line(x,-15,x,8,'#957453',2);line(x-10,-3,x+10,-3,'#957453',2);}c.fillStyle='#dbb78e';c.fillRect(28,-81,14,24);c.restore();};
  house(home.x,home.y,'#f6e6c2','#4f7f72');house(1000,540,'#ebd8b0','#ba7658',true);house(295,610,'#e7cd9c','#8c92a5',true);
  // Workshop awning and small tools.
  ellipse(workshop.x,workshop.y+12,62,13,'#6a915b55');c.fillStyle='#906a43';c.fillRect(530,258,100,29);c.fillRect(538,283,8,24);c.fillRect(615,283,8,24);c.fillStyle='#d1a674';c.fillRect(526,252,108,10);
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#e8dab2':'#eaa97f';c.fillRect(524+i*19,220,19,23);}line(531,219,531,256,'#786b45',5);line(631,219,631,256,'#786b45',5);line(552,250,563,245,'#515f61',5);c.fillStyle='#87986f';c.fillRect(595,242,17,10);
  const drawFurniture=(kind:Furniture,x:number,y:number,alpha=1)=>{c.save();c.globalAlpha=alpha;c.translate(x,y);ellipse(3,12,33,10,'#54724d44');if(kind==='bench'){line(-29,10,-29,-2,'#785641',6);line(29,10,29,-2,'#785641',6);c.fillStyle='#b3875e';c.fillRect(-36,-21,72,11);c.fillStyle='#d4ab74';c.fillRect(-36,-7,72,12);line(-29,-15,-29,-28,'#785641',4);line(29,-15,29,-28,'#785641',4);}else if(kind==='lantern'){line(0,8,0,-36,'#6e6952',5);c.fillStyle='#7c7352';c.fillRect(-12,-38,24,25);c.fillStyle='#f9d988';c.fillRect(-8,-34,16,17);ellipse(0,-25,26,25,'#ffe7a125');}else if(kind==='rug'){c.fillStyle='#e3a085';c.fillRect(-36,-16,72,37);for(let i=0;i<5;i++)line(-32+i*15,-16,-32+i*15,21,'#f5d7b4',2);for(let i=0;i<3;i++)line(-36,-12+i*14,36,-12+i*14,'#f5d7b4',2);}else if(kind==='planter'){c.fillStyle='#c48163';c.beginPath();c.moveTo(-18,-7);c.lineTo(18,-7);c.lineTo(13,15);c.lineTo(-13,15);c.fill();for(let i=0;i<3;i++){line(i*12-12,-5,i*12-12,-22,'#5e8f58',3);ellipse(i*12-12,-24,7,6,['#f2d68b','#e9a89e','#f3ecce'][i]);}}else if(kind==='stool'){c.fillStyle='#98714d';c.fillRect(-18,-9,36,23);ellipse(0,-9,20,10,'#d7b280');ellipse(0,-9,11,5,'#bd9668');}else{line(0,13,0,-26,'#886849',5);c.fillStyle='#d2ad7a';c.fillRect(-24,-26,48,18);line(-15,-18,15,-18,'#7b6950',2);}c.restore();};
  const objects:{y:number;draw:()=>void}[]=[];
  for(const r of resources){objects.push({y:r.y,draw:()=>{const used=s.gathered.includes(r.id);if(r.kind==='tree'){ellipse(r.x+4,r.y+8,40,15,'#547d4b55');c.fillStyle='#946945';c.fillRect(r.x-7,r.y-45,14,51);line(r.x,r.y-25,r.x-19,r.y-43,'#946945',6);ellipse(r.x,r.y-60,44,38,'#527e51');ellipse(r.x-19,r.y-72,28,28,'#6a9557');ellipse(r.x+17,r.y-76,31,29,'#7da660');ellipse(r.x,r.y-94,30,26,'#8db46a');if(!used){for(const [dx,dy]of [[-21,-60],[19,-77],[5,-46]]){ellipse(r.x+dx,r.y+dy,8,10,'#f3c67f');ellipse(r.x+dx-2,r.y+dy-3,2,3,'#ffe7a8');}}}else if(r.kind==='rock'){ellipse(r.x,r.y+4,25,10,'#547d4b44');c.fillStyle=used?'#929e8c':'#abb2a0';c.beginPath();c.moveTo(r.x-23,r.y+2);c.lineTo(r.x-14,r.y-20);c.lineTo(r.x+7,r.y-26);c.lineTo(r.x+22,r.y-9);c.lineTo(r.x+25,r.y+2);c.fill();line(r.x-10,r.y-16,r.x+7,r.y-21,'#d2d4bb',3);}else if(r.kind==='flower'){for(let i=0;i<5;i++){const x=r.x+(i*11)%29-14,y=r.y+(i*7)%14-7;line(x,y+7,x,y-4,'#5d8b54',2);if(!used){ellipse(x,y-6,6,5,i%2?'#e9a29a':'#f6db8c');ellipse(x,y-6,2,2,'#fff0bf');}}}else if(!used){ellipse(r.x,r.y,10,6,'#fff0d1');for(let i=0;i<4;i++)line(r.x-6+i*4,r.y-3,r.x,r.y+4,'#d6ac86',1);}}});}
  for(const d of s.decorations)objects.push({y:d.y,draw:()=>drawFurniture(d.kind,d.x,d.y)});
  const character=(x:number,y:number,color:string,species:string,isPlayer=false)=>{
   c.save();c.translate(x,y);ellipse(3,8,18,8,'#4d734355');const bob=isPlayer&&scene.moving&&!scene.reduced?Math.sin(time/95)*2:0;c.translate(0,bob);
   line(-7,5,-8,11,'#5f594a',5);line(7,5,8,11,'#5f594a',5);ellipse(0,-6,15,21,isPlayer?'#467b86':'#e1b064');if(species==='fox'){c.fillStyle=color;c.beginPath();c.moveTo(-16,-33);c.lineTo(-21,-58);c.lineTo(-2,-43);c.moveTo(16,-33);c.lineTo(21,-58);c.lineTo(2,-43);c.fill();}else if(species==='rabbit'){ellipse(-10,-51,6,21,color);ellipse(10,-51,6,21,color);ellipse(-10,-53,2,13,'#dfa598');ellipse(10,-53,2,13,'#dfa598');}else if(!isPlayer){ellipse(-16,-35,8,8,color);ellipse(16,-35,8,8,color);}
   ellipse(0,-28,21,19,color);if(isPlayer){c.fillStyle='#795644';c.beginPath();c.ellipse(0,-34,22,18,0,Math.PI,Math.PI*2);c.fill();ellipse(0,-45,26,8,'#e5ca8f');ellipse(0,-52,16,11,'#ead399');line(-14,-48,14,-48,'#7c8e65',3);}else{ellipse(0,-21,13,9,'#f5e4c4');}ellipse(-7,-29,2,3,'#333b33');ellipse(7,-29,2,3,'#333b33');ellipse(-13,-22,4,2,'#da9881');ellipse(13,-22,4,2,'#da9881');ellipse(0,-21,2,2,'#735744');c.restore();
  };
  for(const n of neighbors)objects.push({y:n.y,draw:()=>{character(n.x,n.y,n.color,n.species);if(distance(s.player,n)<100){ellipse(n.x,n.y-81,15,15,'#fff4d8');c.fillStyle='#355647';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('…',n.x,n.y-76);}}});
  objects.push({y:s.player.y,draw:()=>character(s.player.x,s.player.y,'#e5b68d','human',true)});
  objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
  const label=(text:string,x:number,y:number)=>{c.font='600 13px sans-serif';c.textAlign='center';const width=c.measureText(text).width+20;c.fillStyle='#fff6deeb';c.beginPath();c.roundRect(x-width/2,y-13,width,23,11);c.fill();c.fillStyle='#52634e';c.fillText(text,x,y+3);};
  label('Home',355,270);label('Worktable',580,319);label('Pond dock',809,422);for(const n of neighbors)label(n.name,n.x,n.y+31);
  if(s.welcomed){drawFurniture('rug',625,580);label('The neighborhood picnic',625,625);ellipse(618,576,7,5,'#f3d58e');ellipse(636,586,6,4,'#f6ecd2');}
  if(scene.target){c.strokeStyle='#fff8df';c.lineWidth=2;c.beginPath();c.ellipse(scene.target.x,scene.target.y,12,6,0,0,Math.PI*2);c.stroke();}
  if(scene.placing&&scene.hover){drawFurniture(scene.placing,scene.hover.x,scene.hover.y,.6);ellipse(scene.hover.x,scene.hover.y+15,35,5,placementValid(s,scene.hover)?'#407c6199':'#b45c5499');}
  if(scene.rod){const n=Math.max(.01,Math.hypot(scene.facing.x,scene.facing.y));line(s.player.x+5,s.player.y-15,s.player.x+scene.facing.x/n*26,s.player.y-38+scene.facing.y/n*26,'#76543c',3);}
  if(scene.fishing){const cast=scene.fishing,phase=linePhase(cast),p=cast.point;line(s.player.x+10,s.player.y-25,p.x,p.y,'#fff2d4',1);const r=phase==='under'?15:phase==='nibble'?9:5;c.strokeStyle=phase==='under'?'#ffda77':'#d7eee3';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y,r,r*.5,0,0,Math.PI*2);c.stroke();if(phase!=='under')ellipse(p.x,p.y,3,5,'#e67755');label(phase==='under'?'UNDER! Reel!':phase==='nibble'?'Nibble… wait':cast.target===null?'Fish cannot see this cast':'Watch the bobber',p.x,p.y-25);}

  c.setTransform(dpr,0,0,dpr,0,0);
 }
}
