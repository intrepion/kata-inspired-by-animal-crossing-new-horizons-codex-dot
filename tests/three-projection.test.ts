import {describe,it,expect} from 'vitest';
// The bundled runtime is tested directly without an additional type dependency.
// @ts-ignore
import {OrthographicCamera,Vector3} from '../src/vendor/three/three.module.min.js';
import {configureIslandCamera,islandGroundPoint} from '../src/world-three';
import {createGame,placementValid} from '../src/game';
import {inPond} from '../src/fishing';
describe('3D island ground picking',()=>{it('maps screen points back to the same world coordinates for overview, follow, and zoom views',()=>{
 for(const [w,h,zoom] of [[1200,850,1],[500,500,1],[1200,850,1.6]]){
  const camera=new OrthographicCamera(),state=createGame();configureIslandCamera(camera,w,h,state.player,zoom);
  for(const point of [{x:550,y:500},{x:895,y:335},{x:600,y:570}]){
   const screen=new Vector3(point.x/100,0,point.y/100).project(camera),hit=islandGroundPoint(camera,(screen.x+1)*w/2,(1-screen.y)*h/2,w,h)!;
   expect(hit.x).toBeCloseTo(point.x,6);expect(hit.y).toBeCloseTo(point.y,6);
   expect(placementValid(state,hit)).toBe(placementValid(state,point));expect(inPond(hit)).toBe(inPond(point));
  }
 }
});});
