import { TimerComponents } from "./timer-components";

export class Timer {
    /**
     * Tempo totale del timer
     */
    private timerTime: number;

    /**
     * Tempo rimanente
     */
    private timeLeft: number;

    /**
     * Valore booleano per abilitare il timer 
     */
    enabled: boolean = false;

    /**
     * Componente grafico del timer
     */
    private timerComponent: TimerComponents;

    /**
     * Callback da chiamare quando il timer termina
     */
    cb: Function

    constructor(timerTime: number, cb: Function, enabled: boolean) {
        this.timerTime = timerTime;
        this.timeLeft = timerTime;
        this.enabled = enabled;
        this.cb = cb;
    }

    /**
     * Imposta il componente grafico del timer.
     * @param timerComponent Componente grafico del timer
     */
    setTimerComponent(timerComponent: TimerComponents) {
        timerComponent = timerComponent;
    }

    /**
     * Ritorna il componente grafico del timer.
     */
    getTimerComponent() {
        return this.timerComponent;
    }

    /**
     * Ritorna il tempo rimanente del timer.
     */
    getTimeLeft() {
        return this.timeLeft;
    }

    /**
     * Ritorna il tempo totale del timer.
     */
    getTimerTime() {
        return this.timerTime;
    }

    /**
     * Riduce il tempo rimanente del timer.
     */
    decreaseTimeLeft() {
        this.timeLeft--;
    }

}