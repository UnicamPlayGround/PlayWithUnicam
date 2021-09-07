import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private http: HttpClient) { }

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
}