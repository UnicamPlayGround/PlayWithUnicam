import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[editorHost]',
})

/**
 * La directive che permette al container degli editor di gioco di inserire
 * dinamicamente i component degli editor all'interno di un determinato
 * template contrassegnato dalla keyword "editorHost".
 */
export class EditorDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}