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
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  credentials: FormGroup;
  guest = false;
  guestUsername = "";

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
    this.checkGuest();
  }

  ngOnInit() {
    this.fillForm();
  }

  //TODO commentare
  private fillForm() {
    this.credentials = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      username: [this.guestUsername, [Validators.required, Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
    });
  }

  //TODO commentare
  private async checkGuest() {
    const token = (await this.loginService.getToken()).value;
    if (token) {
      const decodedToken: any = jwt_decode(token);
      if (decodedToken.tipo === 'OSPITE') {
        this.guest = true;
        this.guestUsername = decodedToken.username;
      }
    }
    this.fillForm();
  }

  /**
   * Effettua la Registrazione dell'Utente.
   * //TODO aggiornare commento
   */
  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.registrationController.controllaDati(this.credentials)) {
      if (this.guest)
        this.registerGuest(loading);
      else
        this.registerUser(loading);
    } else await loading.dismiss();
  }

  //TODO commentare
  private async registerGuest(loading) {
    const token = (await this.loginService.getToken()).value;

    this.registrationService.registerOspiteToUtente(token, this.credentials.value).subscribe(
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
  private registerUser(loading) {
    this.registrationService.register(this.credentials.value).subscribe(
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