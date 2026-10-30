import { expect,it } from 'vitest';
import {createGame,command} from '../src/game';
import {encodeSave,decodeSave} from '../src/save';
it('round-trips progress and rejects broken or future saves without replacing them',()=>{
 let s=createGame();s=command(s,{type:'move',x:400,y:330}).state;s=command(s,{type:'gather',id:'tree-1'}).state;
 expect(decodeSave(encodeSave(s))).toEqual({ok:true,state:s});
 for(const invalid of ['broken','{"version":42}',JSON.stringify({...s,bag:{...s.bag,wood:-1}}),JSON.stringify({...s,player:{x:0,y:0}})])expect(decodeSave(invalid).ok).toBe(false);
});
it('rejects forged collection, duplicate records, unknown furniture and invalid coordinates',()=>{
 const s=createGame();
 for(const changed of [{collection:['Imaginary fish']},{gathered:['tree-1','tree-1']},{friendships:{pip:0,mallow:0}},{decorations:[{id:1,kind:'castle',x:520,y:520}],nextId:2},{player:{x:895,y:335}},{nextId:0},{catches:-1}])expect(decodeSave(JSON.stringify({...s,...changed})).ok).toBe(false);
});
it('migrates pre-rod saves without taking away the previously available fishing rod',()=>{
 const s=createGame();const old=JSON.parse(encodeSave(s));delete old.bag.rod;const loaded=decodeSave(JSON.stringify(old));expect(loaded.ok).toBe(true);if(loaded.ok){expect(loaded.state.bag.rod).toBe(1);expect(loaded.state.player).toEqual(s.player);}
});
