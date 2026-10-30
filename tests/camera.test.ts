import { describe, expect, it } from 'vitest';
import { cameraTransform } from '../src/world';
describe('island camera', () => {
 it('keeps the player centered when zoomed and preserves invertible ground coordinates', () => {
  const player={x:800,y:330}, t=cameraTransform(1200,850,player,1.6);
  expect(t.ox+player.x*t.scale).toBeCloseTo(600);
  expect(t.oy+player.y*t.scale).toBeCloseTo(425);
  const point={x:725,y:405};
  expect(((t.ox+point.x*t.scale)-t.ox)/t.scale).toBeCloseTo(point.x);
  expect(((t.oy+point.y*t.scale)-t.oy)/t.scale).toBeCloseTo(point.y);
  expect(cameraTransform(1200,850,player,1).ox).toBe(0);
 });
});
