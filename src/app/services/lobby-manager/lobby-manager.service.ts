import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyManagerService {

  constructor(
    private loginService: LoginService,
    private http: HttpClient
  ) { }

  async getPartecipanti() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    return this.http.get('/lobby/giocatori', { headers });
  }
}
