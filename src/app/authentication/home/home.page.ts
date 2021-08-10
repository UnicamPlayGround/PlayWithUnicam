import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['../auth.scss'],
})
export class HomePage implements OnInit {
  credenziali: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) { }


  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(6)]],
    });
  }

  openLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async loginOspiti() {
    console.log("username : " + this.credenziali.value);
    const loading = await this.loadingController.create();
    await loading.present();

    this.loginService.loginOspiti(this.credenziali.value).subscribe(
      async (res) => {
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Login Fallito!');
      }
    );
  }
}
