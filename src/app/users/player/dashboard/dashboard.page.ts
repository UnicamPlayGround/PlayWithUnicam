import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';

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
    { name: 'Gioco 1', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 2', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 3', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 4', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 5', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 6', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 7', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 8', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 9', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 10', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 11', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 12', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 13', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 14', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 15', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' }
  ]

  constructor(
    private popoverController: PopoverController,
    private http: HttpClient
  ) {
    this.loadGames();
  }

  ngOnInit() {
  }

  async openPopover(event) {
    const popover = await this.popoverController.create({
      component: UserPopoverComponent,
      event,
      cssClass: 'contact-popover'
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
