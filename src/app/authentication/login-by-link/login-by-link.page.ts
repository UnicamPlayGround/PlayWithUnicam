import { ActivatedRoute } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController } from '@ionic/angular';
import { LoginControllerService } from 'src/app/services/login-controller/login-controller.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-login-by-link',
  templateUrl: './login-by-link.page.html',
  styleUrls: ['./login-by-link.page.scss'],
})

export class LoginByLinkPage implements OnInit {
  guestCredentials: FormGroup;
  credentials: FormGroup;
  codiceLobby: number;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private activatedRoute: ActivatedRoute,
    private loginController: LoginControllerService,
  ) {
    this.controllaJWT();
  }

  ngOnInit() {
    this.guestCredentials = this.fb.group({
      username: ['', [Validators.required]],
    });
    this.credentials = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    })
    this.getCodiceLobby();
  }

  /**
   * Controlla se è presente un JWT valido in memoria, in caso positivo inizia l'operazione per partecipare
   * alla lobby.
   */
  private async controllaJWT() {
    const tokenValue = (await this.loginService.getToken()).value;
    if (tokenValue) {
      const decodedToken: any = jwt_decode(tokenValue);

      if (decodedToken.tipo == "GIOCATORE" || decodedToken.tipo == "OSPITE") {
        const toSend = {
          'token': tokenValue,
          'codice_lobby': this.codiceLobby
        }
        this.partecipaLobby(toSend);
      }
    }
  }

  /**
   * Effettua il login come ospite per entrare nella lobby a cui si intende partecipare tramite link
   */
  async loginOspiti() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.loginController.controllaUsername(this.guestCredentials.value.username)) {
      this.loginService.loginOspiti(this.guestCredentials.value).subscribe(
        async (res) => {
          const tokenValue = (await this.loginService.getToken()).value;
          await loading.dismiss();

          const toSend = {
            'token': tokenValue,
            'codice_lobby': this.codiceLobby
          }

          switch (res) {
            case "1":
              this.partecipaLobby(toSend);
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
 * Effettua il login per partecipare alla lobby relativa al link di condivisione
 */
  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.loginController.controllaDati(this.credentials)) {
      this.loginService.login(this.credentials.value).subscribe(
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
            case "2":
              this.router.navigateByUrl('/admin', { replaceUrl: true });
              break;
            default:
              this.alertCreator.createInfoAlert('Login fallito', 'Rieffettua il login');
          }
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Login fallito');
        }
      );
    } else await loading.dismiss();
  }

  /**
   * Partecipa alla lobby.
   * @param toSend Dati da mandare al Server per partecipare alla lobby
   */
  private partecipaLobby(toSend: { token: string, codice_lobby: number }) {
    this.http.post('/lobby/partecipa', toSend).subscribe(
      async (res) => {
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile partecipare alla lobby');
      });
  }

  /**
   * Ottiene il codice della lobby dall'URL di invito
   */
  private getCodiceLobby() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.codiceLobby = params['codiceLobby'];
      if (this.codiceLobby == null) {
        this.router.navigateByUrl("/home", { replaceUrl: true });
        this.alertCreator.createInfoAlert("Errore", "Il link non è associato a nessuna lobby!")
      }
    })
  }

}