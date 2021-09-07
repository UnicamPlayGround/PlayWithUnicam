import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-cerca-privata',
  templateUrl: './cerca-privata.page.html',
  styleUrls: ['./cerca-privata.page.scss'],
})
export class CercaPrivataPage implements OnInit {
  codiceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private errorManager: ErrorManagerService,
    private loginService: LoginService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.codiceForm = this.fb.group({
      codice: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  /**
   * Chiude la Modal.
   */
  async closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Partecipa alla Lobby attraverso il codice inserito dall'Utente.
   */
  async partecipa() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.loginService.getToken()).value;

    const toSend = {
      'token': tokenValue,
      'codice_lobby': this.codiceForm.value.codice
    }

    this.http.post('/lobby/partecipa', toSend).subscribe(
      async (res) => {
        this.modalController.dismiss(true);
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.modalController.dismiss(false);
        this.errorManager.stampaErrore(res, 'Codice errato');
      });
  }
}
