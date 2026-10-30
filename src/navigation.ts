import {distance, home, resources, walkable, workshop, type GameState, type Point} from './game';

type Solid = Point & {radius:number};
export function solids(s:GameState):Solid[] {
 return [{...home,radius:50},{...workshop,radius:40},...resources.filter(r=>r.kind==='tree'||r.kind==='rock').map(r=>({...r,radius:r.kind==='tree'?30:27})),...s.decorations.filter(d=>d.kind!=='rug').map(d=>({...d,radius:30}))];
}
export function clear(s:GameState,p:Point):boolean {return walkable(p)&&solids(s).every(o=>distance(p,o)>=o.radius);}
// Existing saves may begin inside newly solid scenery: permit movement only outward.
export function canMove(s:GameState,from:Point,to:Point):boolean {
 return walkable(to)&&solids(s).every(o=>{const a=distance(from,o),b=distance(to,o);return a<o.radius?b>a+1e-7:b>=o.radius;});
}
function segmentClear(s:GameState,a:Point,b:Point):boolean {
 const count=Math.max(1,Math.ceil(distance(a,b)/3));let prev=a;
 for(let i=1;i<=count;i++){const p={x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count};if(!canMove(s,prev,p))return false;prev=p;}return true;
}
// Find an accessible grid entry first, then route to clear ground near a blocked object.
export function routeTo(s:GameState,to:Point):Point[]|null {
 if(!walkable(to))return null;const step=20,key=(x:number,y:number)=>`${x},${y}`;
 const origin=s.player,candidates:Point[]=[];
 for(let y=Math.floor((origin.y-120)/step);y<=Math.ceil((origin.y+120)/step);y++)for(let x=Math.floor((origin.x-120)/step);x<=Math.ceil((origin.x+120)/step);x++){const p={x:x*step,y:y*step};if(clear(s,p)&&segmentClear(s,origin,p))candidates.push(p);}
 candidates.sort((a,b)=>distance(a,origin)-distance(b,origin));const start=candidates[0];if(!start)return null;
 const queue=[start],seen=new Map<string,string|null>([[key(start.x,start.y),null]]);let best:Point|null=null,bestDistance=Infinity;
 for(let i=0;i<queue.length;i++){const p=queue[i],d=distance(p,to);if(d<bestDistance){best=p;bestDistance=d;}if(d<step/2)break;
  for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const n={x:p.x+dx,y:p.y+dy},k=key(n.x,n.y);if(!seen.has(k)&&clear(s,n)&&segmentClear(s,p,n)){seen.set(k,key(p.x,p.y));queue.push(n);}}
 }
 if(!best||bestDistance>75)return null;
 const path:Point[]=[];let k:string|null=key(best.x,best.y);while(k){const [x,y]=k.split(',').map(Number);path.unshift({x,y});k=seen.get(k)??null;}
 if(distance(origin,path[0])<1)path.shift();if(clear(s,to)&&bestDistance>1&&segmentClear(s,best,to))path.push(to);return path;
}
