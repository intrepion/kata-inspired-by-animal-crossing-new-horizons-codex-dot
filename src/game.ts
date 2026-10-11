export type Item = 'wood' | 'stone' | 'fiber' | 'fruit' | 'fish' | 'shells' | 'bench' | 'lantern' | 'stool' | 'planter' | 'rug' | 'sign';
export type Furniture = 'bench' | 'lantern' | 'stool' | 'planter' | 'rug' | 'sign';
export interface Point { x: number; y: number }
export interface GameState {
  version: 1; day: number; player: Point; bag: Record<Item, number>; gathered: string[];
  decorations: (Point & {id: number; kind: Furniture})[]; nextId: number;
  friendships: Record<string, number>; fulfilled: string[]; welcomed: boolean; collection: string[]; catches: number;
}
export type Command = { type: 'move'; x: number; y: number } | {type:'gather'; id:string}
 | {type:'craft';kind:Furniture} | {type:'place';kind:Furniture;x:number;y:number}
 | {type:'reclaim';id:number} | {type:'talk';id:string} | {type:'fulfill';id:string} | {type:'fish';elapsed:number} | {type:'rest'} | {type:'sell'};
export const fishSpecies=['Sunfin','Ribbon perch','Moon minnow','Copper koi','Sailtail','Starling trout'];
export const recipes: Record<Furniture, Partial<Record<Item,number>>> = {
 bench:{wood:4,stone:2},lantern:{wood:2,shells:6},stool:{wood:2},planter:{stone:2,fiber:2},rug:{fiber:4},sign:{wood:2,fiber:2}
};
export const canAfford=(s:GameState,cost:Partial<Record<Item,number>>) => Object.entries(cost).every(([i,n])=>s.bag[i as Item]>=n!);
export const placementValid=(s:GameState,p:Point) => walkable(p) && distance(s.player,p)<=110 && s.decorations.every(d=>distance(d,p)>45) && [...neighbors,...resources,home,workshop,fishingSpot].every(o=>distance(o,p)>48);
export interface Result { state: GameState; message: string }
export const items: Item[] = ['wood','stone','fiber','fruit','fish','shells','bench','lantern','stool','planter','rug','sign'];
export const furniture: Furniture[] = ['bench','lantern','stool','planter','rug','sign'];
export const names: Record<Item,string> = {wood:'Driftwood',stone:'Pebbles',fiber:'Meadow fiber',fruit:'Sunpears',fish:'Fish',shells:'Shells',bench:'Welcome bench',lantern:'Glow lantern',stool:'Log stool',planter:'Flower planter',rug:'Picnic blanket',sign:'Trail sign'};
export const resources = [
  {id:'tree-1',x:400,y:330,kind:'tree'}, {id:'tree-2',x:270,y:400,kind:'tree'},
  {id:'tree-3',x:710,y:560,kind:'tree'}, {id:'tree-4',x:930,y:590,kind:'tree'},
  {id:'tree-5',x:660,y:155,kind:'tree'}, {id:'tree-6',x:200,y:545,kind:'tree'},
  {id:'rock-1',x:450,y:560,kind:'rock'}, {id:'rock-2',x:750,y:230,kind:'rock'}, {id:'rock-3',x:990,y:450,kind:'rock'},
  {id:'flower-1',x:625,y:480,kind:'flower'}, {id:'flower-2',x:340,y:665,kind:'flower'}, {id:'flower-3',x:735,y:650,kind:'flower'},
  {id:'shell-1',x:520,y:735,kind:'shell'}, {id:'shell-2',x:650,y:750,kind:'shell'}, {id:'shell-3',x:930,y:660,kind:'shell'},
] as const;
export const home = {x:355,y:220};
export const workshop = {x:580,y:285};
export const fishingSpot = {x:800,y:375};
export const neighbors = [
  {id:'pip',name:'Pip',species:'otter',x:555,y:420,color:'#b36e45',item:'fruit' as Item,amount:3,reward:20,request:'Three sunpears for a picnic tart. A little sunshine in every slice!',hello:'Oh, a new face! I’m Pip. This bay could use a place to sit together. Make a welcome bench at the worktable, place it on the island, then come find me.'},
  {id:'mallow',name:'Mallow',species:'rabbit',x:830,y:535,color:'#ede0c4',item:'fish' as Item,amount:1,reward:25,request:'One fish for my seaside supper. I’ll trade you some shells!',hello:'I’m Mallow. I collect quiet moments. The pond is full of them… and fish. Wait for the ripple to say BITE, then reel in.'},
  {id:'juniper',name:'Juniper',species:'fox',x:330,y:575,color:'#cf7952',item:'fiber' as Item,amount:4,reward:18,request:'Four meadow fibers for a woven basket. Gather the little flower patches!',hello:'Juniper, trail keeper, at your service. Pick the flowers for fiber; they’ll bloom again after a good night’s rest. My basket could use a little mending.'},
] as const;
export const distance = (a:Point,b:Point) => Math.hypot(a.x-b.x,a.y-b.y);
export function walkable(p:Point):boolean {
  return ((p.x-600)/490)**2 + ((p.y-435)/325)**2 < 1 && ((p.x-895)/105)**2 + ((p.y-335)/78)**2 > 1;
}
export function createGame(): GameState {
  return {version:1,day:1,player:{x:520,y:480},bag:Object.fromEntries(items.map(i=>[i,i==='shells'?15:0])) as Record<Item,number>,gathered:[],decorations:[],nextId:1,friendships:{pip:0,mallow:0,juniper:0},fulfilled:[],welcomed:false,collection:[],catches:0};
}
export function command(previous:GameState, action:Command):Result {
  const state=structuredClone(previous);
  const result=(message:string):Result=>({state,message});
  if(action.type==='move') {
    if(Number.isFinite(action.x)&&Number.isFinite(action.y)&&walkable(action)) state.player={x:action.x,y:action.y};
    return result('');
  }
  if(action.type==='craft') {
    if(distance(state.player,workshop)>95) return result('Visit the worktable to craft.');
    const cost=recipes[action.kind];
    if(!cost || !canAfford(state,cost)) return result('A few more materials, then we can make it!');
    for(const [i,n] of Object.entries(cost)) state.bag[i as Item]-=n!;
    state.bag[action.kind]++;return result(`Made a ${names[action.kind].toLowerCase()}! Open Decorate to place it.`);
  }
  if(action.type==='place') {
    if(!furniture.includes(action.kind)||state.bag[action.kind]<1) return result('Craft this decoration first.');
    if(state.decorations.length>=500)return result('Your island has 500 decorations. Pick one up before placing another.');
    if(!placementValid(state,action)) return result('Choose open ground nearby, clear of paths and neighbors.');
    state.bag[action.kind]--;state.decorations.push({id:state.nextId++,kind:action.kind,x:action.x,y:action.y});
    return result('A little more you. Your island is growing!');
  }
  if(action.type==='reclaim') {
    const index=state.decorations.findIndex(d=>d.id===action.id&&distance(d,state.player)<110);
    if(index<0)return result('Walk closer to pick it up.');
    state.bag[state.decorations[index].kind]++;state.decorations.splice(index,1);return result('Back in your pocket, ready for a new spot.');
  }
  if(action.type==='fish') {
    if(distance(state.player,fishingSpot)>95)return result('Cast from the pond’s little wooden dock.');
    if(!Number.isFinite(action.elapsed)||action.elapsed<1200||action.elapsed>3600)return result('The fish slipped away. Cast again and reel when you see BITE!');
    const species=fishSpecies[state.catches++%fishSpecies.length];state.bag.fish++;
    if(!state.collection.includes(species))state.collection.push(species);
    return result(`Caught a ${species}! ${state.collection.length} of ${fishSpecies.length} species in your field guide.`);
  }
  if(action.type==='rest') {
    if(distance(state.player,home)>100)return result('Go home to rest and begin a new island day.');
    state.day++;state.gathered=[];state.fulfilled=[];return result(`Good morning! Island day ${state.day}. The trees, meadow and neighbors are refreshed.`);
  }
  if(action.type==='sell') {
    if(distance(state.player,workshop)>95)return result('Visit the worktable to trade catches.');
    if(!state.bag.fish)return result('Catch a fish first, then trade it for shells.');
    state.bag.fish--;state.bag.shells+=8;return result('Traded one fish for 8 shells.');
  }
  if(action.type==='fulfill') {
    const n=neighbors.find(n=>n.id===action.id);
    if(!n||distance(state.player,n)>90)return result('Walk closer to share a gift.');
    if(state.fulfilled.includes(n.id))return result('You already helped today. Come back tomorrow!');
    if(state.bag[n.item]<n.amount)return result(`${n.name} needs ${n.amount} ${names[n.item].toLowerCase()}.`);
    state.bag[n.item]-=n.amount;state.bag.shells+=n.reward;state.friendships[n.id]++;state.fulfilled.push(n.id);
    return result(`${n.name}: Just what I needed! Thank you, friend. +${n.reward} shells · +1 friendship.`);
  }
  if(action.type==='talk') {
    const n=neighbors.find(n=>n.id===action.id);
    if(!n||distance(state.player,n)>90)return result('Walk closer to say hello.');
    if(n.id==='pip'&&!state.welcomed&&state.decorations.some(d=>d.kind==='bench')) {
      state.welcomed=true;state.bag.shells+=40;state.friendships.pip++;
      return result('Pip: You did it! A place for all of us. Welcome to Driftwood Bay. The neighborhood picnic is open! Here are 40 shells for your next little project.');
    }
    return result(`${n.name}: ${state.fulfilled.includes(n.id)?'You made my day. Come say hello again tomorrow!':n.id==='pip'&&state.welcomed?'The picnic blanket is out, the kettle is warm, and there is always room for one more. Some sunpears would make a lovely tart.':n.hello}`);
  }
  const source=resources.find(r=>r.id===action.id);
  if(!source||distance(state.player,source)>82) return result('Walk a little closer to gather.');
  if(state.gathered.includes(source.id)) return result('This spot is resting. It will replenish tomorrow.');
  state.gathered.push(source.id);
  if(source.kind==='tree') {state.bag.wood+=2;state.bag.fruit++;return result('+2 driftwood · +1 sunpear. A lovely little harvest!');}
  if(source.kind==='rock') {state.bag.stone+=2;return result('+2 pebbles. Perfect for making something.');}
  if(source.kind==='flower') {state.bag.fiber+=2;return result('+2 meadow fiber. The flowers will grow back.');}
  state.bag.shells+=3;return result('+3 shells. A tiny treasure from the tide.');
}
