import * as THREE from './vendor/three/three.module.min.js';
import {resources,neighbors,home,workshop,placementValid} from './game';
import {shadows,linePhase} from './fishing';
export function configureIslandCamera(camera, width, height, player, zoom) {
 const follow=width<650||zoom>1, x=(follow?player.x:600)/100,z=(follow?player.y:425)/100;
 const halfHeight=5.7/zoom, aspect=width/height;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.near=.1;camera.far=100;camera.position.set(x,12,z+10);camera.lookAt(x,0,z);camera.updateProjectionMatrix();camera.updateMatrixWorld();
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
 box(home.x/100,0,home.y/100,1,.8,.8,'#f6e6c2');box(home.x/100,.8,home.y/100,1.2,.3,1,'#4f7f72');box(workshop.x/100,0,workshop.y/100,1,.45,.5,'#906a43');box(workshop.x/100,.65,workshop.y/100,1.1,.15,.65,'#eaa97f');
 const resourceMeshes=new Map();for(const r of resources){const g=new THREE.Group();scene.add(g);g.position.set(r.x/100,0,r.y/100);if(r.kind==='tree'){box(0,0,0,.15,.6,.15,'#946945',g);ball(0,.8,0,.45,'#6a9557',g);ball(.2,.8,.1,.08,'#f3c67f',g);}else if(r.kind==='rock')ball(0,.14,0,.23,'#abb2a0',g);else if(r.kind==='flower'){for(const x of [-.14,0,.14])ball(x,.13,0,.08,'#e9a29a',g);}else ball(0,.06,0,.1,'#fff0d1',g);resourceMeshes.set(r.id,g);}
 function character(color){const g=new THREE.Group();scene.add(g);box(0,.1,0,.27,.42,.25,color,g);ball(0,.65,0,.2,'#e5b68d',g);return g;}
 const player=character('#467b86');for(const n of neighbors){const g=character(n.color);g.position.set(n.x/100,0,n.y/100);}
 const fish=shadows.map(f=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.07,.35,8),material('#315f64'));m.rotation.z=Math.PI/2;m.position.set(f.x/100,.07,f.y/100);scene.add(m);return m;});
 const decor=new THREE.Group();scene.add(decor);let decorKey='';
 function furniture(kind){const g=new THREE.Group();if(kind==='bench'){box(0,.18,0,.7,.14,.3,'#d4ab74',g);box(0,.33,-.12,.7,.25,.08,'#b3875e',g);}else if(kind==='lantern'){box(0,0,0,.08,.6,.08,'#6e6952',g);box(0,.48,0,.22,.28,.22,'#f9d988',g);}else if(kind==='stool')box(0,0,0,.3,.28,.3,'#98714d',g);else if(kind==='planter'){box(0,0,0,.34,.22,.3,'#c48163',g);ball(0,.32,0,.12,'#f2d68b',g);}else if(kind==='rug')box(0,.02,0,.72,.04,.37,'#e3a085',g);else {box(0,0,0,.07,.45,.07,'#886849',g);box(0,.3,0,.45,.18,.08,'#d2ad7a',g);}return g;}
 const bobber=ball(0,.1,0,.07,'#e67755');const preview=disc(0,0,.35,.25,'#407c61',.06);let zoom=1;
 function render(state,view,w,h){renderer.setSize(w,h,false);configureIslandCamera(camera,w,h,state.player,zoom);player.position.set(state.player.x/100,0,state.player.y/100);
  for(const r of resources){const obj=resourceMeshes.get(r.id);obj.visible=!state.gathered.includes(r.id)||r.kind==='tree'||r.kind==='rock';if(r.kind==='tree')obj.children[2].visible=!state.gathered.includes(r.id);}
  const key=JSON.stringify(state.decorations);if(key!==decorKey){while(decor.children.length){const old=decor.children[0];old.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();mesh.material.dispose();}});decor.remove(old);}for(const d of state.decorations){const obj=furniture(d.kind);obj.position.set(d.x/100,0,d.y/100);decor.add(obj);}decorKey=key;}
  preview.visible=!!(view.placing&&view.hover);if(preview.visible){preview.position.x=view.hover.x/100;preview.position.z=view.hover.y/100;preview.material.color.set(placementValid(state,view.hover)?'#407c61':'#b45c54');}
  bobber.visible=!!view.fishing;if(view.fishing){bobber.position.set(view.fishing.point.x/100,.1,view.fishing.point.y/100);bobber.material.color.set(linePhase(view.fishing)==='under'?'#ffda77':'#e67755');}fish.forEach(f=>f.visible=true);renderer.render(scene,camera);}
 return {render,setZoom(value){zoom=value;},toWorld(clientX,clientY){const r=canvas.getBoundingClientRect();return islandGroundPoint(camera,clientX-r.left,clientY-r.top,r.width,r.height);},dispose:()=>renderer.dispose()};
}
