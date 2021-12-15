export class Timer {
    timerTime: number;
    enabled: boolean = false;
    cb: Function

    constructor(timerTime: number, cb: Function, enabled: boolean) {
        this.timerTime = timerTime;
        this.enabled = enabled;
        this.cb = cb;
    }

}