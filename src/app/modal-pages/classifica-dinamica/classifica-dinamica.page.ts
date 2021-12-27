import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-classifica-dinamica',
  templateUrl: './classifica-dinamica.page.html',
  styleUrls: ['./classifica-dinamica.page.scss'],
})
export class ClassificaDinamicaPage implements OnInit {
  classifica = [];
  calcolaClassifica;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.classifica = this.navParams.get('classifica');
    this.calcolaClassifica = this.navParams.get('callback');
    this.calcolaClassifica();
  }

  /**
   * Chiude la modal della classifica.
   */
  closeModal() {
    this.modalController.dismiss();
  }
}
