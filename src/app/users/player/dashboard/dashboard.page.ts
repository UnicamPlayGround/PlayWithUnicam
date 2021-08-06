import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { IntroLobbyPopoverComponent } from '../popover/intro-lobby-popover/intro-lobby-popover.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  games = [];
  page = 0;
  maximum_pages = 3;

  giochi = [
    { id: 1, nome: 'Gioco 1', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 2, nome: 'Gioco 2', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 3, nome: 'Gioco 3', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 4, nome: 'Gioco 4', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 5, nome: 'Gioco 5', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 6, nome: 'Gioco 6', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 7, nome: 'Gioco 7', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 8, nome: 'Gioco 8', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 9, nome: 'Gioco 9', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 10, nome: 'Gioco 10', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 11, nome: 'Gioco 11', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 12, nome: 'Gioco 12', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 13, nome: 'Gioco 13', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 14, nome: 'Gioco 14', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' },
    { id: 15, nome: 'Gioco 15', min_giocatori: 2, max_giocatori: 6, img: 'https://bit.ly/376IQJU' }
  ]

  constructor(
    private popoverController: PopoverController,
    private http: HttpClient
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
    console.log(giocoSelezionato);
    const popover = await this.popoverController.create({
      component: IntroLobbyPopoverComponent,
      componentProps: {
        giocoSelezionato: giocoSelezionato
      },
    });
    return await popover.present();
  }

  loadGames(event?) {
    // this.http.get('https://randomuser.me/api/?results=20&page=${this.page}')
    //   .subscribe(res => {
    //     this.games = this.games.concat(res['results']);

    //     if (event) event.target.complete();
    //   });
    this.games = this.games.concat(this.giochi);
  }

  loadMore(event) {
    this.page++;
    this.loadGames(event);

    if (this.page === this.maximum_pages) event.target.disabled = true;
  }
}
