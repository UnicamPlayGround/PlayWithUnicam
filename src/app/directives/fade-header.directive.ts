import { Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appFadeHeader]'
})
export class FadeHeaderDirective implements OnInit {

  @Input('appFadeHeader') toolbar: any;

  constructor(private domctrl: DomController) { }

  ngOnInit(): void {
    this.toolbar = this.toolbar.el;
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop >= 255) scrollTop = 255;

    const hexDist = scrollTop.toString(16).substring(0, 2);

    this.domctrl.write(() => {
      this.toolbar.style.setProperty('--background', `#1d3c62${hexDist}`);

      if (scrollTop > 100)
        this.toolbar.classList.add('toolbar-show-buttons');
      else this.toolbar.classList.remove('toolbar-show-buttons');
    })
  }

}
