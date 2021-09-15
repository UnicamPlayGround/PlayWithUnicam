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

  /**
   * Effettua la chiamata REST per caricare le informazioni della lobby.
   * @returns la response della chiamata
   */
  async loadInfoLobby() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    return this.http.get('/lobby/info', { headers });
  }

  /**
   * Effettua la chiamata REST per caricare le informazioni della partita.
   * @returns la response della chiamata
   */
  async loadInfoPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    return this.http.get('/game/status', { headers });
  }

  /**
   * Effettua la chiamata REST per caricare le informazioni dei partecipanti della lobby.
   * @returns la response della chiamata
   */
  async getPartecipanti() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    return this.http.get('/lobby/giocatori', { headers });
  }

  /**
   * Effettua la chiamata REST per modificare le informazioni della lobby.
   * @param pubblica Nuovo stato della lobby *(pubblica => true, privata => false)*
   * @returns la response della chiamata
   */
  async modificaLobby(pubblica: boolean) {
    const tokenValue = (await this.loginService.getToken()).value;

    const toSend = {
      'pubblica': pubblica,
      'token': tokenValue
    }

    return this.http.put('/lobby', toSend);
  }

  /**
   * Effettua la chiamata REST per espellere un partecipante della lobby.
   * @param username Username del partecipante da espellere
   * @returns la response della chiamata
   */
  async eliminaPartecipante(username) {
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = {
      'token': tokenValue,
      'username': username
    }
    return this.http.delete('/lobby/admin/espelli', { headers });
  }

  /**
   * Effettua la chiamata REST per abbandonare una lobby.
   * @returns la response della chiamata
   */
  async abbandonaLobby() {
    console.log('HAI ABBANDONATO 2');
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = { 'token': tokenValue }
    return this.http.delete('/lobby/abbandona', { headers });
  }

  /**
   * Effettua la chiamata REST per svolgere l'operazione di ping. 
   * @returns la response della chiamata
   */
  async ping() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return this.http.post('/lobby/ping', toSend);
  }

  /**
   * Effettua la chiamata REST per iniziare una partita.
   * @returns la response della chiamata
   */
  async iniziaPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return this.http.post('/partita', toSend);
  }
}