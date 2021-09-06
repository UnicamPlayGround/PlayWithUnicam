import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  data: FormGroup;
  passwordForm: FormGroup;

  @Input() game: any;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private navParams: NavParams) { }

  ngOnInit() {
    this.game = this.navParams.get('game');

    this.data = this.fb.group({
      nome: [this.game.nome],
      tipo: [this.game.tipo],
      maxGiocatori: [this.game.max_giocatori],
      minGiocatori: [this.game.min_giocatori],
      link: [this.game.link],
      attivo: [this.game.attivo]
    });
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  salvaModifiche() {

  }
}
