import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from '../alert-creator/alert-creator.service';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorManagerService {

  constructor(
    private alertCreator: AlertCreatorService,
    private router: Router,
    private loginService: LoginService
  ) { }

  //TODO commentare
  stampaErrore(res, headerText) {
    if (this.controllaRes(res)) this.stampa(headerText, res.error)
  }

  private controllaRes(res) {
    if (res.error == 'Errore, JWT non valido! Rieffettua il login.') {
      this.stampa('Errore nella sessione', 'Rieffettua il login');
      this.loginService.logout();
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return false;
    } else if (res.error == 'Errore: devi partecipare ad una lobby!') {
      this.stampa('Sei stato espulso', "L'admin ti ha rimosso dalla lobby.");
      this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
      return false;
    } else return true;
  }

  private async stampa(headerText, messageText) {
    this.alertCreator.createInfoAlert(headerText, messageText);
  }
}
