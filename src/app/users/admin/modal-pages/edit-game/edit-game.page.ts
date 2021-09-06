import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  segment: string = "info";
  games = [];
  mostraConfig = false;
  data: FormGroup;
  attivo = true;
  config: string = "";

  @Input() game: any;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private navParams: NavParams) { }

  ngOnInit() {
    this.game = this.navParams.get('game');

    this.data = this.fb.group({
      nome: [this.game.nome],
      tipo: [this.game.tipo],
      minGiocatori: [this.game.min_giocatori],
      maxGiocatori: [this.game.max_giocatori],
      link: [this.game.link],
      attivo: [this.game.attivo]
    });
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  salvaModifiche() {

  }

  salvaConfig() {

  }
}
