import { ActivatedRoute } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController } from '@ionic/angular';
import { LoginControllerService } from 'src/app/services/login-controller/login-controller.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ModalLoginPage } from '../../authentication/modal-login/modal-login.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-by-link',
  templateUrl: './login-by-link.page.html',
  styleUrls: ['../auth.scss'],
})

export class LoginByLinkPage implements OnInit {
  credenziali: FormGroup;
  codiceLobby: number;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private http: HttpClient,
    private modalController: ModalController,
    private router: Router,
    private loadingController: LoadingController,
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private activatedRoute: ActivatedRoute,
    private loginController: LoginControllerService,
  ) { }


  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    })
    this.getCodiceLobby();
  }

  /**
   * Effettua il login come ospite per entrare nella lobby a cui si intende partecipare tramite link
   */
  async loginOspiti() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.loginController.controllaUsername(this.credenziali.value.username)) {
      this.loginService.loginOspiti(this.credenziali.value).subscribe(
        async (res) => {
          const tokenValue = (await this.loginService.getToken()).value;
          await loading.dismiss();

          const toSend = {
            'token': tokenValue,
            'codice_lobby': this.codiceLobby
          }

          switch (res) {
            case "1":
              this.http.post('/lobby/partecipa', toSend).subscribe(
                async (res) => {
                  this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
                  await loading.dismiss();
                },
                async (res) => {
                  await loading.dismiss();
                  this.errorManager.stampaErrore(res, 'Impossibile partecipare alla lobby');
                });
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
    }
  }

  /**
   * Ottiene il codice della lobby dall'URL di invito
   */
  private getCodiceLobby() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.codiceLobby = params['codiceLobby'];
      if (this.codiceLobby == null) {
        this.router.navigateByUrl("/home", { replaceUrl: true });
        this.alertCreator.createInfoAlert("ERRORE", "Il link non è associato a nessuna lobby!")
      }
    })
  }

  /**
   * Apre la modal per l'autenticazione prima di entrare nella lobby a cui si intende partecipare tramite link
   * @returns apre la modal
   */
  async accedi() {
    const modal = await this.modalController.create({
      component: ModalLoginPage,
      cssClass: 'fullscreen'
    });

    return await modal.present();
  }
}