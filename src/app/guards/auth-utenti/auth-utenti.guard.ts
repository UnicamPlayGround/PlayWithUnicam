import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthUtentiGuard implements CanLoad {
  constructor(private loginService: LoginService, private router: Router) { }

  canLoad(): Observable<boolean> {
    return this.loginService.tipologiaAccount.pipe(
      filter(val => val !== null),
      take(1),
      map(tipologiaToken => {
        if (tipologiaToken == 'ADMIN' || tipologiaToken == 'GIOCATORE')
          return true;
        else {
          this.router.navigateByUrl('/home');
          return false;
        }
      }))
  }

}