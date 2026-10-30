import type { Point, GameState } from './game';
import type { Scene } from './world';
export function configureIslandCamera(camera: any, width: number, height: number, player: Point, zoom: number): void;
export function islandGroundPoint(camera: any, x: number, y: number, width: number, height: number): Point | null;
export function createIslandThree(canvas: HTMLCanvasElement): {render(state: GameState, scene: Scene, width: number, height: number): void; setZoom(zoom: number): void; toWorld(x: number,y: number): Point | null; dispose(): void};
