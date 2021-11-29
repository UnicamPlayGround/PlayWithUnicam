import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';

import { Storage } from '@capacitor/storage';

const TOKEN_KEY = "JWT_ACCOUNT";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  tipologiaAccount: BehaviorSubject<String> = new BehaviorSubject<String>(null);

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  /**
   * Carica il JSON Web Token memorizzato in memoria.
   */
  async loadToken() {
    const token = await Storage.get({ key: TOKEN_KEY });
    if (token && token.value) {
      const decodedToken: any = jwt_decode(token.value);
      this.tipologiaAccount.next(decodedToken.tipo);
    } else {
      this.tipologiaAccount.next("");
    }
  }

  /**
   * Ritorna il JSON Web Token.
   * @returns il JWT
   */
  async getToken() {
    const toReturn = await Storage.get({ key: TOKEN_KEY });
    if (toReturn.value == null) toReturn.value = '';
    return toReturn;
  }

  /**
   * Effettua l'operazione di Login dell'Utente.
   * @param credenziali *(username, password)* dell'Utente
   * @returns 1 se il tipo del JWT in ritorno è *"GIOCATORE"*, 2 se è *"ADMIN"*, 0 altimenti
   */
  login(credenziali: { username: string, password: string }): Observable<any> {
    return this.http.post('/login/utente', credenziali).pipe(
      map((data: any) => data.accessToken),
      switchMap(token => {
        const decodedToken: any = jwt_decode(token);
        Storage.set({ key: TOKEN_KEY, value: token });

        switch (decodedToken.tipo) {
          case "GIOCATORE": return "1";
          case "ADMIN": return "2";
          default: return "0";
        }
      }),
      tap(_ => {
        this.loadToken();
      })
    )
  }

  /**
   * Effettua l'operazione di Login dell'Ospite.
   * @param credenziali *username* dell'Ospite
   * @returns 1 se il login è stato effettuato con successo, 0 altrimenti
   */
  loginOspiti(credenziali: { username: string }): Observable<any> {
    return this.http.post('/login/ospiti', credenziali).pipe(
      map((data: any) => data.accessToken),
      switchMap(token => {
        Storage.set({ key: TOKEN_KEY, value: token });

        if (token == null)
          return "0";
        else
          return "1";
      }),
      tap(_ => {
        this.loadToken();
      })
    )
  }

  /**
   * Effettua l'operazione di logout.
   */
  async logout() {
    const tokenValue = (await this.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.delete('/logout/ospite', { headers }).subscribe(
      async (res) => {
        this.tipologiaAccount.next("");
        await Storage.remove({ key: TOKEN_KEY });
      },
      async (res) => {
        this.tipologiaAccount.next("");
        await Storage.remove({ key: TOKEN_KEY });
        console.log("Logout fallito!");
      });
  }

  /**
   * Salva il nuovo JSON Web Token.
   * @param token Nuovo JWT
   */
  async setToken(token) {
    Storage.set({ key: TOKEN_KEY, value: token });
    this.loadToken();
  }
}