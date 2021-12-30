import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, Type, ViewChild } from '@angular/core';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
import { NoEditorWarningComponent } from '../no-editor-warning/no-editor-warning.component';
import { EditorItem } from './editor-item';
import { EditorDirective } from './editor.directive';

@Component({
  selector: 'app-editor-container',
  templateUrl: './editor-container.component.html',
  styleUrls: ['./editor-container.component.scss'],
})
export class EditorContainerComponent implements OnInit {
  /**
   * Il valore della variabile editorItem viene ottenuto dal component parent di questo component.
   */
  @Input() editorItem: EditorItem;

  @ViewChild(EditorDirective, { static: true }) editorHost!: EditorDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    if (this.editorItem) this.loadGameEditor();
    else this.loadComponent(NoEditorWarningComponent);
  }

  /**
   * Risolve il component contenuto in "editorItem" e lo istanzia dinamicamente all'interno
   * del template editorHost.
   */
  loadGameEditor() {
    const componentRef = this.loadComponent(this.editorItem.editor);
    componentRef.instance.config = this.editorItem.config;
  }

  /**
   * Risolve il component passato in input e lo istanzia dinamicamente all'interno
   * del template editorHost.
   * @param component Il component da istanziare dinamicamente.
   * @returns Il riferimento al component creato.
   */
  loadComponent(component: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const viewContainerRef = this.editorHost.viewContainerRef;
    viewContainerRef.clear();

    return viewContainerRef.createComponent<GameEditorComponent>(componentFactory);
  }
}
