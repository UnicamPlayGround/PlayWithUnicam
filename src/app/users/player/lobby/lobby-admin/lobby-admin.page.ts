import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoadingController } from '@ionic/angular';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-lobby-admin',
  templateUrl: './lobby-admin.page.html',
  styleUrls: ['./lobby-admin.page.scss'],
})
export class LobbyAdminPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];
  private timerInfoLobby: NodeJS.Timeout;
  private timerGiocatori: NodeJS.Timeout;
  private timerPing: NodeJS.Timeout;

  constructor(
    private alertCreator: AlertCreatorService,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerServiceService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
    this.ping();
    this.timerInfoLobby = timerService.getTimer(() => { this.loadInfoLobby() }, 5000);
    this.timerGiocatori = timerService.getTimer(() => { this.loadGiocatori() }, 5000);
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);

    window.addEventListener('beforeunload', (event) => {
      event.returnValue = '';
    });
  }

  ngOnInit() { }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  /**
   * Carica le Informazioni della Lobby, se l'Utente corrente non corrisponde
   * all'Admin della Lobby allora viene reinderizzato alla pagina "/lobby-guest".
   */
  private async loadInfoLobby() {
    const tokenValue = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(tokenValue);

    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
        if (this.lobby.admin_lobby != decodedToken.username) {
          this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
          this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
        }
      },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  /**
   * Carica i Partecipanti alla Lobby.
   */
  private async loadGiocatori() {
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
      },
      async (res) => {
        //TODO rivedere lo stop dei Timer
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  /**
   * Modifica lo stato (Pubblica o Privata) della Lobby.
   */
  async modificaLobby() {
    const loading = await this.loadingController.create();
    await loading.present();

    (await this.lobbyManager.modificaLobby(this.lobby.pubblica)).subscribe(
      async (res) => {
        await loading.dismiss();
        this.alertCreator.createInfoAlert("Lobby Aggiornata", "Lo stato della Lobby è stato aggiornato.");
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica fallita');
      }
    );
  }

  /**
   * Espelle un Giocatore dalla Lobby.
   * @param username Username del Giocatore da espellere
   * @param index Indice del Giocatore da espellere
   */
  async eliminaPartecipante(username, index) {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler espellere il giocatore selezionato?',
      async () => {
        (await this.lobbyManager.eliminaPartecipante(username)).subscribe(
          async (res) => {
            this.giocatori.splice(index, 1);
            this.alertCreator.createInfoAlert("Partecipante eliminato", "Il giocatore " + username + " è stato rimosso.");
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Eliminazione fallita');
          }
        );
      })
  }

  /**
   * Abbandona la Lobby.
   */
  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => {
            this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
            this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Abbandono fallito');
          }
        );
      })
  }

  /**
   * Esegue l'operazione di Ping per segnalare al Server
   * che è ancora presente all'interno della Lobby.
   */
  private async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  /**
   * Inizia una nuova Partita e viene reinderizzato alla pagina del Gioco .
   */
  async iniziaPartita() {
    (await this.lobbyManager.iniziaPartita()).subscribe(
      async (res) => {
        console.log("partita iniziata");
      },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile iniziare la Partita!');
      });
  }

}