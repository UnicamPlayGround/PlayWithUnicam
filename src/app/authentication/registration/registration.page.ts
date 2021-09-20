import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { RegistrationService } from 'src/app/services/registration-service/registration.service';
import { Router } from "@angular/router";
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['../auth.scss'],
})
export class RegistrationPage implements OnInit {
  credenziali: FormGroup;
  ospite = false;
  usernameOspite = "";

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private router: Router,
    private registrationService: RegistrationService,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.controllaOspite();
  }

  ngOnInit() {
    this.credenziali = this.fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
    })
  }

  //TODO commentare
  private async controllaOspite() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    if (decodedToken.tipo === 'OSPITE') {
      this.ospite = true;
      this.usernameOspite = decodedToken.username;
      console.log("USERNAME CONST: ", this.usernameOspite);
    }
  }

  /**
   * Effettua la Registrazione dell'Utente.
   * //TODO aggiornare commento
   */
  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.controllaDati()) {
      if (this.ospite)
        this.registrazioneOspiteToUtente(loading);
      else
        this.registrazioneUtente(loading);
    } else await loading.dismiss();
  }

  //TODO commentare
  private async registrazioneOspiteToUtente(loading) {
    const token = (await this.loginService.getToken()).value;

    this.registrationService.registerOspiteToUtente(token, this.credenziali.value).subscribe(
      async (res) => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
        await this.loginService.logout();
        await loading.dismiss();
        var message = "Ora puoi effettuare il login!";
        this.alertCreator.createInfoAlert('Registrazione completata', message);
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Registrazione fallita');
      }
    );
  }

  //TODO commentare
  private registrazioneUtente(loading) {
    this.registrationService.register(this.credenziali.value).subscribe(
      async (res) => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
        await loading.dismiss();
        var message = "Ora puoi effettuare il login!";
        this.alertCreator.createInfoAlert('Registrazione completata', message);
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Registrazione fallita');
      }
    );
  }

  /**
   * Controlla i dati in input per la registrazione di un Utente.
   * @returns *true* se i dati sono validi, *false* altrimenti 
   */
  controllaDati() {
    return (this.controllaNome() && this.controllaCognome() && this.controllaUsername() && this.controllaPassword());
  }

  /**
   * Controlla il nome in input per la registrazione di un Utente.
   * @returns *true* se il nome è valido, *false* altrimenti 
   */
  controllaNome() {
    const errorHeader = "Errore nel nome!";
    if (this.controlLengthString(this.credenziali.value.nome, 35, errorHeader, "Il nome non può superare 35 caratteri."))
      if (this.controlString(this.credenziali.value.nome, errorHeader, "Il nome non può essere vuoto."))
        return true;

    return false;
  }

  /**
   * Controlla il cognome in input per la registrazione di un Utente.
   * @returns *true* se il cognome è valido, *false* altrimenti 
   */
  controllaCognome() {
    const errorHeader = "Errore nel cognome!";
    if (this.controlString(this.credenziali.value.cognome, errorHeader, "Il cognome non può essere vuoto."))
      if (this.controlLengthString(this.credenziali.value.cognome, 35, errorHeader, "Il cognome non può superare 35 caratteri."))
        return true;

    return false;
  }

  /**
   * Controlla l'username in input per la registrazione di un Utente.
   * @returns *true* se l'username è valido, *false* altrimenti 
   */
  controllaUsername() {
    if (this.ospite)
      return true;

    const errorHeader = "Errore nell'username!";
    if (this.controlString(this.credenziali.value.username, errorHeader, "L'username non può essere vuoto."))
      if (this.controlLengthString(this.credenziali.value.username, 10, errorHeader, "L'username non può superare 10 caratteri."))
        return true;

    return false;
  }

  /**
   * Controlla la password in input per la registrazione di un Utente.
   * @returns *true* se la password è valida, *false* altrimenti 
   */
  controllaPassword() {
    if (this.credenziali.value.password.trim() == "" || this.credenziali.value.password.length > 16 || this.credenziali.value.password.length < 8) {
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
  controlLengthString(toControl, maxLength, errorHeader, errorText) {
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
  controlString(toControl, errorHeader, errorText) {
    if (toControl.trim() == "") {
      this.alertCreator.createInfoAlert(errorHeader, errorText);
      return false;
    }
    return true
  }
}