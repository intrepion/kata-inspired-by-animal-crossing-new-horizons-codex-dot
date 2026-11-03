import {expect,it} from 'vitest';
import {createGame} from '../src/game';
import {syncCalendar,validCalendarDay,localCalendarDay} from '../src/calendar';
import {decodeSave,encodeSave} from '../src/save';
it('binds old saves without resetting progress and refreshes only on a later date',()=>{
 const old=createGame();old.gathered=['tree-1'];old.fulfilled=['pip'];
 const bound=syncCalendar(old,'2026-11-03');expect(bound.gathered).toEqual(old.gathered);expect(bound.day).toBe(1);
 const next=syncCalendar(bound,'2026-11-04');expect(next.day).toBe(2);expect(next.gathered).toEqual([]);expect(next.fulfilled).toEqual([]);expect(next.friendships).toEqual(old.friendships);
 expect(syncCalendar(next,'2026-11-04')).toBe(next);expect(syncCalendar(next,'2026-11-03')).toBe(next);
});
it('validates calendar dates and retains a bound date through saves',()=>{
 expect(validCalendarDay('2026-02-30')).toBe(false);expect(validCalendarDay('2028-02-29')).toBe(true);
 const s=syncCalendar(createGame(),'2026-11-03'),loaded=decodeSave(encodeSave(s));expect(loaded.ok&&loaded.state.calendarDay).toBe('2026-11-03');
 expect(decodeSave(encodeSave({...s,calendarDay:'wrong'})).ok).toBe(false);
 expect(localCalendarDay(new Date(2026,10,3,23))).toBe('2026-11-03');
});

it('refreshes once after a long absence while preserving the island and never mutating its input',()=>{
 const old=syncCalendar(createGame(),'2026-10-01');old.gathered=['tree-1'];old.fulfilled=['pip'];old.bag.wood=7;old.friendships.pip=3;
 const before=JSON.stringify(old),next=syncCalendar(old,'2026-11-03');
 expect(JSON.stringify(old)).toBe(before);expect(next.day).toBe(old.day+1);expect(next.bag).toEqual(old.bag);expect(next.friendships).toEqual(old.friendships);expect(next.decorations).toEqual(old.decorations);
 expect(syncCalendar(next,'2026-11-03')).toBe(next);expect(syncCalendar(next,'bad')).toBe(next);
});
