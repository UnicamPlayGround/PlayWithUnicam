import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { RegistrationService } from 'src/app/services/registration-service/registration.service';
import { Router } from "@angular/router";
import { RegistrationControllerService } from 'src/app/services/registration-controller/registration-controller.service';
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
    private errorManager: ErrorManagerService,
    private registrationController: RegistrationControllerService
  ) {
    this.controllaOspite();
  }

  ngOnInit() {
    this.riempiForm();
  }

  //TODO commentare
  private riempiForm() {
    this.credenziali = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      username: [this.usernameOspite, [Validators.required, Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
    });
  }

  //TODO commentare
  private async controllaOspite() {
    const token = (await this.loginService.getToken()).value;
    if (token) {
      const decodedToken: any = jwt_decode(token);
      if (decodedToken.tipo === 'OSPITE') {
        this.ospite = true;
        this.usernameOspite = decodedToken.username;
      }
    }
    this.riempiForm();
  }

  /**
   * Effettua la Registrazione dell'Utente.
   * //TODO aggiornare commento
   */
  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.registrationController.controllaDati(this.credenziali)) {
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

}