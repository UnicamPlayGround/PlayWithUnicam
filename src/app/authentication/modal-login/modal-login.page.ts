import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modal-login',
  templateUrl: './modal-login.page.html',
  styleUrls: ['./modal-login.page.scss'],
})
export class ModalLoginPage implements OnInit {
  
  credenziali: FormGroup;
  codiceLobby : number;

  constructor(
    private fb : FormBuilder,
    private http : HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController, 
    private loadingController: LoadingController,
    private loginService: LoginService,
    private router : Router, 
    private alertCreator: AlertCreatorService, 
    private errorManager: ErrorManagerService
  ) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.getCodiceLobby();
  }

  /**
   * Effettua il login per partecipare alla lobby relativa al link di condivisione
   */
  async login(){
    const loading = await this.loadingController.create();
    await loading.present();

    this.loginService.login(this.credenziali.value).subscribe(
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
                this.modalController.dismiss(true);
                this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
                await loading.dismiss();
              },
              async (res) => {
                await loading.dismiss();
                this.modalController.dismiss(false);
                this.errorManager.stampaErrore(res, 'Impossibile partecipare alla lobby');
              });
            break;
          case "2":
            this.modalController.dismiss();
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
  }

  /**
   * Prende il codice della lobby dal link di condivisione
   */
  private getCodiceLobby(){
    this.activatedRoute.queryParams.subscribe(params =>{
      this.codiceLobby = params['codiceLobby'];
    })
  }
}
