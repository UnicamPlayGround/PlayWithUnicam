/**
 * Web Worker per la gestione di un timer.
 */

addEventListener('message', ({ data: time }) => {
    setInterval(() => { postMessage(null); }, time);
});