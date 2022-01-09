import { HttpClient } from '@angular/common/http';
import { AfterContentChecked, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { IntroLobbyPopoverComponent } from '../popover/intro-lobby-popover/intro-lobby-popover.component';
import jwt_decode from 'jwt-decode';
import Swiper, { SwiperOptions, Pagination, Navigation } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { CreateGamePage } from '../../admin/modal-pages/create-game/create-game.page';

Swiper.use([Pagination, Navigation]);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterContentChecked {
  games = [];
  tipoUtente: string;
  breakpoints = {
    420: { slidesPerView: 1.5, spaceBetween: 20 },
    550: { slidesPerView: 2.2, spaceBetween: 20 },
    768: { slidesPerView: 2.6, spaceBetween: 40 },
    1024: { slidesPerView: 3.6, spaceBetween: 40 }
  }

  @ViewChild('gamesSwiper') gamesSwiper: SwiperComponent;

  constructor(
    private popoverController: PopoverController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente)
          if (tipoUtente == "ADMIN") this.tipoUtente = tipoUtente;
      }
    ).then(_ => { this.loadGames(); });
  }

  ngAfterContentChecked() {
    if (this.gamesSwiper)
      this.gamesSwiper.updateSwiper({});
  }

  ngOnInit() { }

  async createGame() {
    const modal = await this.modalCtrl.create({
      component: CreateGamePage,
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const newGameCreated = data['data'];

      if (newGameCreated)
        this.loadGames()
    });

    return await modal.present();
  }

  async openUserPopover(event) {
    const popover = await this.popoverController.create({
      component: UserPopoverComponent,
      event,
      cssClass: 'popover'
    });
    return await popover.present();
  }

  /**
   * Apre il popover per:
   * * creare una lobby,
   * * ricercare le lobby pubbliche,
   * * partecipare ad una lobby privata.
   */
  async openIntroLobby(game) {
    const giocoSelezionato = game;
    const popover = await this.popoverController.create({
      component: IntroLobbyPopoverComponent,
      componentProps: {
        giocoSelezionato: giocoSelezionato
      },
      cssClass: 'popover'
    });

    popover.onDidDismiss().then((data) => {
      const modified = data['data'];

      if (modified) {
        this.loadGames();
        console.log("Modified, games reloaded.");

      }
    });

    return await popover.present();
  }

  /**
   * Carica le Informazioni dei Giochi della Piattaforma.
   */
  async loadGames() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    var url: string;
    if (this.tipoUtente == "ADMIN") url = '/games/admin';
    else url = '/games';

    this.http.get(url, { headers }).subscribe(
      async (res) => {
        this.games = res['results'];
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
      });
  }

}
