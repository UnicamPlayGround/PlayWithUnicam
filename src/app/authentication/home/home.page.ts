import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

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
    private loadingController: LoadingController
  ) { }


  ngOnInit() {
    this.credenziali = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(6)]],
    });
  }

  openLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async start() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
    await loading.dismiss();

  }
}
