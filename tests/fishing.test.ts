import {it,expect} from 'vitest';
import {Rod,linePhase,REACTION} from '../src/fishing';
import {createGame} from '../src/game';
import {encodeSave,decodeSave} from '../src/save';
const dock=()=>{const s=createGame();s.player={x:800,y:375};return s;};
const advance=(r:Rod,t:number)=>{for(let i=0;i<Math.ceil(t/.01);i++)r.tick(.01);};
it('requires an equipped rod, water and placement in front of a fish shadow',()=>{
 const s=dock(),r=new Rod();r.cast(s,{x:1,y:0});expect(r.line).toBeNull();r.equipped=true;
 r.cast(s,{x:-1,y:0});expect(r.line).toBeNull();r.cast(s,{x:1,y:0});expect(r.line?.target).toBe(0);
 r.cast({...s,player:{x:1010,y:375}},{x:-1,y:0});expect(r.line?.target).toBeNull();
});
it('nibble is an early failure and submerged reaction rewards exactly one real catch',()=>{
 const s=dock(),r=new Rod();r.equipped=true;r.cast(s,{x:1,y:0});advance(r,1);expect(linePhase(r.line!)).toBe('nibble');expect(r.reel(s).state.bag.fish).toBe(0);
 r.cast(s,{x:1,y:0});advance(r,r.line!.biteAt+.05);expect(linePhase(r.line!)).toBe('under');const caught=r.reel(s).state;
 expect(caught.bag.fish).toBe(1);expect(caught.collection).toEqual(['Sunfin']);expect(r.reel(caught).state.bag.fish).toBe(1);
});
it('late, missed, cancelled and interrupted casts award nothing and old saves stay intact',()=>{
 const s=dock(),r=new Rod();r.equipped=true;r.cast(s,{x:1,y:0});advance(r,r.line!.biteAt+REACTION+.2);expect(r.reel(s).state).toEqual(s);
 r.cast(s,{x:1,y:0});r.cancel();expect(r.reel(s).state).toEqual(s);
 const save=decodeSave(encodeSave(s));expect(save.ok&&save.state).toEqual(s);expect(save.ok&&'line' in save.state).toBe(false);
});
