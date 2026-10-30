import * as THREE from './vendor/three/three.module.min.js';
import {resources,neighbors,home,workshop,placementValid} from './game';
import {shadows,linePhase} from './fishing';
export function configureIslandCamera(camera, width, height, player, zoom) {
 const x=player.x/100,z=player.y/100;
 const halfHeight=1.9/zoom, aspect=width/height;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.near=.1;camera.far=100;camera.position.set(x,8,z+6);camera.lookAt(x,0,z);camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
export function islandGroundPoint(camera, x, y, width, height) {
 const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/width*2-1,1-y/height*2),camera);const hit=new THREE.Vector3();
 if(!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),hit))return null;
 return {x:hit.x*100,y:hit.z*100};
}
export function createIslandThree(canvas) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));const scene=new THREE.Scene();scene.background=new THREE.Color('#80c3bd');scene.add(new THREE.HemisphereLight('#fff4d3','#648f75',2));
 const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100), material=color=>new THREE.MeshLambertMaterial({color});
 function box(x,y,z,w,h,d,color,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y+h/2,z);parent.add(m);return m;}
 function ball(x,y,z,r,color,parent=scene){const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material(color));m.position.set(x,y,z);parent.add(m);return m;}
 function disc(x,z,rx,rz,color,y=0){const m=new THREE.Mesh(new THREE.CircleGeometry(1,48),material(color));m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.position.set(x,y,z);scene.add(m);return m;}
 disc(6,4.35,5.2,3.55,'#f2dba6');disc(6,4.26,4.73,3.05,'#91b974',.01);disc(8.95,3.35,1.05,.78,'#76bfc2',.03);
 box(home.x/100,0,home.y/100,1,.8,.8,'#f6e6c2');box(home.x/100,.8,home.y/100,1.2,.3,1,'#4f7f72');box(home.x/100,0,home.y/100+.41,.23,.48,.05,'#9a6b4d');box(home.x/100-.31,.38,home.y/100+.42,.18,.22,.05,'#91cbc5');box(workshop.x/100,0,workshop.y/100,1,.45,.5,'#906a43');box(workshop.x/100,.65,workshop.y/100,1.1,.15,.65,'#eaa97f');
 const resourceMeshes=new Map();for(const r of resources){const g=new THREE.Group();scene.add(g);g.position.set(r.x/100,0,r.y/100);if(r.kind==='tree'){box(0,0,0,.15,.6,.15,'#946945',g);ball(0,.8,0,.45,'#6a9557',g);ball(.2,.8,.1,.08,'#f3c67f',g);}else if(r.kind==='rock')ball(0,.14,0,.23,'#abb2a0',g);else if(r.kind==='flower'){for(const x of [-.14,0,.14])ball(x,.13,0,.08,'#e9a29a',g);}else ball(0,.06,0,.1,'#fff0d1',g);resourceMeshes.set(r.id,g);}
 function character(color,species){const g=new THREE.Group();scene.add(g);
  ball(-.09,.08,0,.09,'#705746',g);ball(.09,.08,0,.09,'#705746',g);
  box(0,.12,0,.3,.35,.23,color,g);ball(0,.58,0,.22,species?'#ead7b9':'#e5b68d',g);
  if(species){ball(-.14,.79,0,.11,color,g);ball(.14,.79,0,.11,color,g);ball(0,.53,.2,.09,'#f2e5ce',g);}else{ball(0,.75,-.02,.19,'#74543f',g);}
  ball(-.08,.6,.19,.025,'#34443a',g);ball(.08,.6,.19,.025,'#34443a',g);return g;}
 const player=character('#467b86');const residents=neighbors.map(n=>{const g=character(n.color,n.species);g.position.set(n.x/100,0,n.y/100);return g;});
 const fish=shadows.map(f=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.07,.35,8),material('#315f64'));m.rotation.z=Math.PI/2;m.position.set(f.x/100,.07,f.y/100);scene.add(m);return m;});
 const decor=new THREE.Group();scene.add(decor);let decorKey='';
 function furniture(kind){const g=new THREE.Group();if(kind==='bench'){box(0,.18,0,.7,.14,.3,'#d4ab74',g);box(0,.33,-.12,.7,.25,.08,'#b3875e',g);}else if(kind==='lantern'){box(0,0,0,.08,.6,.08,'#6e6952',g);box(0,.48,0,.22,.28,.22,'#f9d988',g);}else if(kind==='stool')box(0,0,0,.3,.28,.3,'#98714d',g);else if(kind==='planter'){box(0,0,0,.34,.22,.3,'#c48163',g);ball(0,.32,0,.12,'#f2d68b',g);}else if(kind==='rug')box(0,.02,0,.72,.04,.37,'#e3a085',g);else {box(0,0,0,.07,.45,.07,'#886849',g);box(0,.3,0,.45,.18,.08,'#d2ad7a',g);}return g;}
 const interaction=disc(0,0,.22,.22,'#f7edbb',.07);
 const harvest=new THREE.Group();scene.add(harvest);for(const x of [-.19,0,.19])ball(x,0,0,.075,'#ffdf8c',harvest);
 const rod=box(.15,.48,.02,.035,.035,.9,'#73543e',player);rod.rotation.x=-.5;
 const lineGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
 const line=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'#f8f5e6'}));scene.add(line);
 const bobber=ball(0,.1,0,.07,'#e67755');const preview=disc(0,0,.35,.25,'#407c61',.06);let zoom=1;
 function render(state,view,w,h){renderer.setSize(w,h,false);configureIslandCamera(camera,w,h,state.player,zoom);player.position.set(state.player.x/100,0,state.player.y/100);if(view.facing)player.rotation.y=Math.atan2(view.facing.x,view.facing.y);player.position.y=view.moving?Math.abs(Math.sin(performance.now()/115))*.045:0;
  for(const r of resources){const obj=resourceMeshes.get(r.id);obj.visible=!state.gathered.includes(r.id)||r.kind==='tree'||r.kind==='rock';if(r.kind==='tree'){obj.children[2].visible=!state.gathered.includes(r.id);const fade=Math.hypot(r.x-state.player.x,r.y-state.player.y)<85;obj.traverse(m=>{if(m.isMesh){m.material.transparent=fade;m.material.opacity=fade?.32:1;m.material.depthWrite=!fade;}});}}
  residents.forEach((g,i)=>{const n=neighbors[i],d=Math.hypot(n.x-state.player.x,n.y-state.player.y);g.rotation.y=d<110?Math.atan2(state.player.x-n.x,state.player.y-n.y):Math.sin(performance.now()/1800+i)*.12;g.position.y=view.reduced?0:Math.sin(performance.now()/950+i)*.015;});
  const nearby=[...neighbors,...resources,home,workshop].sort((a,b)=>Math.hypot(a.x-state.player.x,a.y-state.player.y)-Math.hypot(b.x-state.player.x,b.y-state.player.y))[0];interaction.visible=!view.rod&&!view.placing&&Math.hypot(nearby.x-state.player.x,nearby.y-state.player.y)<82;if(interaction.visible){interaction.position.x=nearby.x/100;interaction.position.z=nearby.y/100;}
  const key=JSON.stringify(state.decorations);if(key!==decorKey){while(decor.children.length){const old=decor.children[0];old.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();mesh.material.dispose();}});decor.remove(old);}for(const d of state.decorations){const obj=furniture(d.kind);obj.position.set(d.x/100,0,d.y/100);decor.add(obj);}decorKey=key;}
  preview.visible=!!(view.placing&&view.hover);if(preview.visible){preview.position.x=view.hover.x/100;preview.position.z=view.hover.y/100;preview.material.color.set(placementValid(state,view.hover)?'#407c61':'#b45c54');}
  harvest.visible=!!view.effect&&performance.now()<view.effect.until;if(harvest.visible){const age=1-(view.effect.until-performance.now())/1400;harvest.position.set(view.effect.point.x/100,.4+age*.8,view.effect.point.y/100);harvest.rotation.y=age*4;harvest.scale.setScalar(1-age*.6);}
  rod.visible=!!view.rod;line.visible=!!view.fishing;bobber.visible=!!view.fishing;
  fish.forEach((f,i)=>{const base=shadows[i];let t=0;if(view.fishing?.target===i)t=Math.min(.8,view.fishing.elapsed/Math.max(.1,view.fishing.biteAt)*.8);f.position.set((base.x+(view.fishing?.point.x-base.x||0)*t)/100,.07,(base.y+(view.fishing?.point.y-base.y||0)*t)/100);});
  if(view.fishing){const phase=linePhase(view.fishing),y=phase==='under'?.015:phase==='nibble'?.055:.1;bobber.position.set(view.fishing.point.x/100,y,view.fishing.point.y/100);bobber.material.color.set(phase==='under'?'#ffda77':'#e67755');const pos=lineGeometry.attributes.position;pos.setXYZ(0,player.position.x,.65,player.position.z);pos.setXYZ(1,bobber.position.x,y,bobber.position.z);pos.needsUpdate=true;lineGeometry.computeBoundingSphere();}renderer.render(scene,camera);}
 return {render,setZoom(value){zoom=value;},toWorld(clientX,clientY){const r=canvas.getBoundingClientRect();return islandGroundPoint(camera,clientX-r.left,clientY-r.top,r.width,r.height);},dispose:()=>renderer.dispose()};
}
