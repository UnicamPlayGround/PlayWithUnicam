import { Type } from '@angular/core';

/**
 * Definisce gli oggetti di tipo editor che saranno caricati dinamicamente
 * a seconda del gioco.
 */
export class EditorItem {
    constructor(public editor: Type<any>, public config: any) { }
}