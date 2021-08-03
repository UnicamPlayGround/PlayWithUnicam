import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobby-home',
  templateUrl: './lobby-home.page.html',
  styleUrls: ['./lobby-home.page.scss'],
})
export class LobbyHomePage implements OnInit {
  segment: string = "impostazioni";


  constructor() { }

  ngOnInit() {
    
  }

  segmentChanged(ev: any){
    this.segment = ev.detail.value;
  }

}
