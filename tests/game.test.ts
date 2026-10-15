import { describe, expect, it } from 'vitest';
import { createGame, command } from '../src/game';
import {Rod} from '../src/fishing';
describe('island gathering', () => {
  it('lets a nearby player gather wood once, until the next island day', () => {
    let s = createGame();
    s = command(s, {type:'move', x:400, y:330}).state;
    const result = command(s, {type:'gather', id:'tree-1'});
    expect(result.state.bag.wood).toBe(2);
    expect(command(result.state, {type:'gather', id:'tree-1'}).state.bag.wood).toBe(2);
  });
});
it('turns gathered materials into a placed welcome bench and opens the picnic once',()=>{
  let s=createGame();
  for(const id of ['tree-1','tree-2','rock-1']) {
    const p=id==='tree-1'?{x:400,y:330}:id==='tree-2'?{x:270,y:400}:{x:450,y:560};
    s=command(s,{type:'move',...p}).state;s=command(s,{type:'gather',id}).state;
  }
  s=command(s,{type:'move',x:580,y:285}).state;
  s=command(s,{type:'craft',kind:'bench'}).state;
  expect(s.bag.bench).toBe(1);
  s=command(s,{type:'move',x:520,y:480}).state;
  s=command(s,{type:'place',kind:'bench',x:520,y:520}).state;
  expect(s.decorations).toHaveLength(1);
  s=command(s,{type:'move',x:555,y:420}).state;
  s=command(s,{type:'talk',id:'pip'}).state;
  expect(s.welcomed).toBe(true);expect(s.bag.shells).toBe(55);
  expect(command(s,{type:'talk',id:'pip'}).state.bag.shells).toBe(55);
});
it('offers renewable days, consumes neighbor gifts exactly once and rewards a timed catch',()=>{
  let s=createGame();
  s=command(s,{type:'move',x:800,y:375}).state;
  const rod=new Rod();rod.equipped=true;rod.cast(s,{x:1,y:0});
  for(let i=0;i<305;i++)rod.tick(.01);
  s=rod.reel(s).state;
  expect(s.bag.fish).toBe(1);expect(s.collection).toEqual(['Sunfin']);
  s=command(s,{type:'move',x:830,y:535}).state;
  s=command(s,{type:'fulfill',id:'mallow'}).state;
  expect(s.bag.fish).toBe(0);expect(s.bag.shells).toBe(40);
  expect(command(s,{type:'fulfill',id:'mallow'}).state.bag.shells).toBe(40);
  s=command(s,{type:'move',x:355,y:220}).state;
  s=command(s,{type:'rest'}).state;
  expect(s.day).toBe(2);expect(s.fulfilled).toEqual([]);
});
it('keeps inventory intact when crafting or placement is blocked, and reclaiming is lossless',()=>{
 let s=createGame();expect(command(s,{type:'craft',kind:'bench'}).state).toEqual(s);
 for(const id of ['tree-1','tree-2','rock-1']){const p=id==='tree-1'?{x:400,y:330}:id==='tree-2'?{x:270,y:400}:{x:450,y:560};s=command(s,{type:'move',...p}).state;s=command(s,{type:'gather',id}).state;}
 s=command(s,{type:'move',x:580,y:285}).state;s=command(s,{type:'craft',kind:'bench'}).state;
 expect(command(s,{type:'place',kind:'bench',x:895,y:335}).state.bag.bench).toBe(1);
 s=command(s,{type:'move',x:520,y:480}).state;s=command(s,{type:'place',kind:'bench',x:520,y:520}).state;
 s=command(s,{type:'reclaim',id:s.decorations[0].id}).state;expect(s.bag.bench).toBe(1);expect(s.decorations).toHaveLength(0);
});
it('replenishes harvested resources after rest and rejects gathering from afar',()=>{
 let s=createGame();expect(command(s,{type:'gather',id:'tree-2'}).state.bag.wood).toBe(0);
 s=command(s,{type:'move',x:400,y:330}).state;s=command(s,{type:'gather',id:'tree-1'}).state;
 s=command(s,{type:'move',x:355,y:220}).state;s=command(s,{type:'rest'}).state;
 s=command(s,{type:'move',x:400,y:330}).state;s=command(s,{type:'gather',id:'tree-1'}).state;expect(s.bag.wood).toBe(4);
});
it('allows reclaiming a decoration at the advertised 110-unit reach boundary',()=>{
 let s=createGame();for(const id of ['tree-1','tree-2','rock-1']){const p=id==='tree-1'?{x:400,y:330}:id==='tree-2'?{x:270,y:400}:{x:450,y:560};s=command(s,{type:'move',...p}).state;s=command(s,{type:'gather',id}).state;}
 s=command(s,{type:'move',x:580,y:285}).state;s=command(s,{type:'craft',kind:'bench'}).state;s=command(s,{type:'move',x:520,y:480}).state;s=command(s,{type:'place',kind:'bench',x:520,y:520}).state;
 const id=s.decorations[0].id;s=command(s,{type:'move',x:410,y:520}).state;expect(command(s,{type:'reclaim',id}).state.bag.bench).toBe(1);
});
