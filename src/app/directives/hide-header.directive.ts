import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit, AfterViewInit {
  @Input('appHideHeader') toolbar: any;
  toolbar2: any;
  private toolbarHeight = 44;

  constructor(private renderer: Renderer2, private domctrl: DomController) { }

  ngAfterViewInit() {
    // console.log("this.toolbar: ", this.toolbar.el);
    // this.toolbar = this.toolbar.el;

    // this.domctrl.read(() => {
    //   this.toolbarHeight = this.toolbar.clientHeight;
    //   console.log("this.toolbar.color", this.toolbar.color);
    // });

    // this.domctrl.write(() => {
    //   this.renderer.setStyle(this.toolbar, 'height', `${650}px`);
    // });

    // this.domctrl.read(() => {
    //   this.toolbarHeight = this.toolbar.offsetHeight;
    //   console.log("this.toolbar.clientHeight", this.toolbar.height);
    // });

  }

  ngOnInit(): void {

  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event) {
    // const scrollTop = $event.detail.scrollTop;

    // let newPosition = (scrollTop / 5);
    // console.log("newPosition: " + newPosition);

    // if (newPosition < -this.toolbarHeight) {
    //   newPosition = -this.toolbarHeight;
    // }

    // if (newPosition > 48) {
    //   newPosition = 48;
    // }

    // let newOpacity = 1 - (newPosition / -this.toolbarHeight);

    // let newOpacity = 1 - (newPosition / 100);

    // this.domctrl.write(() => {
    // this.renderer.setStyle(this.toolbar, 'top', `${-newPosition}px`);
    // this.renderer.setStyle(this.toolbar, 'opacity', `${newOpacity}%`);
    // this.renderer.setStyle(this.toolbar, 'opacity', `${0}%`);
    // });

    // console.log("toolbarHeight: " + this.toolbarHeight);

  }

}
