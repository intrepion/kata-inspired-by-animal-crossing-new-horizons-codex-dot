import { command, fishSpecies, type GameState, type Point, type Result } from './game';
export const shadows = [
  { x: 905, y: 375, facing: { x: -1, y: 0 } },
  { x: 918, y: 315, facing: { x: -1, y: 0 } },
];
export const inPond = (p:Point) => ((p.x-895)/105)**2+((p.y-335)/78)**2<1;
export interface Line { point:Point; target:number|null; elapsed:number; biteAt:number; nibbles:number; species:string }
export const REACTION = .85;
export function linePhase(line:Line):'waiting'|'nibble'|'under'|'escaped' {
  if(line.target===null)return 'waiting';
  if(line.elapsed>line.biteAt+REACTION)return 'escaped';
  if(line.elapsed>=line.biteAt)return 'under';
  for(let i=0;i<line.nibbles;i++)if(line.elapsed>=.9+i*.85&&line.elapsed<1.18+i*.85)return 'nibble';
  return 'waiting';
}
export class Rod {
  equipped=false;
  line:Line|null=null;
  cancel(){this.line=null;}
  cast(state:GameState,facing:Point):string {
    this.cancel();
    if(!this.equipped)return 'Equip the rod with R first.';
    const length=Math.hypot(facing.x,facing.y);
    if(!Number.isFinite(length)||length<.01)return 'Face the pond before casting.';
    const point={x:state.player.x+facing.x/length*85,y:state.player.y+facing.y/length*85};
    if(!inPond(point))return 'The bobber landed on shore. Aim toward water, then cast again.';
    const target=shadows.findIndex(s=>{
      const dx=point.x-s.x,dy=point.y-s.y,d=Math.hypot(dx,dy);
      return d<43&&d>1&&(dx*s.facing.x+dy*s.facing.y)/d>.45;
    });
    const nibbles=1+(state.catches+state.day)%3;
    this.line={point,target:target<0?null:target,elapsed:0,nibbles,biteAt:1.25+nibbles*.85,species:fishSpecies[(state.catches+Math.max(0,target))%fishSpecies.length]};
    return target<0?'Line cast, but outside the fish’s view. Reel back and position the bobber in front of its head.':'A fish noticed the bobber. Nibbles are false alarms: reel only when it goes UNDER.';
  }
  tick(dt:number){if(this.line&&Number.isFinite(dt)&&dt>0)this.line.elapsed+=Math.min(.05,dt);}
  reel(state:GameState):Result {
    const line=this.line;this.cancel();
    if(!line)return {state,message:'Cast a line first.'};
    if(linePhase(line)!=='under')return {state,message:linePhase(line)==='escaped'?'Too late: the fish escaped.':line.target===null?'Line retrieved. Try casting in front of a fish shadow.':'Too early: the fish escaped during a nibble. Wait until the bobber goes under.'};
    return command(state,{type:'catch',species:line.species});
  }
}
