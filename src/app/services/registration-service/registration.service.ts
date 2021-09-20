import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private http: HttpClient, private loginService: LoginService) { }

  /**
   * Effettua la chiamata REST-POST per la Registrazione dell'Utente.
   * @param credenziali Credenziali per la Registrazione
   * @returns L'esito della chiamata
   */
  register(credenziali): Observable<any> {
    return this.http.post('/register/utente', credenziali).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; }))
  }

  //TODO commentare
  registerOspiteToUtente(token, credenziali: { nome: string, cognome: string, password: string }): Observable<any> {
    const toSend = {
      "token": token,
      "nome": credenziali.nome,
      "cognome": credenziali.cognome,
      "password": credenziali.password
    }

    return this.http.post('/register/ospite-to-utente', toSend).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; }))
  }
}