import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertCreatorService } from '../alert-creator/alert-creator.service';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyManagerService {

  constructor(
    private loginService: LoginService,
    private http: HttpClient,
  ) { }

  async loadInfoLobby() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    return this.http.get('/lobby/info', { headers });
  }


  async getPartecipanti() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    return this.http.get('/lobby/giocatori', { headers });
  }

  async modificaLobby(pubblica) {
    const token_value = (await this.loginService.getToken()).value;

    const to_send = {
      'pubblica': pubblica,
      'token': token_value
    }

    return this.http.put('/lobby', to_send);
  }

  async eliminaPartecipante(username) {
    const token_value = (await this.loginService.getToken()).value;

    const headers = {
      'token': token_value,
      'username': username
    }
    return this.http.delete('/lobby/player', { headers });
  }

}