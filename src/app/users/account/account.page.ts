import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  dati: FormGroup;
  passwords: FormGroup;
  user = { 'username': null, 'nome': null, 'cognome': null, 'password': null, 'salt': null, 'tipo': null };

  constructor(    
    private loadingController: LoadingController,
    private logService: LoginService,
    private alertController: AlertController,
    private errorManager: ErrorManagerService,
    private http: HttpClient,
    private fb: FormBuilder,
    ) {
      this.getDatiProfilo();
  }

  ngOnInit() {
    this.passwords = this.fb.group({
      old_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      new_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      password_confirmed: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
    });
    this.riempiForm();
    
  }

  riempiForm(){
    this.dati = this.fb.group({
      username: [this.user.username, [Validators.required]],
      nome: [this.user.nome, [Validators.required]],
      cognome: [this.user.cognome, [Validators.required]]
    })
  }
  
  async getDatiProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();
    const token_value = (await this.logService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/info/utente', { headers }).subscribe(
      async (res) => {
        const tmp = await res['results'];
        this.user = tmp[0];
        this.riempiForm();
        await loading.dismiss();
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Errore');
        await loading.dismiss();
      });
  }
  
  async aggiornaProfilo() {

    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.logService.getToken()).value;
    const to_send = {
      'nome': this.dati.value.nome,
      'cognome': this.dati.value.cognome,
      'username': this.dati.value.username,
      'token_value': token_value,
    }

    this.http.put('/player/profilo', to_send).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          const text = 'I tuoi dati sono stati aggiornati';
          //this.getDatiProfilo();
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Profilo aggiornato',
            message: text,
            buttons: ['OK'],
          });
          await alert.present();
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica Fallita');
        });
  }

  async aggiornaPassword() {
    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.logService.getToken()).value;
    const to_send = {
      'old_password': this.passwords.value.old_password,
      'new_password': this.passwords.value.new_password,
      'token_value': token_value
    }

    this.http.put('/modifica/password/' + this.user.username, to_send).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          const text = 'La password del tuo account è stata aggiornata';
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Password aggiornata',
            message: text,
            buttons: ['OK'],
          });
          await alert.present();
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica Fallita');
        });

  }


}
