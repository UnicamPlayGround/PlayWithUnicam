import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from "@angular/router";
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['../auth.scss'],
})
export class RegistrationPage implements OnInit {
  credenziali: FormGroup

  constructor(private fb: FormBuilder,
    private loadingController: LoadingController,
    private router: Router,
    private registrationService: RegistrationService,
    private alertController: AlertController) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    })
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.registrationService.register(this.credenziali.value).subscribe(
      async (res) => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Registrazione completata',
          message: "Ora puoi effettuare il login!",
          buttons: ['OK'],
        });
        await alert.present();
      },
      async (res) => {
        //TODO dismiss
        await loading.dismiss();
        //this.errorManager.stampaErrore(res, 'Registrazione fallita');
      }
    );
  }
}