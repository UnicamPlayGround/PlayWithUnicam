import { Injectable } from '@angular/core';
import { RegistrationControllerService } from '../registration-controller/registration-controller.service';

@Injectable({
  providedIn: 'root'
})
export class LoginControllerService {

  constructor(private registrationController: RegistrationControllerService) { }

  /**
   * Controlla i dati in input per il login di un Utente.
   * @param dati Dati da controllare per effettuare il login
   * @returns *true* se i dati sono validi, *false* altrimenti 
   */
  controllaDati(dati) {
    return (this.registrationController.controllaUsername(dati.value.username) && this.registrationController.controllaPassword(dati.value.password));
  }

  /**
   * Controlla l'Username in input per il login dell'Utente/Ospite.
   * @param toControl Username da controllare
   * @returns *true* se l'username è valido, *false* altrimenti 
   */
  controllaUsername(toControl: string) {
    return this.registrationController.controllaUsername(toControl);
  }

}