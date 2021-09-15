import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    this.getDatiProfilo();
  }

  ngOnInit() {
    this.passwords = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      passwordConfirmed: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
    });
    this.riempiForm();

  }

  /**
   * Riempe il Form per la modifica dei Dati dell'Account con i dati presi dal Server.
   */
  riempiForm() {
    this.dati = this.fb.group({
      username: [this.user.username, [Validators.required]],
      nome: [this.user.nome, [Validators.required]],
      cognome: [this.user.cognome, [Validators.required]]
    })
  }

  /**
   * Richiede i dati dell'Account dal Server.
   */
  async getDatiProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.logService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/info/utente', { headers }).subscribe(
      async (res) => {
        this.user = await res['results'][0];
        this.riempiForm();
        await loading.dismiss();
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Errore');
        await loading.dismiss();
      });
  }

  /**
   * Salva i nuovi dati dell'Account *(nome, cognome)* sul Server.
   */
  async aggiornaProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.logService.getToken()).value;
    var toSend = {
      'nome': this.dati.value.nome,
      'cognome': this.dati.value.cognome,
      'token': tokenValue,
    }

    this.http.put('/player/profilo', toSend).subscribe(
      async (res) => {
        await this.aggiornaUsername(tokenValue);
        loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica fallita');
      });
  }

  /**
   * Salva il nuovo Username dell'Account sul Server.
   * @param token JWT dell'Account 
   */
  async aggiornaUsername(token) {
    if (this.user.username === this.dati.value.username) {
      this.alertCreator.createInfoAlert("Profilo aggiornato", "Il profilo è stato aggiornato");
    } else {
      var toSend = {
        'new_username': this.dati.value.username,
        'token': token,
      }

      this.http.put('/player/username', toSend).pipe(
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
            this.errorManager.stampaErrore(res, 'Modifica fallita');
          });
    }
  }

  /**
   * Salva la nuova Password dell'Account sul Server.
   */
  async aggiornaPassword() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.logService.getToken()).value;

    const toSend = {
      'old_password': this.passwords.value.oldPassword,
      'new_password': this.passwords.value.newPassword,
      'token': tokenValue
    }

    if (this.passwords.value.newPassword == this.passwords.value.passwordConfirmed) {
      this.http.put('/modifica/password', toSend).subscribe(
        async (res) => {
          const text = 'La password del tuo account è stata aggiornata';
          await loading.dismiss();
          this.alertCreator.createInfoAlert("Password aggiornata", "La password è stata aggiornata");
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica fallita');
        });
    }
    else {
      this.alertCreator.createInfoAlert("Le password non corrispondono", "La password di conferma non corrisponde alla nuova password");
      await loading.dismiss();
    }
  }

  backButton() {
    this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
  }

}