import {it,expect} from 'vitest';
import {createGame,resources,neighbors,home,workshop,fishingSpot,distance} from '../src/game';
import {routeTo,canMove,clear} from '../src/navigation';
function follow(s:ReturnType<typeof createGame>,target:{x:number;y:number}){
 const path=routeTo(s,target);expect(path).not.toBeNull();
 for(const p of path!){while(distance(s.player,p)>1e-6){const d=distance(s.player,p),step=Math.min(5,d),next={x:s.player.x+(p.x-s.player.x)*step/d,y:s.player.y+(p.y-s.player.y)*step/d};expect(canMove(s,s.player,next)).toBe(true);s.player=next;}}
 return distance(s.player,target);
}
it('reaches each resource, neighbor, worktable, home and dock without walking through scenery',()=>{
 for(const target of [...resources,...neighbors,home,workshop,fishingSpot]){const s=createGame();expect(follow(s,target)).toBeLessThanOrEqual(75);expect(clear(s,s.player)).toBe(true);}
});
it('routes out of old save positions inside solid trees and furniture and preserves unreachable destinations',()=>{
 const s=createGame();s.player={x:400,y:330};expect(follow(s,resources[1])).toBeLessThanOrEqual(75);
 s.decorations.push({id:1,kind:'bench',x:s.player.x,y:s.player.y});expect(follow(s,workshop)).toBeLessThanOrEqual(75);
 expect(routeTo(s,{x:895,y:335})).toBeNull();
});
it('supports the gather, craft, place, talk and fishing loop with persisted progress',async()=>{
 const {command,placementValid}=await import('../src/game');const {Rod}=await import('../src/fishing');const {encodeSave,decodeSave}=await import('../src/save');let s=createGame();
 for(const id of ['tree-1','tree-2','tree-3','rock-1','flower-1']){const target=resources.find(r=>r.id===id)!;follow(s,target);s=command(s,{type:'gather',id}).state;}
 expect(s.bag.wood).toBe(6);expect(s.bag.stone).toBe(2);expect(s.bag.fiber).toBe(2);
 follow(s,workshop);s=command(s,{type:'craft',kind:'rod'}).state;s=command(s,{type:'craft',kind:'bench'}).state;expect(s.bag.rod).toBe(1);expect(s.bag.bench).toBe(1);
 let spot:{x:number;y:number}|undefined;for(let y=100;y<750&&!spot;y+=10)for(let x=100;x<1100;x+=10)if(placementValid(s,{x,y})){spot={x,y};break;}
 expect(spot).toBeDefined();s=command(s,{type:'place',kind:'bench',...spot!}).state;expect(s.decorations).toHaveLength(1);
 follow(s,neighbors[0]);s=command(s,{type:'talk',id:'pip'}).state;expect(s.welcomed).toBe(true);
 follow(s,fishingSpot);const r=new Rod();r.equipped=!!s.bag.rod;r.cast(s,{x:1,y:0});expect(r.line?.target).toBe(0);while(r.line!.elapsed<r.line!.biteAt+.01)r.tick(.01);s=r.reel(s).state;expect(s.bag.fish).toBe(1);
 expect(decodeSave(encodeSave(s))).toEqual({ok:true,state:s});
});
