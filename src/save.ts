import { type GameState, items, furniture, neighbors, resources, fishSpecies, walkable, type Point } from './game';
export const SAVE_KEY='driftwood-bay.save.v1';
export type SaveResult={ok:true;state:GameState}|{ok:false;error:string};
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const count=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0&&Number(v)<=1_000_000;
const point=(v:unknown):v is Point=>record(v)&&typeof v.x==='number'&&typeof v.y==='number'&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&walkable(v as unknown as Point);
const list=(v:unknown,allowed:readonly string[])=>Array.isArray(v)&&v.length<=allowed.length&&v.every(x=>typeof x==='string'&&allowed.includes(x))&&new Set(v).size===v.length;
export function encodeSave(s:GameState):string { return JSON.stringify(s); }
export function decodeSave(raw:string):SaveResult {
 try {
  if(raw.length>200_000)throw Error('This file is too large to be an island save.');
  const s:unknown=JSON.parse(raw);
  if(!record(s)||s.version!==1)throw Error('Unsupported save version. Keep your file for a compatible version.');
  if(!count(s.day)||s.day===0||!point(s.player)||!record(s.bag)||!items.every(i=>count((s.bag as Record<string,unknown>)[i])))throw Error('Invalid player or inventory.');
  if(!list(s.gathered,resources.map(r=>r.id))||!list(s.fulfilled,neighbors.map(n=>n.id))||!list(s.collection,fishSpecies))throw Error('Invalid island records.');
  if(typeof s.welcomed!=='boolean'||!count(s.catches)||!count(s.nextId)||s.nextId===0||!record(s.friendships)||!neighbors.every(n=>count((s.friendships as Record<string,unknown>)[n.id])))throw Error('Invalid island progress.');
  if(!Array.isArray(s.decorations)||s.decorations.length>500||!s.decorations.every(d=>record(d)&&point(d)&&count(d.id)&&Number(d.id)>0&&Number(d.id)<Number(s.nextId)&&furniture.includes(d.kind as never))||new Set(s.decorations.map(d=>d.id)).size!==s.decorations.length)throw Error('Invalid decorations.');
  // Rebuild the known schema so imported unknown keys never enter runtime state.
  const valid=s as unknown as GameState;
  return {ok:true,state:{version:1,day:valid.day,player:{...valid.player},bag:Object.fromEntries(items.map(i=>[i,valid.bag[i]])) as GameState['bag'],gathered:[...valid.gathered],decorations:valid.decorations.map(d=>({id:d.id,kind:d.kind,x:d.x,y:d.y})),nextId:valid.nextId,friendships:Object.fromEntries(neighbors.map(n=>[n.id,valid.friendships[n.id]])),fulfilled:[...valid.fulfilled],welcomed:valid.welcomed,collection:[...valid.collection],catches:valid.catches}};
 }catch(e){return {ok:false,error:e instanceof Error?e.message:'Unable to read island save.'};}
}
