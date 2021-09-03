import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    return this.http.get('/lobby/info', { headers });
  }

  async getPartecipanti() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    return this.http.get('/lobby/giocatori', { headers });
  }

  async modificaLobby(pubblica) {
    const tokenValue = (await this.loginService.getToken()).value;

    const toSend = {
      'pubblica': pubblica,
      'token': tokenValue
    }

    return this.http.put('/lobby', toSend);
  }

  async eliminaPartecipante(username) {
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = {
      'token': tokenValue,
      'username': username
    }
    return this.http.delete('/lobby/admin/espelli', { headers });
  }

  async abbandonaLobby() {
    console.log('HAI ABBANDONATO 2');
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = { 'token': tokenValue }
    return this.http.delete('/lobby/abbandona', { headers });
  }

  async ping() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return this.http.post('/lobby/ping', toSend);
  }

  async iniziaPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return this.http.post('/partita', toSend);
  }
}