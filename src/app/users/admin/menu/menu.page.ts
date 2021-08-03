import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';

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

  constructor() { }

  ngOnInit() {
  }

  async logout() {

  }
}
