import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { Game } from 'src/app/components/game';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { GameEditorService } from '../../services/game-editor/game-editor.service';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {
  games: Game[] = [];
  data: FormGroup;
  selectedGame: Game;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private modalCtrl: ModalController,
    private gameEditorService: GameEditorService
  ) {
    this.games = this.gameEditorService.getGames();
  }

  ngOnInit() {
    this.data = this.fb.group({
      name: ['', Validators.required],
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  selectGame(game: Game) {
    this.selectedGame = game;
  }

  /**
   * Dopo aver controllato i campi effettua la chiamata REST per creare il nuovo
   * gioco secondo i dati inseriti dall'utente.
   */
  async creaGioco() {
    if (this.selectedGame && this.data.value.name) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;

      var toSend: any = {};
      toSend.nome = this.data.value.name;
      toSend.tipo = this.selectedGame.getType();
      toSend.minGiocatori = this.selectedGame.getMinPlayers();
      toSend.maxGiocatori = this.selectedGame.getMaxPlayers();
      toSend.link = this.selectedGame.getUrl();
      toSend.attivo = false;
      toSend.config = this.selectedGame.getConfig();
      toSend.regolamento = null;

      toSend.token = tokenValue;

      this.http.post('/game/crea', toSend).subscribe(
        async (res) => {
          this.data.reset();
          this.alertCreator.createInfoAlert('Gioco creato', 'Il gioco è stato creato con successo.');
          await loading.dismiss();
          this.modalCtrl.dismiss(true);
        },
        async (res) => {
          this.data.reset();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Creazione gioco fallita');
        });
    } else this.alertCreator.createInfoAlert('Errore!', 'Compila tutti i campi!');
  }

}
