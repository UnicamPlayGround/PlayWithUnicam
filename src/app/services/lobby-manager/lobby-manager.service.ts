import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyManagerService {

  constructor(
    private loginService: LoginService,
    private http: HttpClient
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
      'token': token_value,
    }

    return this.http.put('/lobby', to_send);
  }

}