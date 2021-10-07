import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
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

  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();

  @ViewChild(EditorDirective, { static: true }) editorHost!: EditorDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  /**
   * Quando questo component riceve un evento da qualcuno dei suoi child component contenente
   * un certo valore, emette a sua volta un nuovo evento contenente tale valore, che verrà poi
   * catturato dal componente parent.
   */
  updateConfig(newConfig: Object) {
    this.updateConfigEvent.emit(newConfig);
  }

  /**
   * Risolve il component contenuto in "editorItem" e lo istanzia dinamicamente all'interno
   * del template editorHost.
   */
  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.editorItem.editor);
    const viewContainerRef = this.editorHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<GameEditorComponent>(componentFactory);
    componentRef.instance.config = this.editorItem.config;
    componentRef.instance.updateConfigEvent.subscribe(newConfig => this.updateConfig(newConfig));
  }
}
