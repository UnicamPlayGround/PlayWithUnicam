import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { LoginService } from '../../services/login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanLoad {
  constructor(private loginService: LoginService, private router: Router) { }

  canLoad(): Observable<boolean> {
    return this.loginService.tipologiaAccount.pipe(
      filter(val => val !== null),
      take(1),
      map(tipologiaToken => {
        if (tipologiaToken == 'ADMIN')
          return true;
        else {
          this.router.navigateByUrl('/home');
          return false;
        }
      }))
  }

}