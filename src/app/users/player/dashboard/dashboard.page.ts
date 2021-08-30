import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { IntroLobbyPopoverComponent } from '../popover/intro-lobby-popover/intro-lobby-popover.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  games = [];
  page = 0;
  maximumPages = 3;

  constructor(
    private popoverController: PopoverController,
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.loadGames();
  }

  ngOnInit() {
  }

  //TODO rinominare metodo
  async openPopover(event) {
    const popover = await this.popoverController.create({
      component: UserPopoverComponent,
      event,
      cssClass: 'contact-popover'
    });
    return await popover.present();
  }

  async openIntroLobby(game) {
    const giocoSelezionato = game;
    const popover = await this.popoverController.create({
      component: IntroLobbyPopoverComponent,
      componentProps: {
        giocoSelezionato: giocoSelezionato
      },
    });
    return await popover.present();
  }

  async loadGames(event?) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/games', { headers }).subscribe(
      async (res) => {
        this.games = this.games.concat(res['results']);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
      });
  }

  loadMore(event) {
    this.page++;
    this.loadGames(event);

    if (this.page === this.maximumPages) event.target.disabled = true;
  }
}
