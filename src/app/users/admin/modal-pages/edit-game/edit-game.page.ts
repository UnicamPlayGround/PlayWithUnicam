import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EditorItem } from '../../components/editor-container/editor-item';
import { GameEditorService } from '../../services/game-editor/game-editor.service';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  segment: string = "info";
  data: FormGroup;
  attivo = true;
  regolamento: string = "";
  editorItem: EditorItem;

  @Input() game: any;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private navParams: NavParams,
    private gameEditorService: GameEditorService) {
  }

  ngOnInit() {
    this.game = this.navParams.get('game');   

    if (this.game.config)
      this.editorItem = this.gameEditorService.getProperEditor(this.game.config);

    this.data = this.fb.group({
      nome: [this.game.nome],
      attivo: [this.game.attivo]
    });

    if (this.game.regolamento)
      this.regolamento = this.game.regolamento;
  }

  updateConfig(newConfig: Object) {
    this.game.config = newConfig;
  }

  /**
   * Chiude la Modal.
   */
  async closeModal() {
    this.modalController.dismiss();
  }

  async deleteGame() {
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare questo gioco?", async () => {
      this.delete();
    });
  }

  //TODO commentare
  async delete() {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = { 'token': tokenValue, 'game': String(this.game.id) };

    this.http.delete('/admin/game', { headers }).subscribe(
      async (res) => {
        this.modalController.dismiss(true);
        loading.dismiss();
        this.alertCreator.createInfoAlert("Eliminazione completata", "Il gioco '" + this.game.nome + "' è stato eliminato con successo!");
      },
      async (res) => {
        this.modalController.dismiss(true);
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Eliminazione fallita');
      });
  }

  //TODO commentare
  async salvaModifiche() {
    if (this.controllaCampi()) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;
      var toSend = this.data.value;
      toSend.id = this.game.id;
      toSend.regolamento = this.regolamento;
      toSend.config = this.game.config;

      toSend.minGiocatori = this.game.min_giocatori;
      toSend.maxGiocatori = this.game.max_giocatori;
      toSend.tipo = this.game.tipo;
      toSend.link = this.game.link;
      toSend.token = tokenValue;

      this.http.put('/game/modifica', toSend).subscribe(
        async (res) => {
          this.modalController.dismiss(true);
          loading.dismiss();
          this.alertCreator.createInfoAlert("Modifica completata", "Il gioco è stato modificato con successo!");
        },
        async (res) => {
          this.modalController.dismiss();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica fallita');
        });
    }
  }

  controllaCampi() {
    if (this.data.value.minGiocatori < 1 || this.data.value.maxGiocatori < 1) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero dei giocatori non può essere negativo!');
      return false;
    }
    if (this.data.value.minGiocatori > this.data.value.maxGiocatori) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero minimo dei giocatori non può essere maggiore del numero massimo!');
      return false;
    }
    return true;
  }
}
