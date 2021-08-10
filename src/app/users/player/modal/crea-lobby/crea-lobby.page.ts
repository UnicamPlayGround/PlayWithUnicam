import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-crea-lobby',
  templateUrl: './crea-lobby.page.html',
  styleUrls: ['./crea-lobby.page.scss'],
})
export class CreaLobbyPage implements OnInit {
  @Input() giocoSelezionato;
  tipo = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
    private loginService: LoginService
  ) { }

  ngOnInit() { }

  async closeModal() {
    this.modalController.dismiss();
  }

  async creaLobby() {
    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.loginService.getToken()).value;

    const toSend = {
      token: token_value,
      idGioco: this.giocoSelezionato.id,
      pubblica: this.tipo
    }

    return this.http.post('/lobby', toSend).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          const alert = await this.alertController.create({
            header: 'Lobby creata',
            message: "La Lobby è stata creata, ora è possibile iniziare a giocare.",
            buttons: ['OK'],
          });
          this.modalController.dismiss();
          this.router.navigateByUrl('/lobby', { replaceUrl: true });
          await loading.dismiss();
          await alert.present();
        },
        async (res) => {
          await loading.dismiss();
          this.modalController.dismiss();
          //TODO da fare
          this.errorManager.stampaErrore(res, 'Creazione Lobby fallita');
        });
  }

}