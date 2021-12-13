import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login-service/login.service';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  pages = [
    {
      title: 'Dashboard',
      icon: 'home',
      url: '/admin/dashboard'
    },
    {
      title: 'Utenti',
      icon: 'people',
      url: '/admin/users'
    },
    {
      title: 'Giochi',
      icon: 'game-controller',
      url: '/admin/games'
    }
  ]

  constructor(private router: Router,
    private loginService: LoginService,
    private alertCreator: AlertCreatorService) {

  }

  ngOnInit() {
  }

  /**
   * Effettua l'operazione di Logout.
   */
  async logout() {
    var message = "Sei sicuro di voler effettuare il logout?";
    this.alertCreator.createConfirmationAlert(message, () => {
      this.loginService.logout();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    });
  }
}
