import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private http: HttpClient) { }

  register(credenziali): Observable<any> {
    return this.http.post('/register/utente', credenziali).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; }))
  }
}