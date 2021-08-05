import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobby-home',
  templateUrl: './lobby-home.page.html',
  styleUrls: ['./lobby-home.page.scss'],
})
export class LobbyHomePage implements OnInit {
  segment: string = "impostazioni";
  guests = [];
  gioco = { nome: 'Gioco 1', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' };
  pubblica = false;
  codice;


  ospiti = [
    { username: 'cipo' },
    { username: 'rondy' },
    { username: 'tommi' },
    { username: 'cla' },
    { username: 'gre' },
    { username: 'ludo' },
    { username: 'pippo' },
    { username: 'pluto' }
  ]

  constructor() {
    this.loadinfo();
    this.loadGuests();
  }

  ngOnInit() {

  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  loadinfo() {

  }

  loadGuests() {
    //TODO: chiamata REST
    this.guests = this.guests.concat(this.ospiti);
  }

  salvaModifiche() { 
    
  }

}
