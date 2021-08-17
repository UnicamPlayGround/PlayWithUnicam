import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

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
    private errorManager: ErrorManagerService,
    private http: HttpClient,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
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

  riempiForm() {
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


  //TODO rigenerare il token
  async aggiornaProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.logService.getToken()).value;
    var to_send = {
      'nome': this.dati.value.nome,
      'cognome': this.dati.value.cognome,
      'token': token_value,
    }

    this.http.put('/player/profilo', to_send).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          await this.aggiornaUsername(token_value);
          loading.dismiss();
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica Fallita');
        });
  }

  //TODO
  async aggiornaUsername(token) {

    if (this.user.username === this.dati.value.username) {
      this.alertCreator.createInfoAlert("Profilo aggiornato", "Il profilo è stato aggiornato");
    } else {
      var to_send = {
        'new_username': this.dati.value.username,
        'token': token,
      }

      this.http.put('/player/username', to_send).pipe(
        map((data: any) => data.accessToken),
        switchMap(token => {
          console.log("nuovo token: " + token);
          this.logService.setToken(token);
          return '1';
        })).subscribe(
          async (res) => {
            this.alertCreator.createInfoAlert("Profilo aggiornato", "Il profilo è stato aggiornato");
            this.getDatiProfilo();
          },
          async (res) => {
            this.dati.value.username = this.user.username;
            this.errorManager.stampaErrore(res, 'Modifica Fallita');
          });
    }
  }

  async aggiornaPassword() {
    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.logService.getToken()).value;
    const to_send = {
      'old_password': this.passwords.value.old_password,
      'new_password': this.passwords.value.new_password,
      'token': token_value
    }
    if (this.passwords.value.new_password == this.passwords.value.password_confirmed) {
      this.http.put('/modifica/password', to_send).pipe(
        map((data: any) => data.esito),
        switchMap(esito => { return esito; })).subscribe(
          async (res) => {
            const text = 'La password del tuo account è stata aggiornata';
            await loading.dismiss();
            this.alertCreator.createInfoAlert("Password aggiornata", "La password è stata aggiornata");
          },
          async (res) => {
            await loading.dismiss();
            this.errorManager.stampaErrore(res, 'Modifica Fallita');
          });
    }
    else {
      this.alertCreator.createInfoAlert("Le password non corrispondono", "La password di conferma non corrsiponde alla nuova password");
      await loading.dismiss();
    }



  }


}
