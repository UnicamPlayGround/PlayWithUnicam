import { Injectable } from '@angular/core';
import { AlertCreatorService } from '../alert-creator/alert-creator.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationControllerService {

  constructor(private alertCreator: AlertCreatorService) { }

  /**
   * Controlla i dati in input per la registrazione di un Utente.
   * @param dati Dati da controllare per effettuare la registrazione
   * @returns *true* se i dati sono validi, *false* altrimenti 
   */
  controllaDati(dati) {
    return (this.controllaNome(dati.value.nome) && this.controllaCognome(dati.value.cognome) && this.controllaUsername(dati.value.username) && this.controllaPassword(dati.value.password));
  }

  /**
   * Controlla il nome in input per la registrazione di un Utente.
   * @param toControl Nome da controllare
   * @returns *true* se il nome è valido, *false* altrimenti 
   */
  private controllaNome(toControl: string) {
    const errorHeader = "Errore nel nome!";
    if (this.controlLengthString(toControl, 35, errorHeader, "Il nome non può superare 35 caratteri."))
      if (this.controlString(toControl, errorHeader, "Il nome non può essere vuoto."))
        return true;

    return false;
  }

  /**
   * Controlla il cognome in input per la registrazione di un Utente.
   * @param toControl Cognome da controllare
   * @returns *true* se il cognome è valido, *false* altrimenti 
   */
  private controllaCognome(toControl: string) {
    const errorHeader = "Errore nel cognome!";
    if (this.controlString(toControl, errorHeader, "Il cognome non può essere vuoto."))
      if (this.controlLengthString(toControl, 35, errorHeader, "Il cognome non può superare 35 caratteri."))
        return true;

    return false;
  }

  /**
   * Controlla l'username in input per la registrazione di un Utente.
   * @param toControl Username da controllare
   * @returns *true* se l'username è valido, *false* altrimenti 
   */
  controllaUsername(toControl: string) {
    const errorHeader = "Errore nell'username!";
    if (this.controlString(toControl, errorHeader, "L'username non può essere vuoto."))
      if (this.controlLengthString(toControl, 10, errorHeader, "L'username non può superare 10 caratteri."))
        return true;

    return false;
  }

  /**
   * Controlla la password in input per la registrazione di un Utente.
   * @param toControl Password da controllare
   * @returns *true* se la password è valida, *false* altrimenti 
   */
  controllaPassword(toControl: string) {
    if (toControl.trim() == "" || toControl.length > 16 || toControl.length < 8) {
      this.alertCreator.createInfoAlert("Errore nella password!", "La password deve essere compresa tra 8 e 16 caratteri.");
      return false;
    }
    return true;
  }

  /**
   * Controlla che la lunghezza della stringa *"toControl"* sia minore di *maxLenght*.
   * @param toControl Stringa da controllare
   * @param maxLength Lunghezza massima della stringa 
   * @param errorHeader Header del messaggio d'errore
   * @param errorText Testo del messaggio d'errore
   * @returns *true* se la stringa è valida, *false* altrimenti 
   */
  private controlLengthString(toControl: string, maxLength: number, errorHeader: string, errorText: string) {
    if (toControl.length > maxLength) {
      this.alertCreator.createInfoAlert(errorHeader, errorText);
      return false;
    }
    return true;
  }

  /**
   * Controlla che la stringa *"toControl"* sia diversa dalla striga vuota.
   * @param toControl Stringa da controllare
   * @param errorHeader Header del messaggio d'errore
   * @param errorText Testo del messaggio d'errore
   * @returns *true* se la stringa è valida, *false* altrimenti 
   */
  private controlString(toControl: string, errorHeader: string, errorText: string) {
    if (toControl.trim() == "") {
      this.alertCreator.createInfoAlert(errorHeader, errorText);
      return false;
    }
    return true
  }

}