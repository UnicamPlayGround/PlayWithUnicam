import { TimerComponents } from "./timer-components";

export class Timer {
    timerTime: number;
    enabled: boolean = false;
    timerComponent: TimerComponents;
    cb: Function

    constructor(timerTime: number, cb: Function, enabled: boolean) {
        this.timerTime = timerTime;
        this.enabled = enabled;
        this.cb = cb;
    }

}