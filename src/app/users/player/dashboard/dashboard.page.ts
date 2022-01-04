import { HttpClient } from '@angular/common/http';
import { AfterContentChecked, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { IntroLobbyPopoverComponent } from '../popover/intro-lobby-popover/intro-lobby-popover.component';
import jwt_decode from 'jwt-decode';
import Swiper, { SwiperOptions, Pagination, Navigation } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

Swiper.use([Pagination, Navigation]);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterContentChecked {
  games = [];
  ospite = false;

  breakpoints = {
    420: { slidesPerView: 1.5, spaceBetween: 20 },
    550: { slidesPerView: 2.2, spaceBetween: 20 },
    768: { slidesPerView: 2.6, spaceBetween: 40 },
    1024: { slidesPerView: 3.6, spaceBetween: 40 }
  }

  @ViewChild('gamesSwiper') gamesSwiper: SwiperComponent;

  constructor(
    private popoverController: PopoverController,
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.getTipoUtente();
    this.loadGames();
    // this.games = [
    //   { nome: "Gioco dell'Oca", min_giocatori: 1, max_giocatori: 6 },
    //   { nome: "Gioco dell'oca blockchain", min_giocatori: 1, max_giocatori: 100 },
    //   { nome: "Memory MP", min_giocatori: 1, max_giocatori: 20 },
    //   { nome: "Risiko", min_giocatori: 4, max_giocatori: 8 },
    //   { nome: "Battaglia navale", min_giocatori: 2, max_giocatori: 2 },
    //   { nome: "Forza 4", min_giocatori: 2, max_giocatori: 2 }
    // ];
  }

  ngAfterContentChecked() {
    if (this.gamesSwiper)
      this.gamesSwiper.updateSwiper({});
  }

  ngOnInit() { }

  /**
   * Imposta la variabile *"ospite"* a true se il tipo del JWT dell'Account è uguale a "OSPITE",
   * false se è uguale a "GIOCATORE".
   */
  async getTipoUtente() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    if (decodedToken.tipo === 'OSPITE') this.ospite = true;
    else if (decodedToken.tipo === 'GIOCATORE') this.ospite = false;
    // console.log(this.ospite);
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
    return await popover.present();
  }

  /**
   * Carica le Informazioni dei Giochi della Piattaforma.
   */
  async loadGames() {
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

}
