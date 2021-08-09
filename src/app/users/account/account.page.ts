import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  old_username;
  utente;
  nome;
  cognome;
  username;

  constructor() {
    this.loadCredenziali();
  }

  ngOnInit() {
  }

  aggiornaProfilo() {
    //utente.modificaCredenziali

  }

  aggiornaPassword() {

  }

  loadCredenziali() {
    //TODO chiamata Rest
    this.nome = "nomeProva";
    this.cognome = "cognomeProva";
    this.username = "usernameProva";
  }
}
