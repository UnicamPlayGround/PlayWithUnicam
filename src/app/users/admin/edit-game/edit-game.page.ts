import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  segment: string = "info";
  gameName: String = "Memory";
  active: boolean = false;
  regulation: String;

  constructor() { }

  ngOnInit() { }

  print() {
    console.log(this.gameName);
    console.log(this.active);
    console.log(this.regulation);
  }
}
