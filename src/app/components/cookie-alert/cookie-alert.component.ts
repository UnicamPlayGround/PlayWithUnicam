import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-alert',
  templateUrl: './cookie-alert.component.html',
  styleUrls: ['./cookie-alert.component.scss'],
})
export class CookieAlertComponent implements OnInit {
  cookieAccepted = false;
  
  constructor() { }

  ngOnInit() { }

  closeCookieAlert() {
    this.cookieAccepted = true;
  }
}
