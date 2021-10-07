import { EventEmitter } from "@angular/core";

/**
 * Definisce i requisiti di un editor di gioco, che implementerà questa
 * interfaccia.
 */
export interface GameEditorComponent {
  config: any;
  updateConfigEvent: EventEmitter<Object>;
}