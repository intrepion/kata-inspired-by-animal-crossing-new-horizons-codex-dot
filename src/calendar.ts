import type {GameState} from './game';
export function localCalendarDay(date:Date):string {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validCalendarDay(value:unknown):value is string {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function syncCalendar(state:GameState,today:string):GameState {
 if(!validCalendarDay(today)||state.calendarDay===today)return state;
 // First use binds old saves without consuming their current island day.
 if(!state.calendarDay)return {...state,calendarDay:today};
 // Moving the clock backwards never grants another refresh.
 if(today<state.calendarDay)return state;
 return {...state,calendarDay:today,day:Math.min(1_000_000,state.day+1),gathered:[],fulfilled:[]};
}
