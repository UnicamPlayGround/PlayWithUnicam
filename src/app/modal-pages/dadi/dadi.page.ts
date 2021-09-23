import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-dadi',
  templateUrl: './dadi.page.html',
  styleUrls: ['./dadi.page.scss'],
})
export class DadiPage implements OnInit {
  dadi = [];
  lancio = 0;
  dieRollAudio;

  @Input() nDadi: any;

  constructor(private modalController: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.nDadi = this.navParams.get('nDadi');

    for (let i = 1; i < this.nDadi + 1; i++) {
      this.dadi.push('die-' + i);
    }

    this.dieRollAudio = document.getElementById("die-roll-audio"); 

    setTimeout(() => {
      this.rollDice();
    }, 100);
  }

  rollDice() {   
    this.dieRollAudio.play();

    setTimeout(() => {
      this.modalController.dismiss(this.lancio);
    }, 2500);

    const dice: NodeListOf<HTMLElement> = document.querySelectorAll(".die-list");
    dice.forEach(die => {
      var randomNumber = this.getRandomNumber(1, 6);
      this.toggleClasses(die);
      die.dataset.roll = randomNumber;
      this.lancio += randomNumber;
    });
  }

  toggleClasses(die) {
    die.classList.toggle("odd-roll");
    die.classList.toggle("even-roll");
  }

  /**
   * Restituisce un numero casuale tra 'min' e 'max'.
   * @param min numero minimo 
   * @param max numero massimo
   * @returns un numero casuale tra 'min' e 'max'
   */
  getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
