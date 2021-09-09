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

  //TODO
  async loadToken() {
    const token = await Storage.get({ key: TOKEN_KEY });
    if (token && token.value) {
      const decodedToken: any = jwt_decode(token.value);
      this.tipologiaAccount.next(decodedToken.tipo);
    } else {
      this.tipologiaAccount.next("");
    }
  }

  //TODO
  async getToken() {
    const toReturn = await Storage.get({ key: TOKEN_KEY });
    if (toReturn.value == null) toReturn.value = '';
    return toReturn;
  }

  //TODO
  login(credenziali: { username, password }): Observable<any> {
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


  //TODO
  loginOspiti(credenziali: { username }): Observable<any> {
    console.log(credenziali.username);
    return this.http.post('/login/ospiti', credenziali).pipe(
      map((data: any) => data.accessToken),
      switchMap(token => {
        Storage.set({ key: TOKEN_KEY, value: token });
        console.log(token);
        //TODO
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

  //TODO
  async logout() {
    this.tipologiaAccount.next("");
    await Storage.remove({ key: TOKEN_KEY });
  }

  //TODO
  async setToken(token) {
    Storage.set({ key: TOKEN_KEY, value: token });
    this.loadToken();
  }
}