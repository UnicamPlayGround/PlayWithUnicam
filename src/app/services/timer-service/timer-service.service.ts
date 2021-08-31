import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerServiceService {

  constructor() { }

  /**
   * Crea un Timer collegato ad un Callback.
   * @param cb Callback
   * @param time Intervallo di tempo per il timer
   * @returns il Timer
   */
  getTimer(cb, time) {
    return setInterval(() => { cb(); }, time);
  }

  /**
   * Ferma uno o più timers passati come argomenti.
   * @param timers I timers da fermare
   */
  stopTimers(...timers) {
    timers.forEach(timer => {
      clearTimeout(timer);
    });
  }
}