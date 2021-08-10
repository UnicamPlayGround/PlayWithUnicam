import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.scss'],
})
export class LoginPage implements OnInit {
  credenziali: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private errorManager: ErrorManagerService
  ) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.loginService.login(this.credenziali.value).subscribe(
      async (res) => {
        await loading.dismiss();

        switch (res) {
          case "1":
            this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
            break;
          case "2":
            this.router.navigateByUrl('/admin', { replaceUrl: true });
            break;
          default:
            const alert = await this.alertController.create({
              header: 'Login fallito',
              message: "Rieffettua il Login",
              buttons: ['OK'],
            });
            await alert.present();
        }
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Login Fallito');
      }
    );
  }

}