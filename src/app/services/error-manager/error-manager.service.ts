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

  /**
   * Mostra a video un alert contenente un errore generato a seguito del
   * controllo della response passata in input.
   * @param res response
   * @param headerText header dell'alert
   */
  stampaErrore(res, headerText) {
    if (this.controllaRes(res)) this.stampa(headerText, res.error)
  }

  /**
   * Controlla la response passata  in input e, in base al suo valore,
   * stampa l'errore relativo ed effettua le dovute operazioni.
   * @param res 
   * @returns true se la res. error non corrisponde a nessuno dei due valori confrontati,
   * false altrimenti.
   */
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

  /**
   * Mostra a video un alert personalizzato in base ai paramentri passati in input.
   * @param headerText header dell'alert
   * @param messageText messaggio dell'alert
   */
  private async stampa(headerText, messageText) {
    this.alertCreator.createInfoAlert(headerText, messageText);
  }
}
