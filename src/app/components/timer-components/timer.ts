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
    callback: Function

    constructor(timerTime: number, enabled: boolean, cb?: Function) {
        this.timerTime = timerTime;
        this.timeLeft = timerTime;
        this.enabled = enabled;
        this.callback = cb;
    }

    /**
     * Avvia il timer.
     */
    startTimer() {
        this.enabled = true;
        this.timerComponent.startTimer();
    }

    /**
     * Imposta il componente grafico del timer.
     * @param timerComponent Componente grafico del timer
     */
    setTimerComponent(timerComponent: TimerComponents) {
        timerComponent = timerComponent;
    }

    setCallback(cb) {
        this.callback = cb;
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