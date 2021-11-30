import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { Router } from '@angular/router';
import { LoginControllerService } from 'src/app/services/login-controller/login-controller.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  credentials: FormGroup;

  constructor(
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private loginController: LoginControllerService,
    private router: Router
  ) { }


  ngOnInit() {
    this.credentials = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(10)]],
    });
  }
  
  /**
   * Effettua la Registrazione ed il Login di un Ospite.
   */
  async guestLogin() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.loginController.controllaUsername(this.credentials.value.username)) {
      this.loginService.loginOspiti(this.credentials.value).subscribe(
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

}