import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  data: FormGroup;
  passwordForm: FormGroup;

  @Input() username: any;
  @Input() nome: any;
  @Input() cognome: any;
  @Input() tipo: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertCreator: AlertCreatorService,
    private navParams: NavParams,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) { }

  ngOnInit() {
    this.username = this.navParams.get('username');
    this.nome = this.navParams.get('nome');
    this.cognome = this.navParams.get('cognome');
    this.tipo = this.navParams.get('tipo');

    this.data = this.fb.group({
      username: [this.username],
      nome: [this.nome],
      cognome: [this.cognome],
      tipo: [this.tipo]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]]
    });
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  async editUser() {
    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.loginService.getToken()).value;
    const to_send = {
      'token': token_value,
      'new_username': this.data.value.username,
      'new_nome': this.data.value.nome,
      'new_cognome': this.data.value.cognome,
      'new_tipo': this.data.value.tipo
    }

    //TODO: fare chiamata REST per modificare l'utente

    this.http.put('/admin/utenti/' + this.username, to_send).subscribe(
      async (res) => {
        this.modalController.dismiss(this.data.value);
        const message = "I dati dell'utente sono stati aggiornati";
        await loading.dismiss();
        this.alertCreator.createInfoAlert('Profilo aggiornato', message);
      },
      async (res) => {
        this.modalController.dismiss();
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica Fallita');
      });
  }

  async changePassword() {
    //TODO: fare chiamata REST per modificare la password
  }
}
