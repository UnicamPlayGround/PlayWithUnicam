import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['../auth.scss'],
})
export class HomePage implements OnInit {
  credenziali: FormGroup;

  constructor(
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private router: Router
  ) { }


  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(10)]],
    });
  }

  /**
   * Apre la pagina del Login.
   */
  openLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /**
   * Effettua la Registrazione ed il Login di un Ospite.
   */
  async loginOspiti() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.controllaDati()) {
      this.loginService.loginOspiti(this.credenziali.value).subscribe(
        async (res) => {
          await loading.dismiss();

          switch (res) {
            case "1":
              this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
              break;
            case "0":
              this.alertCreator.createInfoAlert('Login fallito', 'Rieffettua il login');
              break;
            default:
              this.alertCreator.createInfoAlert('Login fallito', 'Rieffettua il login');
          }
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Login fallito!');
        }
      );
    } else await loading.dismiss();
  }

  /**
   * Controlla l'username per la registrazione dell'Ospite.
   * @returns *true* se l'username è valido, *false* altrimenti 
   */
  controllaDati() {
    const usernameToControl = this.credenziali.value.username;

    if (usernameToControl.trim() == "") {
      this.alertCreator.createInfoAlert("Errore nell'username!", "L'username non può essere vuoto.");
      return false;
    }

    if (usernameToControl.length > 10) {
      this.alertCreator.createInfoAlert("Errore nell'username!", "L'username non può superare 10 caratteri.");
      return false;
    }

    return true;
  }

}