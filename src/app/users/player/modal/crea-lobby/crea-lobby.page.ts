import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-crea-lobby',
  templateUrl: './crea-lobby.page.html',
  styleUrls: ['./crea-lobby.page.scss'],
})
export class CreaLobbyPage implements OnInit {
  @Input() giocoSelezionato;
  tipo = false;

  constructor(

  ) { }

  ngOnInit() {

  }

  stampaGioco() {
    console.log(this.giocoSelezionato);
  }
}
