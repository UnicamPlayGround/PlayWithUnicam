import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credenziali: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.loginService.login(this.credenziali.value).subscribe(
      async (res) => {
        await loading.dismiss();
        this.router.navigateByUrl('/user', { replaceUrl: true });
      },
      async (res) => {
        await loading.dismiss();
        console.log("Login fallito");
        //TODO da fare
        // this.errorManager.stampaErrore(res, 'Login Failed');
      }
    );
  }

}