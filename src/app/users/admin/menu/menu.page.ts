import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login-service/login.service';
import { AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  pages = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      url: '/admin/dashboard'
    },
    {
      title: 'Utenti',
      icon: 'people-outline',
      url: '/admin/users'
    },
    {
      title: 'Giochi',
      icon: 'game-controller-outline',
      url: '/admin/games'
    }
  ]

  constructor(private router: Router,
    private loginService: LoginService,
    private alertController: AlertController) { 
    
  }

  ngOnInit() {
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Sei sicuro di voler uscire?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
        },
        {
          text: 'Conferma',
          handler: () => {
            this.loginService.logout();
            this.router.navigateByUrl('/home', { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
  }
}
