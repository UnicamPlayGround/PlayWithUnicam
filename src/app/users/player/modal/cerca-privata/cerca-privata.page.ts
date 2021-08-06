import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cerca-privata',
  templateUrl: './cerca-privata.page.html',
  styleUrls: ['./cerca-privata.page.scss'],
})
export class CercaPrivataPage implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  async partecipa(){

  }
}
