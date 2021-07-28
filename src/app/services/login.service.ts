import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';

//TODO da rividere l'import
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

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
      const decoded_token: any = jwt_decode(token.value);
      this.tipologiaAccount.next(decoded_token.tipo);
    } else {
      this.tipologiaAccount.next("");
    }
  }

  //TODO
  login(credenziali: { username, password }): Observable<any> {
    return this.http.post('/login/utente', credenziali).pipe(
      map((data: any) => data.accessToken),
      switchMap(token => {
        Storage.set({ key: TOKEN_KEY, value: token });
        console.log(token);
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
}